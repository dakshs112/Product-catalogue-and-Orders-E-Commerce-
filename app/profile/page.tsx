import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions"

export default async function ProfilePage() {
  const { user, profile } = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="grid gap-4 max-w-2xl">
        <div className="p-4 rounded-md border border-border">
          <h2 className="text-xl font-semibold mb-2">Account</h2>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Email:</span> {user.email}</p>
            <p><span className="font-medium">Name:</span> {profile?.full_name || user.user_metadata?.full_name || "—"}</p>
            <p><span className="font-medium">Role:</span> {profile?.role || "user"}</p>
          </div>
        </div>
        <div className="p-4 rounded-md border border-border">
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Phone:</span> {profile?.phone || "—"}</p>
            <p><span className="font-medium">Address:</span> {profile?.address || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


