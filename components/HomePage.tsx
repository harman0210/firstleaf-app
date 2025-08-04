'use client';

import { useState, useEffect } from 'react'
import Newhome from '@/components/home/Newhome'
import HeroSection from '@/components/home/HeroSection'
import FeaturedStories from '@/components/home/FeaturedStories'
import GenresSection from '@/components/home/GenresSection'
import WritingPrompt from '@/components/home/WritingPrompt'
import AuthorSpotlight from '@/components/home/AuthorSpotlight'
import MissionSection from '@/components/home/MissionSection'
import HowItWorks from '@/components/home/HowItWorks'
import Testimonials from '@/components/home/Testimonials'
import LanguagesSection from '@/components/home/LanguagesSection'
import { useAuthModal } from '@/context/AuthModalContext'

export default function HomePage() {
  const [prompt, setPrompt] = useState('')

  useEffect(() => {
    setPrompt('Write a story about a world where dreams are shared.')
  }, [])

  return (
    <main
      className="relative overflow-hidden"
      style={{ backgroundColor: '#f5f5f5' }} // <-- soft pastel mint
    >
      <HeroSection />
      <FeaturedStories />
      <LanguagesSection />
      <GenresSection />
      <WritingPrompt />
      <AuthorSpotlight />
      <MissionSection />
      <HowItWorks />
      <Testimonials />
    </main>
  )
}
