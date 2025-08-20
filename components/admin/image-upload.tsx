"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Upload, X, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUpload: (url: string) => void
  onImageRemove: () => void
}

export function ImageUpload({ currentImageUrl, onImageUpload, onImageRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const filename = `product-${Date.now()}-${file.name}`
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const blob = await response.json()
      setPreviewUrl(blob.url)
      onImageUpload(blob.url)

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageRemove()
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Product Image</Label>

      {previewUrl ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img src={previewUrl || "/placeholder.svg"} alt="Product preview" className="w-full h-full object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="text-sm text-gray-600">Click to upload an image</div>
              <div className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</div>
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <Button type="button" variant="outline" disabled={isUploading} asChild>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Choose Image"}
              </Label>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
