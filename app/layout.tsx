// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { UserNavBar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"
import AOS from 'aos';
import 'aos/dist/aos.css';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FirstLeaf - Platform for New Authors",
  description: "A platform for new writers to test their books, gain feedback, and grow their writing careers.",
  keywords: "writing, publishing, books, authors, feedback, community, reading, readers, free books",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`bg-black text-white ${inter.className}`}>
        <AuthProvider>
          <UserNavBar />
          <main className="min-h-[80vh]">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
