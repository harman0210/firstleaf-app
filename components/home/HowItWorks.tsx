'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function HowItWorks() {
  return (
    <section className="relative z-10 py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Image src="/write1.jpg" alt="Write" width={150} height={80} className="mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Write Freely</h3>
          <p className="text-gray-600">
            Create stories, poems, or books in a distraction-free editor designed for flow and creativity.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Image src="/read2.jpg" alt="Read" width={150} height={80} className="mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Read Deeply</h3>
          <p className="text-gray-600">
            Discover writing that resonates. Follow authors you love and explore handpicked recommendations.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Image src="/connect.jpg" alt="Connect" width={150} height={80} className="mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Authentically</h3>
          <p className="text-gray-600">
            Join a kind and thoughtful community. Leave comments, share feedback, and grow together.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
