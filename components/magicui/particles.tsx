'use client'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import { useCallback } from 'react'

export default function ParticleBackground() {
  const particlesInit = useCallback(async engine => {
    await loadFull(engine)
  }, [])

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        particles: {
          number: { value: 80 },
          color: { value: '#ffffff' },
          opacity: { value: 0.2 },
          size: { value: 2 },
          move: { enable: true, speed: 0.6 },
        },
        background: { color: 'transparent' }
      }}
      className="absolute inset-0 z-0"
    />
  )
}
