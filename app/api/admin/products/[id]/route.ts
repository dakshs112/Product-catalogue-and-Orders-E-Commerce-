import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: product, error } = await supabase
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
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase.from("products").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
}
