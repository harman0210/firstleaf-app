//newhomepage

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { TypewriterEffect } from '@/components/magicui/typewriter-effect'
import { useAuthModal } from "@/context/AuthModalContext"
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'


export default function Newhome() {
    
    return (   
            <main className="flex items-center justify-center pt-32 pb-20 px-4 bg-[#d6efdd] rounded-t-[4rem] relative overflow-hidden">       
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl px-8 py-10 max-w-2xl text-center shadow-xl">
                    <p className="uppercase text-sm tracking-widest text-gray-600 flex items-center justify-center gap-2 mb-2">
                        <span role="img" aria-label="spray">🧴</span> Go-To Cleaners
                    </p>
                    <h2 className="text-5xl font-bold mb-2">EXPERT</h2>
                    <h3 className="text-5xl italic font-light mb-6">CLEANING</h3>
                    <p className="text-gray-700 mb-6 text-sm">
                        Creating cleaner, healthier spaces so you can focus on what matters most and relax on the weekends.
                    </p>
                    <Link
                        href="#"
                        className="bg-gray-800 text-white px-8 py-2 rounded-full text-sm hover:bg-gray-900 transition"
                    >
                        EXPLORE
                    </Link>
                </div>
                  <div className="absolute inset-0 -z-10">
                    <Image
                        src="\toa-heftiba-0lEn122_OGA-unsplash.jpg"
                        alt="Cleaning products"
                        fill
                        className="object-cover opacity-80 rounded-t-[4rem]"
                    />
                </div>
            </main>

    )
}
