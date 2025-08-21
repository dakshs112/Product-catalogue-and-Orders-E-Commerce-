"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { signIn } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-medium rounded-lg h-[60px]">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

export default function LoginForm({
  role,
  defaultEmail,
  lockEmail,
}: {
  role?: "admin" | "user"
  defaultEmail?: string | null
  lockEmail?: boolean
}) {
  const [state, formAction] = useActionState(signIn, null)
  const router = useRouter()
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (state?.success) {
      try {
        router.push("/")
      } catch {}
    }
  }, [state, router])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setLocalError(null)
    if (role === "admin" && defaultEmail) {
      const form = e.currentTarget
      const formData = new FormData(form)
      const email = String(formData.get("email") ?? "")
      if (email.toLowerCase() !== (defaultEmail || "").toLowerCase()) {
        e.preventDefault()
        setLocalError("Admin sign-in is restricted to the designated admin email.")
        return
      }
    }
    // allow submission
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-bold text-primary">
          {role === "admin" ? "Admin Sign In" : role === "user" ? "User Sign In" : "Sign In"}
        </CardTitle>
        <p className="text-muted-foreground">Sign in to continue</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs ${role === "user" ? "bg-accent text-white" : "bg-muted text-muted-foreground"}`}>User</span>
          <span className={`px-3 py-1 rounded-full text-xs ${role === "admin" ? "bg-destructive text-white" : "bg-muted text-muted-foreground"}`}>Admin</span>
        </div>
      </CardHeader>

      <CardContent>
        <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
          {(localError || state?.error) && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm">
              {localError ?? state?.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input id="email" name="email" type="email" placeholder="you@example.com" required defaultValue={defaultEmail ?? undefined} readOnly={Boolean(lockEmail)} className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input id="password" name="password" type="password" placeholder="Password" required className="pl-10 bg-input border-border text-foreground" />
              </div>
            </div>
          </div>

          {role && <input type="hidden" name="role" value={role} />}

          <SubmitButton />

          <div className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="text-accent hover:text-accent/80 font-medium">Sign up</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
