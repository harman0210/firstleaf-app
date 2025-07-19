// components/shared/navbar.tsx
"use client"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function UserNavBar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-emerald-400 hover:text-cyan-400 transition-colors">
          FirstLeaf
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/library" className="text-sm text-zinc-300 hover:text-white">
            Library
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-white">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
              <Avatar className="h-8 w-8 bg-zinc-800 border border-zinc-600">
                <AvatarFallback>{user?.email?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-300 hover:text-white">
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
