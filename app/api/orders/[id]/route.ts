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

  // Only allow users to cancel their own orders from the user endpoint
  const allowedStatuses = ["cancelled"]
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Only cancellation is allowed here" }, { status: 400 })
  }

  // Ensure order is currently pending before allowing cancellation
  const { data: existingOrder, error: existingErr } = await supabase
    .from("orders")
    .select("id,status")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (existingErr || !existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  if (existingOrder.status !== "pending") {
    return NextResponse.json({ error: "Only pending orders can be cancelled" }, { status: 400 })
  }

  const { data: updatedRows, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()

  if (error) {
    console.error("Error updating order:", error)
    const message = typeof (error as any)?.message === "string" ? (error as any).message : "Failed to update order"
    const isRls = message.toLowerCase().includes("violates row-level security") || message.toLowerCase().includes("permission denied")
    return NextResponse.json(
      { error: message },
      { status: isRls ? 403 : 500 },
    )
  }

  const order = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows
  if (!order) {
    return NextResponse.json({ error: "Order not found or not updated" }, { status: 404 })
  }

  return NextResponse.json(order)
}
