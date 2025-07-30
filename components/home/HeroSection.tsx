'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { TypewriterEffect } from '@/components/magicui/typewriter-effect'
import { useAuthModal } from "@/context/AuthModalContext";
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'


export default function HeroSection() {
  //export default function WritingPrompt() {
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

    // return (
    <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f5f7fa] via-[#e0ecff] to-[#e8f5e9] px-6 py-24">
      {/* Background effects */}
      <div className="absolute inset-0 z-0 bg-[url('/bg.jpg')] opacity-10 pointer-events-none" />

      {/* Glass Card */}
      <motion.div
        className="relative z-10 max-w-4xl w-full text-center bg-white/70 backdrop-blur-md rounded-2xl p-10 shadow-2xl border border-white/40"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <TypewriterEffect
          words={[{ text: 'Write  Publish  Read' }]}
          className="text-5xl md:text-7xl font-serif font-extrabold leading-tight text-[#1c1c1c]"
        />
        <motion.p
          className="mt-6 text-base md:text-xl text-gray-800 font-light tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Write Your First Book or Publish Directly
          <br className="hidden sm:block" />
          And for Readers to discover fresh voices.
        </motion.p>

        <motion.div
          className="mt-10 flex justify-center gap-4 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >

          <Button
            variant="outline"
            className="border-[#6b47dc] text-[#6b47dc] bg-white/80 hover:bg-[#f3ecff] rounded-full px-6 py-3 hover:shadow-md transition"
            onClick={handleStartWriting}
          >
            Start Writing
          </Button>
          <Link href="/upload" passHref>
            <Button className="bg-[#6b47dc] text-white px-6 py-3 rounded-full hover:shadow-xl hover:scale-105 transition transform duration-300">
              Upload e-Book
            </Button>
          </Link>
          <Link href="/library" passHref>
            <Button
              variant="outline"
              className="border-[#6b47dc] text-[#6b47dc] bg-white/80 hover:bg-[#f3ecff] rounded-full px-6 py-3 hover:shadow-md transition"
            >
              Read Books
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
