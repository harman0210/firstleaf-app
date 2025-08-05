'use client'

import { useState, useRef } from 'react'
import { Youtube, Instagram, BookOpenText, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
import { useAuthModal } from "@/context/AuthModalContext";
import { useAuth } from '@/lib/auth-context'



export default function Footer() {

 const faqRef = useRef<HTMLDivElement>(null);


  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { openModal } = useAuthModal();
  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast.error('Please enter your feedback.')
      return
    }
   
    if(!user){
      return openModal();
    }

    setLoading(true)

    const { error } = await supabase
      .from('feedback')
      .insert([{ name: '', feedback }])

    if (error) {
      console.error(error)
      toast.error('Something went wrong.')
    } else {
      toast.success('Thank you for your feedback!')
      setFeedback('')
    }

    setLoading(false)
  }
  return (
    <footer className="bg-[#c4ecc8] text-gray-800 mt-40 relative z-10">
      {/* --- Call to Action Banner --- */}
      <div className="bg-white max-w-6xl mx-auto rounded-3xl overflow-hidden -mt-3 shadow-lg relative z-20">
        <div className="relative h-[450px] w-full">
          <Image
            src="/footer.jpg"
            alt="Books background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/60 p-10 text-center flex flex-col items-center justify-center space-y-4">
            <h2 className="text-4xl font-bold">
              We’d love to hear <span className="italic font-light">Your Thoughts</span>
            </h2>
            <p className="text-sm text-gray-900">
              Share your experience, feedback, or a quick note about what you love about FirstLeaf...
            </p>

            {/* Feedback input */}
            <div className="flex w-full max-w-lg">
              <textarea
                placeholder="Share your valuable feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="flex-1 px-4 py-3 text-sm  bg-gradient-to-br from-blue-100 to-green-100 text-black placeholder-gray-400 outline-none rounded-l resize-none"
                rows={2}
              />
              <button
                onClick={handleFeedbackSubmit}
                disabled={loading}
                className="bg-[#d4f5ce] px-6 flex items-center justify-center hover:bg-[#c0e8ba] transition rounded-r disabled:opacity-50"
              >
                <ArrowRight className="text-black" />
              </button>
            </div>
            <i className="text-sm text-gray-900">
              Your feedback may appear on our ‘What People Say’ section!
            </i>
          </div>
        </div>
      </div>

      {/* --- Main Footer --- */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 mt-32">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            FirstLeaf <BookOpenText size={24} />
          </h3>
          <div className="flex space-x-4 mt-4">
            <Youtube size={20} />
            <Instagram size={20} />
          </div>
          <p className="mt-4 text-sm text-gray-700">
            Read. Write. Share. <br />
            Your stories matter here.
          </p>
        </div>

        <div>
          <h4 className="uppercase text-sm font-bold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/">Home</Link></li>
            <li><Link href="#write">Write</Link></li>
            <li><Link href="/library">Read  a Book</Link></li>
            <li><Link href="/upload">Upload e-Book</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="uppercase text-sm font-bold mb-4">Community</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#author">Authors</Link></li>
            <li><Link href="/#toppicks">Top Picks</Link></li>
            <li><Link href="/#reviews">Reviews</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="uppercase text-sm font-bold mb-4">Help & Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/privacy-policy ">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
             <li><Link href="/about">About</Link></li>
          </ul>
        </div>
      </div>

      {/* --- Bottom Bar --- */}
      <div className="border-t border-gray-300 text-xs text-gray-600 px-6 py-4 flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} FirstLeaf. All rights reserved.</p>
        <p className="mt-2 md:mt-0">
          Built by <span className="font-medium">Harman</span> ✨
        </p>
      </div>
    </footer>
  )
}
