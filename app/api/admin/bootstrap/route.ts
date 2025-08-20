import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// This route creates a predefined admin user using the service role via Supabase Admin API
// It is guarded by a secret token to prevent abuse. Remove/disable after initial bootstrap.

async function handleBootstrap(request: Request) {
  const token = process.env.ADMIN_BOOTSTRAP_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 })
  }

  const url = new URL(request.url)
  const headerToken = request.headers.get("x-bootstrap-token")
  const queryToken = url.searchParams.get("token")
  if (headerToken !== token && queryToken !== token) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const email = process.env.ADMIN_EMAIL || "admin@example.com"
  const password = process.env.ADMIN_PASSWORD || "ChangeMe!123"

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 })
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apiKey: serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Admin User" },
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({} as any))
      return NextResponse.json({ error: err.error_description || err.message || res.statusText }, { status: 500 })
    }

    const { id } = await res.json()

    const supabase = await createClient()
    await supabase
      .from("user_profiles")
      .update({ role: "admin", updated_at: new Date().toISOString() })
      .eq("id", id)

    return NextResponse.json({ success: true, email })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return handleBootstrap(request)
}

export async function GET(request: Request) {
  return handleBootstrap(request)
}


