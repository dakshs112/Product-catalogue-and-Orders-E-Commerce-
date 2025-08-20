-- Prevent non-admins from changing the role field
-- Allows change when a privileged function sets a session flag

create or replace function public.prevent_non_admin_role_change()
returns trigger as $$
declare
  allow_grant text;
begin
  -- Allow if role is unchanged
  if new.role is not distinct from old.role then
    return new;
  end if;

  -- Allow when privileged flow enables grant in-session
  allow_grant := current_setting('app.allow_role_grant', true);
  if coalesce(allow_grant, 'false') = 'true' then
    return new;
  end if;

  -- Allow if the current user is an admin
  if exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid() and up.role = 'admin'
  ) then
    return new;
  end if;

  -- Otherwise, block
  raise exception 'Only admins can change user roles';
end;
$$ language plpgsql security definer set search_path = public;

-- Allow authenticated users to call the function
grant execute on function public.grant_admin(uuid) to authenticated;

drop trigger if exists trg_protect_role_update on public.user_profiles;
create trigger trg_protect_role_update
  before update of role on public.user_profiles
  for each row execute function public.prevent_non_admin_role_change();

-- Secure function to grant admin with server-side checks
create or replace function public.grant_admin(user_id uuid)
returns void as $$
declare
  admin_count integer;
begin
  -- bootstrap allowed if no admin exists
  select count(*) into admin_count from public.user_profiles where role = 'admin';
  if admin_count = 0 then
    set local app.allow_role_grant = 'true';
    update public.user_profiles set role = 'admin', updated_at = now() where id = user_id;
    return;
  end if;

  -- otherwise, require caller to already be admin (endpoint will additionally restrict by email)
  if exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin') then
    set local app.allow_role_grant = 'true';
    update public.user_profiles set role = 'admin', updated_at = now() where id = user_id;
    return;
  end if;

  raise exception 'Insufficient privileges to grant admin';
end;
$$ language plpgsql security definer set search_path = public;


