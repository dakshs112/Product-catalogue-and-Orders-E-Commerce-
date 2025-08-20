import { createClient } from "@/lib/supabase/server"

export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile, error } = await supabase.from("user_profiles").select("role").eq("id", user.id).maybeSingle()

  const adminEmail = process.env.ADMIN_EMAIL
  const isAdminByEmail = !!adminEmail && user?.email?.toLowerCase() === adminEmail.toLowerCase()

  if (error) {
    throw new Error("Admin access required")
  }

  if (!(profile?.role === "admin" || isAdminByEmail)) {
    throw new Error("Admin access required")
  }

  return { user, profile }
}

export async function getUserRole(userId: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase.from("user_profiles").select("role").eq("id", userId).single()

  if (error) {
    return null
  }

  return profile?.role || "user"
}
