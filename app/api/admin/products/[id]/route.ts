import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const client = serviceKey ? createServiceClient(supabaseUrl, serviceKey) : await createClient()

    const { data: product, error } = await client
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching product:", error)
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Explicitly check admin first so other errors don't get masked
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
      .update({
        name,
        description,
        price: Number.parseFloat(price),
        stock_quantity: Number.parseInt(stock_quantity),
        category,
        image_url: image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    const product = Array.isArray(rows) ? rows[0] : rows
    if (!product) {
      return NextResponse.json({ error: "Product not found or not updated" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const client = serviceKey ? createServiceClient(supabaseUrl, serviceKey) : await createClient()

    const { error } = await client.from("products").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
