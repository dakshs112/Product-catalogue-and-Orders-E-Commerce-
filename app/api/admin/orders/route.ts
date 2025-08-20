import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await requireAdmin()
    // Use service role to bypass RLS for admin-only listing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      // Fallback to session client (may return empty due to RLS). Encourage config.
      const supabase = await createClient()
      const { data: fallbackOrders, error: fbError } = await supabase
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

      if (fbError) {
        console.error("Error fetching orders:", fbError)
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
      }

      return NextResponse.json(fallbackOrders || [])
    }

    const adminClient = createServiceClient(supabaseUrl, serviceKey)

    // Get all orders with customer details and order items
    const { data: orders, error } = await adminClient
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
