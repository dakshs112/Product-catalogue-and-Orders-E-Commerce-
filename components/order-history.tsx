"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Package, Calendar, MapPin, Eye } from "lucide-react"

interface Product {
  id: string
  name: string
  image_url: string
  category: string
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  products: Product
}

interface Order {
  id: string
  total_amount: number
  status: string
  shipping_address: string
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders")
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        } else if (response.status === 401) {
          toast({
            title: "Please sign in",
            description: "You need to be signed in to view your orders.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
        <p className="text-muted-foreground">When you place orders, they will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
              <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(order.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {order.order_items.length} {order.order_items.length === 1 ? "item" : "items"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Order Items */}
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={item.products.image_url || "/placeholder.svg"}
                      alt={item.products.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.products.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.products.category} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Shipping to: {order.shipping_address.split("\n")[0]}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">${order.total_amount.toFixed(2)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              {order.status === "pending" && (
                <Button variant="outline" size="sm">
                  Cancel Order
                </Button>
              )}
              {order.status === "delivered" && (
                <Button variant="outline" size="sm">
                  Reorder
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
