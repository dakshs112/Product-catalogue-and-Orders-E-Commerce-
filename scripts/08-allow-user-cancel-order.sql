-- Allow users to cancel their own pending orders (RLS update policy)
-- This policy restricts updates to the user's own orders where current status = 'pending'
-- and ensures the new status is 'cancelled'.

ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can cancel own pending orders" ON public.orders;
CREATE POLICY "Users can cancel own pending orders" ON public.orders
  FOR UPDATE
  USING (
    auth.uid() = user_id AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id AND status = 'cancelled'
  );


