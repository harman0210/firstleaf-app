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
  profile_picture_url?: string
}

export default function AuthorSpotlight() {
  const [author, setAuthor] = useState<Author | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTopAuthor = async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('id, name, bio, profile_picture_url')
        .order('total_likes', { ascending: false }) // or total_reviews
        .limit(1)
        .single()

      if (!error && data) {
        setAuthor(data)
      }
    }

    fetchTopAuthor()
  }, [])

if (!author) return (
  <div className="text-center py-10 text-gray-500">No spotlight author found.</div>
)


  return (
    <section className="relative z-10 py-24 px-6 bg-white">
      <h2 className="text-3xl font-serif font-bold mb-6 text-center text-gray-800">Author Spotlight</h2>
      <div className="max-w-2xl mx-auto bg-gray-100 p-6 rounded-xl shadow-md">
        <Image
          src={author.profile_picture_url || '/author-placeholder.jpg'}
          alt={author.name}
          width={100}
          height={100}
          className="rounded-full mx-auto mb-4"
        />
        <h3 className="text-xl font-bold text-center mb-2">{author.name}</h3>
        <p className="text-gray-600 text-center mb-4">
          {author.bio || 'This author has touched many hearts with their writing.'}
        </p>
        <Button variant="outline" className="block mx-auto" onClick={() => router.push(`/author/${author.id}`)}>
          View Profile
        </Button>
      </div>
    </section>
  )
}

