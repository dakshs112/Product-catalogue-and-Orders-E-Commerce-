import { ProductList } from "@/components/admin/product-list"

export default async function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin: Product Management</h1>
        <p className="text-gray-600">Add, edit, and delete products</p>
      </div>

      <ProductList />
    </div>
  )
}
