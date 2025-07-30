'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Heart, Ghost, Atom, Sparkles, Pen, Brain, Eye } from 'lucide-react'

const genres = [
  { label: '🧙 Fantasy', value: 'Fantasy' },
  { label: '💕 Romance', value: 'Romance' },
  { label: '🕵️ Mystery', value: 'Mystery' },
  { label: '🚀 Sci-Fi', value: 'Sci-Fi' },
  { label: '👻 Horror', value: 'Horror' },
  { label: '✍️ Poetry', value: 'Poetry' },
  { label: '📖 Non-Fiction', value: 'Non-Fiction' },
  { label: '🎭 Drama', value: 'Drama' }
];

export default function GenresSection() {
  return (
    <section className="relative z-10 py-24 px-6 bg-white dark:bg-zinc-950">
      {/* Heading */}
      <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-12 text-center text-gray-900 dark:text-white tracking-tight">
        📚 Explore Books by Genres
      </h2>

      {/* Genre Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto justify-items-center">
        {genres.map((genre, i) => (
          <Link
            key={i}
            href={`/library?genre=${ genre.value.toLowerCase()}`}
           
            passHref
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="w-44 h-20 flex items-center justify-center gap-2 px-4 py-2 rounded-xl 
                         backdrop-blur-sm bg-white/20 dark:bg-zinc-800/20 
                         border border-white/20 dark:border-zinc-700 
                         shadow-[0_4px_30px_rgba(0,0,0,0.1)] 
                         text-gray-900 dark:text-white 
                         font-medium text-lg transition-all duration-300 cursor-pointer"
              style={{
                background:
                  'linear-gradient(135deg, rgba(76, 41, 145, 0.2) 0%, rgba(3, 3, 52, 0.05) 100%)',
              }}
            >
              <span>{genre.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  )
}
