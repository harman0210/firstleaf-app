'use client'

import { useEffect, useState } from 'react'

interface TextReaderProps {
  url: string
  fontSize: number
  lineHeight: number
  theme: 'light' | 'dark' | 'sepia'
}

export default function TextReader({ url, fontSize, lineHeight, theme }: TextReaderProps) {
  const [content, setContent] = useState<string>('')

  useEffect(() => {
    const fetchText = async () => {
      try {
        const res = await fetch(url)
        const text = await res.text()
        setContent(text)
      } catch (err) {
        setContent('Error loading content.')
      }
    }

    fetchText()
  }, [url])

  const getThemeClass = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white'
      case 'sepia':
        return 'bg-amber-50 text-amber-900'
      default:
        return 'bg-white text-gray-900'
    }
  }

  return (
    <div
      className={`rounded-lg shadow p-4 whitespace-pre-wrap ${getThemeClass()}`}
      style={{ fontSize: `${fontSize}px`, lineHeight }}
    >
      {content}
    </div>
  )
}
