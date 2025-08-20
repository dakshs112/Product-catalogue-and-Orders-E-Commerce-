"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  category: string
  image_url?: string
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch product")
        }
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError("Failed to load product")
      } finally {
        setLoading(false)
      }
    }
    if (params?.id) {
      fetchProduct()
    }
  }, [params?.id])

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading product...</div>
  }

  if (error || !product) {
    return <div className="container mx-auto px-4 py-8">{error || "Product not found"}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>
      <ProductForm
        product={product}
        onSuccess={() => router.push("/admin")}
        onCancel={() => router.back()}
      />
    </div>
  )
}



