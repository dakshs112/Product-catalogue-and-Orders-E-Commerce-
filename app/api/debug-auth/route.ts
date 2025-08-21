import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null

  const headersObj: Record<string, string> = {}
  for (const [k, v] of req.headers.entries()) headersObj[k] = v

  return NextResponse.json({
    ok: true,
    env: { hasServiceKey, hasAnonKey, supabaseUrl },
    headers: headersObj,
    note:
      "This route intentionally avoids importing server libraries to prevent type/runtime errors. To inspect user_profiles run the SQL queries provided in the next step."
  })
}