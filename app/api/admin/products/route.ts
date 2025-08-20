import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    const { name, description, price, stock_quantity, category, image_url } = body

    if (!name || !description || !price || !stock_quantity || !category) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price: Number.parseFloat(price),
        stock_quantity: Number.parseInt(stock_quantity),
        category,
        image_url: image_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
}
