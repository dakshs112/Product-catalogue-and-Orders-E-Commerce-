import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUser()
  const isAdminByEmail = !!process.env.ADMIN_EMAIL && user?.email?.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
  const isAdmin = profile?.role === "admin" || isAdminByEmail
  if (!user || !isAdmin) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/admin">
            <Button variant="secondary" size="sm">Products</Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="secondary" size="sm">Orders</Button>
          </Link>
        </div>
      </div>
      <main className="py-8">{children}</main>
    </div>
  )
}



