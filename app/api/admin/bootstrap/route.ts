// ...existing code...
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get("token") ?? ""
    const expected = process.env.ADMIN_BOOTSTRAP_TOKEN ?? ""

    if (!token || token !== expected) {
      return NextResponse.json({ ok: false, error: "Invalid or missing bootstrap token" }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_FULL_NAME ?? "Admin User"

    if (!supabaseUrl || !serviceKey || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { ok: false, error: "Missing required env (SUPABASE URL / SERVICE_ROLE_KEY / ADMIN_EMAIL / ADMIN_PASSWORD)" },
        { status: 500 }
      )
    }

    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    // Try to create the auth user (admin). If user already exists we'll try to find the id.
    let userId: string | null = null
    try {
      // admin.createUser is available on Supabase JS admin API; if your SDK is different adapt accordingly
      // Use a try to avoid whole-route failure if the createUser call returns an error
      // @ts-ignore
      const { data: createData, error: createErr } = await adminClient.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        user_metadata: { full_name: adminName },
        email_confirm: true
      })

      if (createErr && !createData) {
        // proceed — user may already exist
        // continue to lookup below
      } else if (createData?.user?.id) {
        // created new user
        // @ts-ignore
        userId = createData.user.id
      }
    } catch (e) {
      // ignore here and fallback to lookup by profile table
    }

    // If createUser didn't return an id, attempt to find existing profile row by email
    if (!userId) {
      const { data: profiles, error: profileErr } = await adminClient
        .from("user_profiles")
        .select("id,email,full_name")
        .eq("email", adminEmail)
        .limit(1)

      if (profileErr) {
        return NextResponse.json({ ok: false, error: "Failed to query user_profiles: " + profileErr.message }, { status: 500 })
      }

      if (profiles && Array.isArray(profiles) && profiles.length > 0) {
        // use the profile id
        // @ts-ignore
        userId = profiles[0].id
      }
    }

    // As a last attempt, try to query auth.users via admin client (if SDK supports listing)
    if (!userId) {
      try {
        // @ts-ignore - attempt admin API listUsers (SDK may vary)
        const { data: listData, error: listErr } = await adminClient.auth.admin.listUsers?.({ filter: `email=eq.${adminEmail}` }) ?? {}
        // try to extract id if available
        // @ts-ignore
        if (listData?.users && listData.users.length > 0) userId = listData.users[0].id
        if (listErr) {
          // ignore, we'll fallback to error below
        }
      } catch {
        // ignore
      }
    }

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Could not determine user id. Create the user manually or ensure createUser/listUsers is available." },
        { status: 500 }
      )
    }

    // Upsert the profile row with role = 'admin' using the service client to bypass RLS
    const upsertPayload = {
      id: userId,
      full_name: adminName,
      email: adminEmail,
      role: "admin",
      updated_at: new Date().toISOString()
    }

    const { error: upsertErr } = await adminClient.from("user_profiles").upsert([upsertPayload], { onConflict: "id" })

    if (upsertErr) {
      return NextResponse.json({ ok: false, error: "Failed to upsert user_profiles: " + upsertErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: userId })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
// ...existing code...