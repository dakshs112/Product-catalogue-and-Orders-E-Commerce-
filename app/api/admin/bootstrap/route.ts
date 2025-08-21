// ...existing code...
import { NextResponse } from "next/server"

function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {}
  if (!cookieHeader) return cookies
  for (const pair of cookieHeader.split(";")) {
    const [k, ...v] = pair.split("=")
    const key = k?.trim()
    if (!key) continue
    cookies[key] = decodeURIComponent((v || []).join("=").trim())
  }
  return cookies
}

export async function GET(request: Request) {
  const env = {
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
  }

  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  const cookies = parseCookies(request.headers.get("cookie"))

  return NextResponse.json({
    ok: true,
    env,
    headers,
    cookies,
    note:
      "Minimal debug route — does not import Supabase or other server libs to avoid runtime/type errors."})}