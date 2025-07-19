'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'

const Spotlight = dynamic(() => import('@/components/magicui/spotlight').then(mod => mod.Spotlight), { ssr: false })

export default function MissionSection() {
  return (
    <section className="relative z-10 bg-[#f9f6f1] py-24 px-6">
      <Spotlight className="top-10 left-10 h-[400px] w-[700px] opacity-30" fill="purple" />
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-gray-800">Why We Exist</h2>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto">
          In a world filled with noise, FirstLeaf is a quiet space for authentic voices. We believe everyone has a story that deserves to be heard. Whether you’re writing your first poem or reading your hundredth novel, you belong here.
        </p>
        <Image
          src="\girl.jpg"
          alt="Writing inspiration"
          width={500}
          height={10}
          className="mt-12 rounded-lg shadow-xl mx-auto"
        />
      </div>
    </section>
  )
}
3