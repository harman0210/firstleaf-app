'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function HowItWorks() {
  return (
    <section className="relative z-10 py-24 px-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-gray-800 text-center">What We Offer</h2>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Image src="/Novelist writing.gif" alt="Write" width={350} height={80} className="mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-black">Write Freely</h3>
          <p className="text-gray-600">
          Create stories, poems, or books in a distraction-free editor. 
          Save your drafts and come back anytime to complete them. When you're ready, easily share your work with others.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Image src="/reading-book.gif" alt="Read" width={350} height={80} className="mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-black">Read Deeply</h3>
          <p className="text-gray-600">
            If you’re a book lover, this is made for you. 
            Dive into any genre, in different languages, and discover awesome new writers anytime.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Image src="/Achievement.gif" alt="Connect" width={350} height={80} className="mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-black">Connect Authentically</h3>
          <p className="text-gray-600">
            Join a kind and thoughtful community. Leave comments, share feedback, and grow together.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
