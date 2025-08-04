'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { Autoplay } from 'swiper/modules'

interface Book {
  id: string
  title: string
  language: string
  description: string
  genre:string
  cover_url: string
}

export default function FeaturedStories() {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    async function fetchFeaturedBooks() {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, description, genre, cover_url,language')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Failed to load featured books:', error.message)
        return
      }

      setBooks(data || [])
    }

    fetchFeaturedBooks()
  }, [])

  return (
    <section id='toppicks' className="relative z-10 py-20 px-4 sm:px-6 md:px-10">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white font-serif mb-12 tracking-tight">
        ✨ Featured Stories
      </h2>

      {books.length > 0 ? (
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 6000 }}
          loop
          spaceBetween={40}
          slidesPerView={1}
          className="max-w-4xl mx-auto"
        >
          {books.map((book) => (
            <SwiperSlide key={book.id}>
              <div className="backdrop-blur-sm  bg-gradient-to-br from-blue-200 to-green-100 p-6 sm:p-10 rounded-3xl shadow-xl border hover:scale-[1.015]">
                {book.cover_url && (
                  <div className="flex justify-center mb-6">
                    <div className="relative w-[400px] h-[320px] rounded-lg overflow-hidden shadow-lg">
                      <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <h4 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight ">
                    {book.title}
                  </h4>
                   <p
                    className='font-bold mb-3 text-gray-900 dark:text-white tracking-tigh'>
                    {book.genre}
                  </p>
                  <p
                    className='font-bold mb-3 text-gray-900 dark:text-white tracking-tigh'>
                    Language:
                    {book.language}
                  </p>
                  <i
                    className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-6 leading-relaxed line-clamp-3 max-w-2xl mx-auto">
                    {book.description}
                  </i>
                  <Link
                    href={`/book/${book.id}`}
                    className="bg-[#6b47dc] text-white px-6 py-3 rounded-full hover:shadow-xl hover:scale-105 transition transform duration-300"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">No featured stories available.</p>
      )}
    </section>
  )
}
