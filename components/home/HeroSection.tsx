'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { TypewriterEffect } from '@/components/magicui/typewriter-effect'
import { useAuthModal } from "@/context/AuthModalContext";
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HeroSection() {
  const { user } = useAuth()
  const router = useRouter()
  const { openModal } = useAuthModal();

  const handleStartWriting = async () => {
    if (!user) return openModal()

    let { data: author, error: authorError } = await supabase
      .from('authors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (authorError || !author) {
      const { data: newAuthor, error: createAuthorError } = await supabase
        .from('authors')
        .insert([{
          user_id: user.id,
          name: user.email || 'Unnamed Author',
        }])
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
      .insert([{
        title: 'Untitled Draft',
        content: '<p>Start writing your story...</p>',
        author_id: author.id,
        status: 'draft',
      }])
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

    <div className="bg-gray-100 text-gray-800">
      <main className="flex items-center justify-center pt-32 pb-20 px-4 bg-[#e6fae4] relative overflow-hidden">
        <Image
          src="/harman.jpg"
          alt="Books and storytelling background"
          fill
          className="object-cover h-[500px] bg-gradient-to-br from-blue-100 to-green-100"
        />
        <div className="bg-black/900 backdrop-blur-lg rounded-3xl px-8 py-10 max-w-2xl text-center shadow-xl z-10 relative">
          <motion.div          
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
          <p className="uppercase text-sm tracking-widest text-gray-600 flex items-center justify-center gap-2 mb-2">
            <span role="img" aria-label="book">📚</span> Welcome to FirstLeaf
          </p>
          <h1 className="text-5xl font-bold mb-2">Read</h1>
          <h2 className="text-5xl italic font-light mb-6">Publish.Write</h2>
          <p className="text-gray-700 mb-6 text-sm">
            A community where <span className="font-semibold">Writers </span> and <span className="font-semibold">Book-Lover</span> come together to join the community.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              variant="outline"
              className="border-gray-800 text-gray-800 bg-white hover:bg-gray-100 rounded-full px-6 py-2 text-sm transition"
              onClick={handleStartWriting}
              aria-label="Start writing"
            > ✍️ Start Writing
            </Button>
            <Link href="/upload" passHref>
              <Button className=" border-gray-800 bg-white text-black px-6 py-2 rounded-full text-sm hover:bg-[#c4ecc8]" aria-label="Upload an eBook">
                ⬆️ Upload eBook
              </Button>
            </Link>
            <Link href="/library" passHref>
              <Button
                variant="outline"
                className="border-gray-800 text-gray-800 bg-white hover:bg-gray-100 rounded-full px-6 py-2 text-sm transition"
                aria-label="Browse library"
              >   📖 Read Books
              </Button>
            </Link>
          </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
