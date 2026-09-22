'use client'
import Link from 'next/link'
import { ArrowDown } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative h-[82vh] min-h-[580px] max-h-[820px] w-full flex items-center overflow-hidden bg-black text-white">
      {/* Background Video - Scaled and centered */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-center opacity-60"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay for high readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70 pointer-events-none" />

      {/* Hero Content */}
      <div className="container relative z-20 mx-auto flex h-full flex-col justify-between px-6 pt-24 pb-28">
        {/* Spacer to push title towards the lower-middle */}
        <div className="hidden sm:block" />

        {/* Title Group */}
        <div className="mt-auto pb-4">
          <p className="font-heading text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase text-zinc-300 mb-2">
            Full Service and Excellent Quality
          </p>
          <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-[108px] font-black uppercase leading-[0.9] tracking-tight text-white drop-shadow-md">
            Car Detailing
          </h1>
        </div>

        {/* Scroll Down Button - lifted clear of overlapping cards */}
        <div className="pb-4">
          <Link
            href="#services"
            className="inline-flex items-center gap-2.5 font-heading text-xs font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:text-white"
          >
            <span>Scroll Down</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-400/80">
              <ArrowDown size={11} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}