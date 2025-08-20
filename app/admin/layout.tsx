import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUser()
  const isAdminByEmail = !!process.env.ADMIN_EMAIL && user?.email?.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
  const isAdmin = profile?.role === "admin" || isAdminByEmail
  if (!user || !isAdmin) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="py-8">{children}</main>
    </div>
  )
}



