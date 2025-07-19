// app/components/home/HeroSection.tsx

'use client'
import Link from 'next/link';
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { TypewriterEffect } from '@/components/magicui/typewriter-effect'


export default function HeroSection() {
  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center px-6 py-24">
      <div className="max-w-4xl text-center">
        <TypewriterEffect
          words={[{ text: 'WRITE' },{text:'/'}, { text: 'READ' }]}
          className="text-4xl md:text-6xl font-serif font-bold leading-tight text-[#2c2c2c]"
        />
        <motion.p
          className="mt-6 text-lg md:text-xl text-gray-700 font-light"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          FirstLeaf is a home for thoughtful writers and curious readers. Join us to share your
          voice and explore stories that move you.
        </motion.p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link href="/upload" passHref>
            <Button className="bg-[#5e4b8b] text-white px-6 py-3 rounded-full hover:bg-[#493a6f]">
              Upload Your Book
            </Button>
          </Link>
          <Link href="/library" passHref>
            <Button variant="outline" className="border-[#5e4b8b] text-[#5e4b8b] hover:bg-[#f2edf9] rounded-full">
              Browse Stories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
