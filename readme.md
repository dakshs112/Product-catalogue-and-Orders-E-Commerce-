# ProductStore – Online Product Catalogue

A modern e-commerce storefront built with Next.js, Supabase, and a custom UI kit.  
Features authentication, product browsing, cart and checkout, and an admin dashboard for managing products and orders.

---

## Features

- **Authentication**: Sign up and sign in with email/password.  
  - Role selection: Choose "Admin" or "User" before login.
  - Admin sign-in restricted to the configured admin email.
- **Product Catalogue**: Browse, search, filter, and sort products.
- **Cart & Checkout**: Add products to cart, place orders, and view order history.
- **Admin Dashboard**: Manage products and orders (admin only).
- **Responsive UI**: Custom sidebar, menubar, and card components.
- **Supabase Integration**: Auth, database, and RLS policies for secure data access.

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback

ADMIN_BOOTSTRAP_TOKEN=your-bootstrap-token
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-admin-password
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 4. Set up Supabase

- Create a Supabase project.
- Add tables: `products`, `user_profiles`, `orders`, etc.
- Enable Row Level Security (RLS) and apply recommended policies (see below).
- Add triggers for profile creation after sign-up.

### 5. Run the development server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Role-based Authentication

- On the login page, users choose "Admin" or "User".
- Admin sign-in is restricted to the configured `ADMIN_EMAIL`.
- The login form and server actions enforce this restriction.

---

## Supabase RLS Policies (Recommended)

**Products Table (public read):**
```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products"
  ON public.products
  FOR SELECT
  USING (TRUE);
```

**User Profiles Table (owner-only):**
```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Select own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Delete own profile" ON public.user_profiles FOR DELETE USING (auth.uid() = id);
```

**Admin Check Helper:**
```sql
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r_role text;
BEGIN
  SELECT role INTO r_role FROM public.user_profiles WHERE id = uid;
  RETURN r_role = 'admin';
END;
$$;
```

---

## Project Structure

- `/app` – Next.js app routes and pages
- `/components` – UI components (cards, sidebar, forms, etc.)
- `/lib` – Supabase client/server helpers, actions
- `/styles` – Global and component CSS
- `/hooks` – Custom React hooks

---

## Deployment

- Deploy to Vercel or your preferred platform.
- Set all environment variables in your deployment environment.

---

## Credits

Built by Daksh Sharma for the internship task assigned by Kredo Analytics.

---

## License

MIT