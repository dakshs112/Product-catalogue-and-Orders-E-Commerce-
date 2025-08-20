"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, Pencil } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock_quantity: number
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onViewDetails: (product: Product) => void
  isAdmin?: boolean
}

export function ProductCard({ product, onAddToCart, onViewDetails, isAdmin }: ProductCardProps) {
  const isOutOfStock = product.stock_quantity === 0
  const [derivedIsAdmin, setDerivedIsAdmin] = useState<boolean | null>(() => {
    if (typeof isAdmin === "boolean") return isAdmin
    try {
      if (typeof window !== "undefined") {
        const cachedRole = window.localStorage.getItem("profileRole")
        if (cachedRole) return cachedRole === "admin"
      }
    } catch {}
    return null
  })
  const router = useRouter()

  useEffect(() => {
    // If caller passed isAdmin, respect it. Otherwise, use cached role or fetch once.
    if (typeof isAdmin === "boolean") {
      setDerivedIsAdmin(isAdmin)
      return
    }
    try {
      const cachedRole = typeof window !== "undefined" ? window.localStorage.getItem("profileRole") : null
      if (cachedRole) {
        setDerivedIsAdmin(cachedRole === "admin")
        return
      }
    } catch {}
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setDerivedIsAdmin(Boolean(data?.isAdmin || data?.profile?.role === "admin"))
        } else {
          setDerivedIsAdmin(false)
        }
      } catch {
        setDerivedIsAdmin(false)
      }
    }
    checkUser()
  }, [isAdmin])

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm font-medium">
              Out of Stock
            </Badge>
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">{product.category}</Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">{product.stock_quantity} in stock</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(product)} className="flex-1">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
        {derivedIsAdmin ? (
          <Button
            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
            size="sm"
            className="flex-1 bg-accent hover:bg-accent/90"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Product
          </Button>
        ) : null}
        {!derivedIsAdmin && (
          <Button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            size="sm"
            className="flex-1 bg-accent hover:bg-accent/90"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
