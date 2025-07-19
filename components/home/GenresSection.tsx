'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const genres = ['Fantasy', 'Romance', 'Mystery', 'Sci-Fi', 'Horror', 'Poetry', 'Non-Fiction', 'Thriller']

export default function GenresSection() {
  return (
    <section className="relative z-10 py-24 px-6 bg-white">
      <h2 className="text-3xl font-serif font-bold mb-6 text-center text-gray-800">Explore Genres</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {genres.map((genre, i) => (
          <Link key={i} href={`/library?genre=${genre.toLowerCase()}`} passHref>
            <motion.div
              className="bg-gray-100 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <p className="font-semibold">{genre}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  )
}
