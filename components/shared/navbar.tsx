"use client";
import { useState } from "react";
import { useAuthModal } from "@/context/AuthModalContext";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdvancedSearch from "@/components/search/AdvancedSearch";
import { X, Search } from "lucide-react";
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image';


export function UserNavBar() {

  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname()

  if (pathname.startsWith('/read/')) return null

  const { user } = useAuth()
  const router = useRouter()
  const { openModal } = useAuthModal();
  const handleStartWriting = async () => {
    if (!user) {

      //  alert("Please log in to start writing.")
      return openModal();
    }

    let { data: author, error: authorError } = await supabase
      .from('authors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (authorError || !author) {
      const { data: newAuthor, error: createAuthorError } = await supabase
        .from('authors')
        .insert([
          {
            user_id: user.id,
            name: user.email || 'Unnamed Author',
          },
        ])
        .select()
        .single()

      if (createAuthorError || !newAuthor) {
        console.error('Author creation failed:', createAuthorError)
        alert("Failed to create author profile. Please try again.")
        return
      }

      author = newAuthor
    }

    const { data: draft, error: draftError } = await supabase
      .from('drafts')
      .insert([
        {
          title: 'Untitled Draft',
          content: '<p>Start writing your story...</p>',
          author_id: author.id,
          status: 'draft',
        },
      ])
      .select()
      .single()

    if (draftError || !draft) {
      console.error('Error creating draft:', draftError)
      alert("Failed to create a new draft. Please try again.")
      return
    }

    router.push(`/write/${draft.id}`)
  }
  return (
    <>
      <header className="sticky top-0 z-50 bg-white backdrop-blur border-b border-gray-400 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logos/offical-logo-g-wl.png" alt="Logo" width={150} height={50} />
           {/*} <span className="text-2xl font-bold text-emerald-400 hover:text-cyan-400">
              FirstLeaf
            </span>*/}
          </Link>

          <div className="flex items-center gap-4">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full text-gray-900 hover:text-black transition-colors"
            >
              <Search size={20} />
            </button>
            <Button variant="ghost" className="text-sm text-gray-900 hover:text-black"
              onClick={handleStartWriting}
            >
              ✍️ Write
            </Button>
            <Link  href="/library" className="text-sm text-gray-900 hover:text-black">
              Library
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-gray-900 hover:text-black">
                  Profile
                </Link>
                <Avatar className="h-8 w-8 bg-black-800 text-black border border-zinc-600 ">
                  <AvatarFallback>
                    {user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <button onClick={openModal} className="text-sm text-gray-900 hover:text-black">
                  Login
                </button>
                <button
                  onClick={openModal}
                  className="text-sm text-gray-900 hover:text-black"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <button onClick={() => setSearchOpen(false)} className="text-white text-2xl">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-white">
            <AdvancedSearch />
          </div>
        </div>
      )}
    </>
  );
}
