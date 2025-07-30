// components/shared/footer.tsx
'use client'
import Link from 'next/link';


export function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-white/10 py-6 px-4 mt-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} FirstLeaf.All rights reserved.</p>
        <div className="space-x-4">
          <nav className="flex gap-4 text-sm">
            <Link href="legal/about">About</Link>
            <Link href="legal/contact">Contact</Link>
            <Link href="legal/privacy-policy">Privacy Policy</Link>
            <Link href="legal/terms">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
