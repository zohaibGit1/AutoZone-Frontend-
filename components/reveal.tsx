"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

type Direction = "up" | "down" | "left" | "right" | "none"
type ElementType = "div" | "section" | "li" | "span"

interface RevealProps {
  children: ReactNode
  className?: string
  direction?: Direction
  delay?: number
  as?: ElementType
}

const OFFSET: Record<Direction, string> = {
  up: "translate3d(0, 40px, 0)",
  down: "translate3d(0, -40px, 0)",
  left: "translate3d(40px, 0, 0)",
  right: "translate3d(-40px, 0, 0)",
  none: "translate3d(0, 0, 0) scale(0.96)",
}

export function Reveal({ children, className, direction = "up", delay = 0, as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Tag = as

  return (
    <Tag
      // @ts-ignore polymorphic tag ref
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0) scale(1)" : OFFSET[direction],
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  )
}
