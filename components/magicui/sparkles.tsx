'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface SparklesProps {
  className?: string
  background?: string
  minSize?: number
  maxSize?: number
  particleDensity?: number
  particleColor?: string
}

export const SparklesCore = ({
  className,
  background = 'transparent',
  minSize = 1.5,
  maxSize = 4.5,
  particleDensity = 120,
  particleColor = 'hsl(270, 95%, 75%)'
}: SparklesProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 150 })
  const particles = useRef<any[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      setCanvasSize({ width: canvas.width, height: canvas.height })
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        opacity: Math.random(),
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5
      }
    }

    for (let i = 0; i < particleDensity; i++) {
      particles.current.push(createParticle())
    }

    const animate = () => {
      if (!ctx || !canvasRef.current) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.current.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY

        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          Object.assign(p, createParticle())
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${particleColor}${Math.round(p.opacity * 255).toString(16)}`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [canvasSize])

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
