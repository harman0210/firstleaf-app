'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

type Author = {
  id: string
  name: string
  bio?: string
  avatar_url?: string
}

export default function AuthorSpotlight() {
  const [author, setAuthor] = useState<Author | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTopAuthor = async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('id, name, bio, avatar_url')
        .order('likes', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        setAuthor(data[0])
      }
    }

    fetchTopAuthor()
  }, [])

  if (!author) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        No spotlight author found.
      </div>
    )
  }

  return (
    <section id='author' className="relative z-10 py-24 px-6  dark:bg-[#121212]">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-serif font-bold mb-8 text-gray-800 dark:text-gray-100">
          Author Spotlight
        </h2>

        <div className="bg-gradient-to-br from-blue-200 to-green-100 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-md">
          <Image
            src={author.avatar_url || '/avatar/avatar.png'}
            alt={author.name}
            width={100}
            height={100}
            className="rounded-full mx-auto mb-4 object-cover border border-gray-300 dark:border-gray-600"
          />

          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            {author.name}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm italic mb-6">
            {author.bio || 'This author has touched many hearts with their writing.'}
          </p>

   
           <Button className="bg-[#6b47dc] text-white px-6 py-3 rounded-full hover:shadow-xl hover:scale-105 transition transform duration-300"
            onClick={() => router.push(`/author/${author.id}`)}
          >
            View Profile
          </Button>
        </div>
      </div>
    </section>
  )
}
