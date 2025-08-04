'use client'

import { useEffect, useState } from 'react'
import { Carousel } from 'react-responsive-carousel'
import { supabase } from '@/lib/supabaseClient'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

interface Testimonial {
  id?: number
  user_id?: string
  name: string
  feedback: string
}

export default function AuthorSpotlight() {
  const [feedbacks, setFeedbacks] = useState<Testimonial[]>([])

  const fallbackFeedbacks: Testimonial[] = [
    {
      name: 'Jane Doe',
      feedback: 'This platform helped me discover amazing authors!',
    },
    {
      name: 'Rahul Verma',
      feedback: 'A beautiful reading experience. I love how smooth everything feels!',
    },
    {
      name: 'Aisha Khan',
      feedback: 'Publishing my stories here was incredibly easy. Highly recommended!',
    },
  ]

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('id, user_id, name, feedback')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching feedback:', error.message)
        setFeedbacks(fallbackFeedbacks)
      } else if (data && data.length > 0) {
        setFeedbacks(data as Testimonial[])
      } else {
        setFeedbacks(fallbackFeedbacks)
      }
    }

    fetchFeedbacks()
  }, [])

  return (
    <section id="reviews" className="relative z-10 py-24 px-6 bg-[#f9f6f1]">
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
          {feedbacks.map((testimonial, i) => (
            <div key={i} className="px-6 py-8 bg-gradient-to-br from-blue-200 to-green-100 rounded-lg shadow-md">
              <p className="italic text-gray-700 mb-4">"{testimonial.feedback}"</p>
              <p className="font-semibold text-gray-900">— {testimonial.name}</p>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  )
}

