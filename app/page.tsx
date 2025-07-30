'use client'

import { useState, useEffect } from 'react'
import HeroSection from '@/components/home/HeroSection'
import FeaturedStories from '@/components/home/FeaturedStories'
import GenresSection from '@/components/home/GenresSection'
import WritingPrompt from '@/components/home/WritingPrompt'
import AuthorSpotlight from '@/components/home/AuthorSpotlight'
import MissionSection from '@/components/home/MissionSection'
import HowItWorks from '@/components/home/HowItWorks'
import Testimonials from '@/components/home/Testimonials'
import LanguagesSection from '@/components/home/LanguagesSection'
import AuthModal from '@/components/modals/AuthModal'

export default function HomePage() {
  const [prompt, setPrompt] = useState('')
  const [bgColor, setBgColor] = useState('#fefcf9')

  useEffect(() => {
    const interval = setInterval(() => {
      setBgColor(`hsl(${Math.random() * 360}, 70%, 95%)`)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setPrompt('Write a story about a world where dreams are shared.')
  }, [])

  return (
    <main className="relative overflow-hidden transition-colors duration-1000" style={{ backgroundColor: bgColor }}>
      <HeroSection />
      <FeaturedStories />
        <LanguagesSection />
      <GenresSection />
      <WritingPrompt/>
      <AuthorSpotlight />
      <MissionSection />
      <HowItWorks />
      <Testimonials />
    </main>
  )
}
