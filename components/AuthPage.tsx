"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function AuthPage({ type }: { type: "signup" | "login" }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    const { error } =
      type === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert(type === "signup" ? "Signup successful!" : "Login successful!")
      router.push("/") // Redirect to home or dashboard
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 shadow rounded">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {type === "signup" ? "Create your account" : "Log in to your account"}
        </h2>
        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleAuth} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {loading ? "Loading..." : type === "signup" ? "Sign Up" : "Log In"}
          </Button>
        </div>
      </div>
    </div>
  )
}
