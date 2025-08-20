import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const client = serviceKey ? createServiceClient(supabaseUrl, serviceKey) : await createClient()
    const { status } = await request.json()

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const { data: order, error } = await client
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .limit(1)

    if (error) {
      console.error("Error updating order status:", error)
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    const updated = Array.isArray(order) ? order[0] : order
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
}
