-- Production RLS hardening

-- Products: enable RLS and define policies
alter table if exists public.products enable row level security;

-- Public read access to products
drop policy if exists "Products are publicly readable" on public.products;
create policy "Products are publicly readable" on public.products
  for select to public using (true);

-- Admin full manage on products
drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products" on public.products
  for all using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Orders: allow admins to view/manage all orders in addition to user-owned policies
drop policy if exists "Admins can manage all orders" on public.orders;
create policy "Admins can manage all orders" on public.orders
  for all using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Order items: allow admins to view/manage all order items
drop policy if exists "Admins can manage all order items" on public.order_items;
create policy "Admins can manage all order items" on public.order_items
  for all using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Optional: limit cart_items strictly to owners (already present), no admin override needed


