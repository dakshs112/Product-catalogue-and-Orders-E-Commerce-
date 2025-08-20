import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function handleGrant() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminEmail = process.env.ADMIN_EMAIL

  // Allow bootstrap: if no admin exists yet, first caller becomes admin
  const { data: adminExists } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)

  const isBootstrap = !adminExists || adminExists.length === 0
  const isAllowedByEmail = !!adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()

  if (!isBootstrap && !isAllowedByEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Use a SECURITY DEFINER function to bypass trigger protections safely
  const { error: rpcError } = await supabase.rpc("grant_admin", { user_id: user.id })
  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function POST() {
  return handleGrant()
}

export async function GET() {
  return handleGrant()
}


