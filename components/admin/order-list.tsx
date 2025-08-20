"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Package, User, MapPin, Calendar } from "lucide-react"

interface OrderItem {
  id: string
  quantity: number
  price: number
  products: {
    id: string
    name: string
    image_url?: string
    category: string
  }
}

interface Order {
  id: string
  total_amount: number
  status: string
  shipping_address: string
  created_at: string
  updated_at: string
  user_profiles: {
    id: string
    full_name: string
    email: string
    phone?: string
  }
  order_items: OrderItem[]
}

export function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      toast({
        title: "Success",
        description: "Order status updated successfully",
      })

      fetchOrders()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

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

  if (isLoading) {
    return <div className="text-center py-8">Loading orders...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <Badge variant="outline">{orders.length} Total Orders</Badge>
      </div>

      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {order.user_profiles.full_name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${order.total_amount.toFixed(2)}</div>
                  <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Details
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Name:</strong> {order.user_profiles.full_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.user_profiles.email}
                    </p>
                    {order.user_profiles.phone && (
                      <p>
                        <strong>Phone:</strong> {order.user_profiles.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </h4>
                  <p className="text-sm">{order.shipping_address}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Items
                </h4>
                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.products.name}</span>
                        <span className="text-sm text-gray-600 ml-2">({item.products.category})</span>
                      </div>
                      <div className="text-right">
                        <div>Qty: {item.quantity}</div>
                        <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <label className="text-sm font-medium">Update Status:</label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                    disabled={updatingStatus === order.id}
                  >
                    <SelectTrigger className="w-40 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-600">Last updated: {new Date(order.updated_at).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && <div className="text-center py-8 text-gray-500">No orders found.</div>}
    </div>
  )
}
