//app/components/home/FeaturedStories.tsx
'use client'

import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function FeaturedStories() {
  return (
    <section className="relative z-10 py-24 px-6">
      <h2 className="text-3xl font-serif font-bold mb-6 text-center text-gray-800">Featured Stories</h2>
      <Carousel showThumbs={false} infiniteLoop autoPlay>
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-2">Featured Story Title {i + 1}</h3>
            <p className="text-gray-600 mb-4">A brief excerpt from the featured story...</p>
            
            {/* ✅ Option 1: if Button supports asChild */}
            <Button asChild variant="outline">
              <Link href={`/book/${i + 1}`}>Read More</Link>
            </Button>

            {/* ✅ Option 2: if Button does NOT support asChild */}
            {/* <Link href={`/book/${i + 1}`} passHref>
              <Button variant="outline">Read More</Button>
            </Link> */}
          </div>
        ))}
      </Carousel>
    </section>
  )
}

