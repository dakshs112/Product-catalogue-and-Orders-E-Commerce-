"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, MenuIcon, XIcon } from "lucide-react"
import { CartDrawer } from "./cart-drawer"
import { UserMenu } from "./user-menu"
import { useCart } from "@/contexts/cart-context"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const { getTotalItems } = useCart()
  const cartItemCount = getTotalItems()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setProfile(data.profile)
          setIsAdmin(Boolean(data?.isAdmin || data?.profile?.role === "admin"))
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("profileRole", (data?.isAdmin || data?.profile?.role === "admin") ? "admin" : "user")
            }
          } catch {}
        }
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-primary">ProductStore</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-foreground hover:text-accent transition-colors">
              Products
            </Link>
            {user && !isAdmin && (
              <Link href="/orders" className="text-foreground hover:text-accent transition-colors">
                Orders
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-foreground hover:text-accent transition-colors">
                Admin
              </Link>
            )}
            
            {!isAdmin && (
              <>
                <Link href="/about" className="text-foreground hover:text-accent transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-foreground hover:text-accent transition-colors">
                  Contact
                </Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <UserMenu user={user} />
                ) : (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button size="sm" className="bg-accent hover:bg-accent/90">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            <CartDrawer>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-foreground hover:text-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              {user && !isAdmin && (
                <Link
                  href="/orders"
                  className="text-foreground hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Orders
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-foreground hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              
              {!isAdmin && (
                <>
                  <Link
                    href="/about"
                    className="text-foreground hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="text-foreground hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </>
              )}
              {!user && (
                <>
                  <Link
                    href="/auth/login"
                    className="text-foreground hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    className="text-foreground hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
