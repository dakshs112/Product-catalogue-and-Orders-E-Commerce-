import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase.from("products").select("category").not("category", "is", null)

  if (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }

  // Get unique categories
  const uniqueCategories = [...new Set(categories.map((item) => item.category))]

  return NextResponse.json(uniqueCategories)
}
