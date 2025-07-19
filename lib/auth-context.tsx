// lib/auth-context.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type User = {
  id: string
  email: string
} | null

const AuthContext = createContext<{ user: User, loading: boolean }>({ user: null, loading: true })

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "" })
      } else {
        setUser(null)
      }

      setLoading(false)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "" })
      } else {
        setUser(null)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
