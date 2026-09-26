'use client'

import { useEffect, useRef, useState } from 'react'

interface StatItem {
  target: number
  suffix: string
  label: string
  duration: number
}

const STATS: StatItem[] = [
  { target: 1200, suffix: '+', label: 'Projects', duration: 2400 },
  { target: 48, suffix: '', label: 'People', duration: 2200 },
  { target: 15, suffix: '', label: 'Years', duration: 2000 },
  { target: 6, suffix: '', label: 'Offices', duration: 1800 },
]

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function Counter({
  target,
  suffix,
  duration,
  start,
}: {
  target: number
  suffix: string
  duration: number
  start: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return

    // Safely check prefers-reduced-motion only after mount inside effect
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target)
      return
    }

    let startTime: number | null = null
    let rafId: number | null = null

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      const nextCount = Math.round(eased * target)

      setCount(nextCount)

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }

    rafId = window.requestAnimationFrame(step)

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [start, target, duration])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || hasTriggeredRef.current) return

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hasTriggeredRef.current = true
      setIsInView(true)
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry && entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -20px 0px' }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section ref={sectionRef} className="bg-[#ea0a0b] py-16 text-white">
      <div className="container grid grid-cols-2 md:grid-cols-4">
        {STATS.map(({ target, suffix, label, duration }) => (
          <div
            key={label}
            className="border-white/25 px-5 py-5 text-center first:border-0 md:border-l"
          >
            <div className="font-heading text-6xl font-bold sm:text-7xl">
              <Counter
                target={target}
                suffix={suffix}
                duration={duration}
                start={isInView}
              />
            </div>
            <div className="mt-2 font-heading text-xs font-bold uppercase tracking-[.25em]">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
