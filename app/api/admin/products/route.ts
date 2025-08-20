import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await requireAdmin()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const client = serviceKey ? createServiceClient(supabaseUrl, serviceKey) : await createClient()

    const { data: products, error } = await client
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
  } catch {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const client = serviceKey ? createServiceClient(supabaseUrl, serviceKey) : await createClient()
    const body = await request.json()

    const { name, description, price, stock_quantity, category, image_url } = body

    if (!name || !description || !price || !stock_quantity || !category) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const { data: rows, error } = await client
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

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    const product = Array.isArray(rows) ? rows[0] : rows
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
