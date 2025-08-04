'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSend = () => {
    const subject = encodeURIComponent(`Message from ${name}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
    window.location.href = `mailto:sharmanjot594@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-2 text-gray-600">
            Have a question,feedback, suggestion, or issue? We're here to help.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-800 text-base">
            <li className="flex items-center">          
            </li>
            {/* Add phone/socials if needed */}
          </ul>
        </CardContent>
      </Card>
      <div className="space-y-4 text-black">
        <Input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Your Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Textarea
          placeholder="Your Message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button className="w-full" onClick={handleSend}>
          Send Message
        </Button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        We'll try to respond within 48 hours.
      </p>
    </div>
  )
}
