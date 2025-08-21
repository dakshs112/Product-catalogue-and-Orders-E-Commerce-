import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // keep existing behaviour
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const inStock = searchParams.get("inStock")
  
    const supabase = await createClient()
  
    let query = supabase.from("products").select("*", { count: "exact" })
  
    if (category && category !== "all") {
      query = query.eq("category", category)
    }
  
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
  
    if (minPrice) {
      query = query.gte("price", Number.parseFloat(minPrice))
    }
    if (maxPrice) {
      query = query.lte("price", Number.parseFloat(maxPrice))
    }
  
    if (inStock === "true") {
      query = query.gt("stock_quantity", 0)
    }
  
    const validSortFields = ["name", "price", "created_at", "stock_quantity"]
    const validSortOrders = ["asc", "desc"]
  
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query = query.order(sortBy, { ascending: sortOrder === "asc" })
    }
  
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
  
    const { data: products, error, count } = await query
  
    if (error) {
      console.error("Error fetching products:", error)
      // return the real error message to help debugging (temporary)
      return NextResponse.json({ error: error.message || "Failed to fetch products", raw: error }, { status: 500 })
    }
  
    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: page * limit < (count || 0),
        hasPrev: page > 1,
      },
    })
  } catch (err) {
    console.error("Unhandled error in products route:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
