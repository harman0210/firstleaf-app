// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { UserNavBar } from "@/components/shared/navbar"
import Footer from "@/components/shared/footer"
import { AuthModalProvider } from "@/context/AuthModalContext"
import AuthModal from "@/components/modals/AuthModal"
import { AOSProvider } from "@/components/providers/AOSProvider"
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { Notifications } from '@mantine/notifications'
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script" // ← IMPORT THIS

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FirstLeaf - Platform for New Authors",
  description: "WRITE Your FIRST BOOK or Publish Directly",
  keywords: "writing, publishing, books, authors, feedback, community, reading, readers, free books",
  generator: "v0.dev",

  metadataBase: new URL("https://firstleaf-app.vercel.app/"), // ← replace with actual domain later
  icons: {
    icon: "/fevicon.png",
    shortcut: "logos/fevicon-g-wl.png",
    apple: "/fevicon.png"
  },
  openGraph: {
    title: "FirstLeaf - Platform for New Authors",
    description: "A platform where new voices become authors.",
    url: "https://firstleaf-app.vercel.app/", // ← replace later
    siteName: "FirstLeaf",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FirstLeaf - Empowering New Authors"
      }
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FirstLeaf - Platform for New Authors",
    description: "A platform where new voices become authors.",
    creator: "@yourtwitterhandle", // optional
    images: ["/og-image.png"],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google AdSense Script – Replace with your actual client ID */}
       <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8474918107630952"
     crossOrigin="anonymous"></script>
      </head>

      <body className={`bg-[#c4ecc8] text-white ${inter.className}`}>
        <MantineProvider defaultColorScheme="light">
          <Notifications position="top-right" zIndex={1000} autoClose={4000} />
          <AuthProvider>
            <AuthModalProvider>
              <AOSProvider />
              <UserNavBar />
              <main className="min-h-[80vh] px-4 sm:px-6 pt-16 ">
                {children}
              </main>
              <Footer />
              <AuthModal />
            </AuthModalProvider>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
