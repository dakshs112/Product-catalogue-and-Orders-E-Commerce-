"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const fullName = formData.get("fullName")

  if (!email || !password || !fullName) {
    return { error: "All fields are required" }
  }

  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        data: {
          full_name: fullName.toString(),
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    // Profile creation is handled by a DB trigger after auth sign-up

    return { success: "Check your email to confirm your account." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function getCurrentUser() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { user: null, profile: null, error: authError?.message }
    }

    // Try to get the user's profile; do not treat missing row as an error
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return { user, profile: null, error: profileError.message }
    }

    // If profile doesn't exist yet, create it on the fly (RLS allows auth.uid() = id)
    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: (user.user_metadata as any)?.full_name || user.email,
          role: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single()

      if (insertError) {
        console.error("Error creating user profile:", insertError)
        return { user, profile: null, error: insertError.message }
      }

      return { user, profile: newProfile, error: null }
    }

    return { user, profile, error: null }
  } catch (error) {
    console.error("Error getting current user:", error)
    return { user: null, profile: null, error: "Failed to get user information" }
  }
}

export async function isAdmin() {
  const { user, profile } = await getCurrentUser()
  const adminEmail = process.env.ADMIN_EMAIL
  const isAdminByEmail = !!adminEmail && user?.email?.toLowerCase() === adminEmail.toLowerCase()
  return profile?.role === "admin" || isAdminByEmail || false
}
