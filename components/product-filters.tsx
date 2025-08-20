"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Search, X, SlidersHorizontal } from "lucide-react"

interface ProductFiltersProps {
  categories: string[]
  selectedCategory: string
  searchQuery: string
  minPrice: number
  maxPrice: number
  sortBy: string
  sortOrder: string
  inStock: boolean
  onCategoryChange: (category: string) => void
  onSearchChange: (search: string) => void
  onPriceRangeChange: (min: number, max: number) => void
  onSortChange: (sortBy: string, sortOrder: string) => void
  onInStockChange: (inStock: boolean) => void
  onClearFilters: () => void
}

export function ProductFilters({
  categories,
  selectedCategory,
  searchQuery,
  minPrice,
  maxPrice,
  sortBy,
  sortOrder,
  inStock,
  onCategoryChange,
  onSearchChange,
  onPriceRangeChange,
  onSortChange,
  onInStockChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice])
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearchChange(localSearch)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [localSearch, onSearchChange])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onPriceRangeChange(priceRange[0], priceRange[1])
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [priceRange, onPriceRangeChange])

  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery !== "" ||
    minPrice > 0 ||
    maxPrice < 1000 ||
    inStock ||
    sortBy !== "created_at" ||
    sortOrder !== "desc"

  return (
    <Card className="bg-sidebar border-sidebar-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-sidebar-foreground">Filters</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-muted-foreground hover:text-foreground"
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              Advanced
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium text-sidebar-foreground">
            Search Products
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="search"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-sidebar-foreground">Sort By</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={sortBy} onValueChange={(value) => onSortChange(value, sortOrder)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="stock_quantity">Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value) => onSortChange(sortBy, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-sidebar-foreground">Categories</Label>
          <div className="space-y-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => onCategoryChange("all")}
              className="w-full justify-start text-left"
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className="w-full justify-start text-left"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-sidebar-foreground">Price Range</Label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Stock Filter */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={inStock}
                  onCheckedChange={(checked) => onInStockChange(checked as boolean)}
                />
                <Label htmlFor="inStock" className="text-sm font-medium text-sidebar-foreground">
                  In Stock Only
                </Label>
              </div>
            </div>
          </>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-sidebar-foreground">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCategory}
                  <button onClick={() => onCategoryChange("all")} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  "{searchQuery}"
                  <button
                    onClick={() => {
                      setLocalSearch("")
                      onSearchChange("")
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {(minPrice > 0 || maxPrice < 1000) && (
                <Badge variant="secondary" className="text-xs">
                  ${minPrice} - ${maxPrice}
                  <button onClick={() => setPriceRange([0, 1000])} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {inStock && (
                <Badge variant="secondary" className="text-xs">
                  In Stock
                  <button onClick={() => onInStockChange(false)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
