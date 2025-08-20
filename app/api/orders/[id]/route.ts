import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get specific order with details
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      total_amount,
      status,
      shipping_address,
      created_at,
      updated_at,
      order_items (
        id,
        quantity,
        price,
        products (
          id,
          name,
          description,
          image_url,
          category
        )
      )
    `,
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json(order)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { status } = await request.json()

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 })
  }

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }

  return NextResponse.json(order)
}
