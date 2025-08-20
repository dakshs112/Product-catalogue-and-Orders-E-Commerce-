import { AdminOrderList } from "@/components/admin/order-list"

export default async function AdminOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminOrderList />
    </div>
  )
}
