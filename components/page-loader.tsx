'use client'

import { useEffect, useState } from 'react'

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
        <div className="mb-7 font-heading text-4xl font-bold tracking-tight">
          AUTO<span className="text-[#ea0a0b]">ZONE</span>
        </div>
        <div className="relative h-14 w-14" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#ea0a0b] border-r-[#ea0a0b]" />
        </div>
        <p className="mt-5 font-heading text-xs uppercase tracking-[0.28em] text-[#8b8b90]">
          Preparing your drive
        </p>
      </div>
    </div>
  )
}
