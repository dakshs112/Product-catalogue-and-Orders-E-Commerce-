import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    const body = await request.blob()

    const blob = await put(filename, body, {
      access: "public",
    })

    return NextResponse.json(blob)
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Admin access required or upload failed" }, { status: 403 })
  }
}
