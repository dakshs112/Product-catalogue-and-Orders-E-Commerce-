"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { CheckoutForm } from "@/components/checkout-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft } from "lucide-react"

export default function CheckoutPage() {
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState("")
  const router = useRouter()

  const handleOrderComplete = (id: string) => {
    setOrderId(id)
    setOrderComplete(true)
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Thank you for your order. Your order #{orderId.slice(0, 8)} has been received and is being processed.
                </p>
                <p className="text-sm text-muted-foreground">
                  You will receive an email confirmation shortly with your order details and tracking information.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <Button onClick={() => router.push("/orders")} variant="outline">
                    View Orders
                  </Button>
                  <Button onClick={() => router.push("/")} className="bg-accent hover:bg-accent/90">
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-primary mb-2">Checkout</h1>
          <p className="text-muted-foreground text-lg">Complete your order</p>
        </div>

        <CheckoutForm onOrderComplete={handleOrderComplete} />
      </main>
    </div>
  )
}
