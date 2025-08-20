"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ProductFilters } from "@/components/product-filters"
import { ProductGrid } from "@/components/product-grid"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/cart-context"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock_quantity: number
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const { addToCart } = useCart()

  // Fetch categories
  useEffect(() => {
    // Check current user role (admin or not) - prefer cached role for snappy UI
    try {
      const cachedRole = typeof window !== "undefined" ? window.localStorage.getItem("profileRole") : null
      if (cachedRole) {
        setIsAdmin(cachedRole === "admin")
      }
    } catch {}
    const checkUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(Boolean(data?.isAdmin || data?.profile?.role === "admin"))
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("profileRole", (data?.isAdmin || data?.profile?.role === "admin") ? "admin" : "user")
            }
          } catch {}
        } else {
          setIsAdmin(false)
        }
      } catch {
        setIsAdmin(false)
      }
    }
    checkUser()

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedCategory !== "all") {
          params.append("category", selectedCategory)
        }
        if (searchQuery) {
          params.append("search", searchQuery)
        }
        if (priceRange && priceRange.length >= 2) {
          params.append("minPrice", priceRange[0].toString())
          params.append("maxPrice", priceRange[1].toString())
        }
        params.append("sortBy", sortBy)
        params.append("page", currentPage.toString())

        const response = await fetch(`/api/products?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
          setTotalPages(data.pagination?.totalPages || 1)
        } else {
          throw new Error("Failed to fetch products")
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setProducts([])
        setTotalPages(1)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, searchQuery, priceRange, sortBy, currentPage, toast])

  const handleAddToCart = async (product: Product) => {
    await addToCart(product.id)
  }

  const handleViewDetails = (product: Product) => {
    toast({
      title: product.name,
      description: `Price: $${product.price.toFixed(2)} | Stock: ${product.stock_quantity} units`,
    })
  }

  const handleClearFilters = () => {
    setSelectedCategory("all")
    setSearchQuery("")
    setPriceRange([0, 1000])
    setSortBy("name")
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Product Catalogue</h1>
          <p className="text-muted-foreground text-lg">Discover our amazing collection of products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              priceRange={priceRange}
              sortBy={sortBy}
              onCategoryChange={setSelectedCategory}
              onSearchChange={setSearchQuery}
              onPriceRangeChange={setPriceRange}
              onSortChange={setSortBy}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">{loading ? "Loading..." : `${products.length} products found`}</p>
            </div>

            <ProductGrid
              products={products}
              loading={loading}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">ProductStore</h3>
              <p className="text-muted-foreground text-sm">Your trusted online marketplace for quality products.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-4">Follow Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ProductStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
