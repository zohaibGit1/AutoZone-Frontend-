'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function PageLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 950)
    return () => window.clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#0d0c0f] text-white transition-opacity duration-500">
      <div className="flex flex-col items-center">
        <div className="relative mb-6 h-24 w-24 overflow-hidden rounded-full shadow-2xl shadow-red-950/40">
          <Image
            src="/images/autozone-logo.png"
            alt="AutoZone Detailing & Accessories"
            width={96}
            height={96}
            priority
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="font-heading text-3xl font-extrabold tracking-wider uppercase text-white">
          AUTO<span className="text-[#ea0a0b]">ZONE</span>
        </div>
        <p className="font-heading text-[11px] font-bold tracking-[0.28em] uppercase text-[#b9b9bd] mt-1 mb-6">
          Detailing & Accessories
        </p>

        <div className="relative h-10 w-10" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#ea0a0b] border-r-[#ea0a0b]" />
        </div>

        <p className="mt-4 font-heading text-xs uppercase tracking-[0.28em] text-[#8b8b90]">
          Preparing your drive
        </p>
      </div>
    </div>
  )
}
