import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(null, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single()

  const adminEmail = process.env.ADMIN_EMAIL
  const isAdminByEmail = !!adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()
  const isAdmin = profile?.role === "admin" || isAdminByEmail

  return NextResponse.json({ user, profile, isAdmin })
}


