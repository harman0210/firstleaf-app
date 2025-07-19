'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"

export default function AuthorSpotlight() {
  return (
 
     /* Testimonials */
      <section className="relative z-10 py-24 px-6 bg-[#f9f6f1]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold mb-12 text-gray-800">What People Say</h2>
          <Carousel
            showThumbs={false}
            infiniteLoop
            autoPlay
            showStatus={false}
            interval={7000}
            className="max-w-xl mx-auto"
          >
            {[
              {
                name: 'Alicia Keys',
                text: 'FirstLeaf helped me find my writing voice and a community that truly supports me.',
              },
              {
                name: 'John Smith',
                text: 'A beautiful place to read stories that matter and connect with genuine people.',
              },
              {
                name: 'Maria Garcia',
                text: 'The writing prompts sparked creativity I never knew I had. Highly recommend!',
              },
            ].map((testimonial, i) => (
              <div key={i} className="px-6 py-8 bg-white rounded-lg shadow-md">
                <p className="italic text-gray-700 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">— {testimonial.name}</p>
              </div>
            ))}
          </Carousel>
        </div>
      </section>
  )
}