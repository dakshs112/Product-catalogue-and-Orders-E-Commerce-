import Link from "next/link"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function LoginSelectionPage() {
  // If Supabase is not configured, keep the existing message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  // Preserve existing session redirect behaviour
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-2">Choose how you want to sign in</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/auth/login/admin"
            className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-3 text-sm font-medium text-white hover:bg-destructive/90"
          >
            Admin
          </Link>

          <Link
            href="/auth/login/user"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-3 text-sm font-medium text-white hover:bg-accent/90"
          >
            User
          </Link>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          
        </p>
      </div>
    </div>
  )
}
