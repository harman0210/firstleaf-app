'use client'
import { motion } from 'framer-motion'

export default function Blob() {
  return (
    <motion.div
      className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-gradient-to-r from-purple-700 to-pink-600 opacity-30 blur-3xl rounded-full z-0"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
