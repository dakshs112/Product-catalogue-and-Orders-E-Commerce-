"use client"

import { Header } from "@/components/header"
import { OrderHistory } from "@/components/order-history"

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Order History</h1>
          <p className="text-muted-foreground text-lg">Track and manage your orders</p>
        </div>

        <OrderHistory />
      </main>
    </div>
  )
}
