-- Create user profile on auth.users insert
-- Safe to run multiple times

create extension if not exists pgcrypto;

-- Function to create a profile for a new user
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  -- Insert a user profile row using data from auth.users and metadata
  insert into public.user_profiles (id, email, full_name, role, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'full_name'), new.email),
    coalesce((select role from public.user_profiles where email = new.email), 'user'),
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Ensure the trigger exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- RLS: allow the function (security definer) to insert
grant usage on schema public to authenticated;
grant usage on schema public to anon;
grant insert, select, update on public.user_profiles to authenticated;
grant select on public.user_profiles to anon;

