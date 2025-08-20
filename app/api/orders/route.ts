import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function GET() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's orders with order items and product details
  const { data: orders, error } = await supabase
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
          image_url,
          category
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }

  return NextResponse.json(orders || [])
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { shipping_address, payment_method } = await request.json()

  if (!shipping_address) {
    return NextResponse.json({ error: "Shipping address is required" }, { status: 400 })
  }

  try {
    // Get user's cart items
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        products (
          id,
          name,
          price,
          stock_quantity
        )
      `,
      )
      .eq("user_id", user.id)

    if (cartError) {
      throw new Error("Failed to fetch cart items")
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Check stock availability
    for (const item of cartItems) {
      if (item.products.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${item.products.name}` }, { status: 400 })
      }
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => total + item.products.price * item.quantity, 0)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: "pending",
        shipping_address,
      })
      .select()
      .single()

    if (orderError) {
      throw new Error("Failed to create order")
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.products.id,
      quantity: item.quantity,
      price: item.products.price,
    }))

    const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems)

    if (orderItemsError) {
      throw new Error("Failed to create order items")
    }

    // Update product stock
    for (const item of cartItems) {
      const { error: stockError } = await supabase
        .from("products")
        .update({
          stock_quantity: item.products.stock_quantity - item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.products.id)

      if (stockError) {
        console.error("Error updating stock:", stockError)
      }
    }

    // Clear cart
    const { error: clearCartError } = await supabase.from("cart_items").delete().eq("user_id", user.id)

    if (clearCartError) {
      console.error("Error clearing cart:", clearCartError)
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()

    if (userProfile) {
      const emailData = {
        customerName: userProfile.full_name,
        customerEmail: userProfile.email,
        orderId: order.id,
        orderItems: cartItems.map((item) => ({
          name: item.products.name,
          quantity: item.quantity,
          price: item.products.price,
        })),
        totalAmount: totalAmount,
        shippingAddress: shipping_address,
      }

      // Send email confirmation (non-blocking)
      sendOrderConfirmationEmail(emailData).catch((error) => {
        console.error("Failed to send order confirmation email:", error)
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
