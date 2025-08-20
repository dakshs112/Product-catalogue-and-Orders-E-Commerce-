import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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

  // Get cart items with product details
  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(
      `
      id,
      quantity,
      created_at,
      products (
        id,
        name,
        description,
        price,
        image_url,
        category,
        stock_quantity
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching cart items:", error)
    return NextResponse.json({ error: "Failed to fetch cart items" }, { status: 500 })
  }

  return NextResponse.json(cartItems || [])
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

  const { product_id, quantity = 1 } = await request.json()

  if (!product_id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  // Check if item already exists in cart
  // Ensure a profile row exists to satisfy foreign key on cart_items
  const { data: existingProfile, error: profileFetchError } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (profileFetchError) {
    console.error("Error checking user profile before cart insert:", profileFetchError)
  }

  if (!existingProfile) {
    const { error: profileInsertError } = await supabase.from("user_profiles").insert({
      id: user.id,
      email: user.email,
      full_name: (user.user_metadata as any)?.full_name || user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    if (profileInsertError) {
      console.error("Error creating user profile before cart insert:", profileInsertError)
      return NextResponse.json({ error: "Failed to add cart item" }, { status: 500 })
    }
  }

  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", product_id)
    .maybeSingle()

  if (existingItem) {
    // Update existing item quantity
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity, updated_at: new Date().toISOString() })
      .eq("id", existingItem.id)
      .select()

    if (error) {
      console.error("Error updating cart item:", error)
      return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } else {
    // Add new item to cart
    const { data, error } = await supabase
      .from("cart_items")
      .insert({
        user_id: user.id,
        product_id,
        quantity,
      })
      .select()

    if (error) {
      console.error("Error adding cart item:", error)
      return NextResponse.json({ error: "Failed to add cart item" }, { status: 500 })
    }

    return NextResponse.json(data[0])
  }
}
