'use client'

import { Button } from '@/components/ui/button'

interface WritingPromptProps {
  prompt: string
}

export default function WritingPrompt({ prompt }: WritingPromptProps) {
  return (
    <section className="relative z-10 py-24 px-6 bg-[#f9f6f1]">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-serif font-bold mb-6 text-gray-800">Today's Writing Prompt</h2>
        <p className="text-xl italic mb-6">"{prompt}"</p>
        <Button>Start Writing</Button>
      </div>
    </section>
  )
}
