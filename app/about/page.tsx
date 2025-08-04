'use client'

import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white">
          About <span className="text-primary">FirstLeaf</span>
        </h1>

        <p className="text-lg text-gray-700 dark:text-gray-300 text-center max-w-2xl mx-auto">
          FirstLeaf is a platform built for writers who haven’t published yet — a space for stories, poems, and personal writings.
        </p>

        <div className="bg-white/70 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300">
            To make writing accessible to everyone — free, open, and inclusive. We believe powerful voices come from everywhere, not just the top.
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Our Vision</h2>
          <p className="text-gray-600 dark:text-gray-300">
            A global community of diverse authors, telling real, honest stories. No filters. No gatekeepers. Just your words.
          </p>
        </div>

        <div className="text-center pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Made with ❤️ by a small team of readers, builders, and dreamers.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
