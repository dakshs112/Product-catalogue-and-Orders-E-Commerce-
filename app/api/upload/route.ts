import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    // Read incoming file bytes
    const contentType = request.headers.get("content-type") || "application/octet-stream"
    const bodyArrayBuffer = await request.arrayBuffer()
    const bodyUint8 = new Uint8Array(bodyArrayBuffer)

    // If Vercel Blob token is configured, prefer that
    const hasVercelBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN)
    if (hasVercelBlobToken) {
      const blob = await put(filename, new Blob([bodyUint8], { type: contentType }), {
        access: "public",
      })
      return NextResponse.json({ url: blob.url })
    }

    // Fallback: upload to Supabase Storage bucket `product-images`
    const supabase = await createClient()
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filename, bodyUint8, { contentType, upsert: true })

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(uploadData.path)
    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Admin access required or upload failed" }, { status: 403 })
  }
}
