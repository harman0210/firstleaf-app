'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth-context'
import { useAuthModal } from "@/context/AuthModalContext";
export default function WritingPrompt() {
  const { user } = useAuth()
  const router = useRouter()
  const { openModal } = useAuthModal();
  const handleStartWriting = async () => {
    if (!user) {

    //  alert("Please log in to start writing.")
      return  openModal();
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
    <section id='write' className="relative py-20 px-4 text-center overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 rounded-xl shadow-md mx-auto max-w-4xl">
      {/* Optional soft background pattern */}
   
      <h2
        className="text-4xl font-extrabold text-gray-900 mb-4"
        >
        ✍️ Ready to Share Your Story?
      </h2>

      <p className="text-gray-700 text-lg max-w-xl mx-auto mb-8">
        Unleash your creativity and draft your next big idea. Begin your writing journey today with just one click.
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >

        <Button className="bg-[#6b47dc] text-white px-6 py-3 rounded-full hover:shadow-xl hover:scale-105 transition transform duration-300"
          onClick={handleStartWriting}
        >
          🚀 Start Writing
        </Button>
      </motion.div>
    </section>
  )
}
