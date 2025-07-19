// components/magicui/typewriter-effect.tsx
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function TypewriterEffect({
  words,
  className,
}: {
  words: { text: string; className?: string }[]
  className?: string
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    if (wordIndex >= words.length) return

    const word = words[wordIndex].text
    if (charIndex <= word.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(word.slice(0, charIndex))
        setCharIndex((prev) => prev + 1)
      }, 80)
      return () => clearTimeout(timeout)
    } else {
      setTimeout(() => {
        setCharIndex(0)
        setWordIndex((prev) => prev + 1)
      }, 500)
    }
  }, [charIndex, wordIndex, words])

  if (wordIndex >= words.length) {
    return (
      <h1 className={cn('text-4xl md:text-6xl font-bold', className)}>
        {words.map((word, idx) => (
          <span key={idx} className={cn('mr-2', word.className)}>
            {word.text}
          </span>
        ))}
      </h1>
    )
  }

  return (
    <h1 className={cn('text-4xl md:text-6xl font-bold', className)}>
      {words.slice(0, wordIndex).map((word, idx) => (
        <span key={idx} className={cn('mr-2', word.className)}>
          {word.text}
        </span>
      ))}
      <span className={words[wordIndex].className}>
        {displayedText}
        <span className="animate-pulse">|</span>
      </span>
    </h1>
  )
}
