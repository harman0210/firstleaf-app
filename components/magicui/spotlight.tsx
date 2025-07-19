// components/magicui/spotlight.tsx
import React from 'react'
import { cn } from '@/lib/utils'

export function Spotlight({
  className,
  fill = '#a855f7', // default to purple-500
}: {
  className?: string
  fill?: string
}) {
  return (
    <svg
      className={cn(
        'pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-40',
        className
      )}
      width="1000"
      height="800"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_f)">
        <circle cx="300" cy="300" r="200" fill={fill} />
      </g>
      <defs>
        <filter id="filter0_f" x="0" y="0" width="600" height="600" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="100" result="blur" />
        </filter>
      </defs>
    </svg>
  )
}
