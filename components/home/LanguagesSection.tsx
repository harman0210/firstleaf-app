'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Globe2,
  Languages,
  BookOpenText,
  Flag,
  Landmark,
  Book,
  ScrollText,
  Feather,
  Speech,
} from 'lucide-react';

//import { Globe2, Translate } from 'lucide-react'


const languages = [
  { label: '🌐 All Languages', value: 'All' },
  { label: '🇮🇳 Punjabi', value: 'Punjabi' },
  { label: '🇬🇧 English', value: 'English' },
  { label: '🇮🇳 Hindi', value: 'Hindi' },
  { label: '🇮🇳 Telugu', value: 'Telugu' },
  { label: '🇮🇳 Gujarati', value: 'Gujarati' },
  { label: '🇮🇳 Bengali', value: 'Bengali' },
  { label: '🇮🇳 Tamil', value: 'Tamil' },
  { label: '🇮🇳 Kannada', value: 'Kannada' },
  { label: '🇮🇳 Malayalam', value: 'Malayalam' },
  { label: '🇮🇳 Marathi', value: 'Marathi' }
];



export default function LanguagesSection() {
  return (
    <section className="relative z-10 py-24 px-6  dark:bg-zinc-950">
      {/* Heading */}
      <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-12 text-center text-gray-900 dark:text-white tracking-tight">
        🌐 Explore Books by Languages
      </h2>

      {/* Language Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto justify-items-center">
        {languages.map((language, i) => (
          <Link
            key={i}
            href={`/library?language=${language.value.toLowerCase()}`}
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
                 'linear-gradient(135deg, #c4ecc8 10%, rgba(3, 3, 52, 0.05) 100%)',
              }}
            >
              <span>{language.value}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  )
}
