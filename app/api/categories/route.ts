import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: categories, error } = await supabase.from("products").select("category").not("category", "is", null)

    if (error) {
      console.error("Error fetching categories:", error)
      return NextResponse.json({ error: error.message || "Failed to fetch categories", raw: error }, { status: 500 })
    }

    const uniqueCategories = [...new Set(categories.map((item) => item.category))]

    return NextResponse.json(uniqueCategories)
  } catch (err) {
    console.error("Unhandled error in categories route:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
