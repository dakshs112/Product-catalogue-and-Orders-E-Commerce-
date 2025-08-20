import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Get all orders with customer details and order items
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
        user_profiles (
          id,
          full_name,
          email,
          phone
        ),
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
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    return NextResponse.json(orders || [])
  } catch (error) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
}
