import LoginForm from "@/components/login-form"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLoginPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) redirect("/")

  const adminEmail = process.env.ADMIN_EMAIL ?? null

  // Render client LoginForm with admin props
  // @ts-ignore - rendering client inside server component
  return <LoginForm role="admin" defaultEmail={adminEmail} lockEmail={true} />
}