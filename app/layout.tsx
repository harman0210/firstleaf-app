// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { UserNavBar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"
import { AuthModalProvider } from "@/context/AuthModalContext"
import AuthModal from "@/components/modals/AuthModal"
import { AOSProvider } from "@/components/providers/AOSProvider"
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';
import Head from 'next/head';

const inter = Inter({ subsets: ["latin"] })


export const metadata: Metadata = {
  title: "FirstLeaf - Platform for New Authors",
  description: "WRITE Your FIRST BOOK or Publish Directly",
  keywords: "writing, publishing, books, authors, feedback, community, reading, readers, free books",
  generator: "v0.dev",

  metadataBase: new URL("https://your-domain.com"), // ← replace with actual domain later
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg"
  },
  openGraph: {
    title: "FirstLeaf - Platform for New Authors",
    description: "A platform where new voices become authors.",
    url: "https://your-domain.com", // ← replace later
    siteName: "FirstLeaf",
    images: [
      {
        url: "/og-image.png", // ← put in /public
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
    images: ["/og-image.png"], // ← same image
  }
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

    <html lang="en">
      <body className={`bg-black text-white ${inter.className}`}>
        <MantineProvider defaultColorScheme="light">
          <Notifications position="top-right" zIndex={1000} autoClose={4000} />
          <AuthProvider>
            <AuthModalProvider>
              <AOSProvider />
              <UserNavBar />
              <main className="min-h-[80vh] px-4 sm:px-6">{children}</main>
              <Footer />
              <AuthModal />
            </AuthModalProvider>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
