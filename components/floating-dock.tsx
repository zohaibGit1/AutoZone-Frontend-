"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Images, Wallet, ArrowUp } from "lucide-react"

const ACTIONS = [
  { icon: ShoppingCart, label: "Cart", href: "#pricing" },
  { icon: Images, label: "Gallery", href: "#blog" },
  { icon: Wallet, label: "Pricing", href: "#pricing" },
]

export function FloatingDock() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <div className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-px md:flex">
        {ACTIONS.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="group relative flex h-14 w-14 items-center justify-center bg-[var(--color-accent-red)] text-white transition-colors hover:bg-white hover:text-[var(--color-accent-red)]"
          >
            <Icon className="h-5 w-5" />
            <span className="pointer-events-none absolute right-full mr-2 whitespace-nowrap bg-[var(--color-ink-elevated)] px-3 py-1 font-heading text-xs font-semibold uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100">
              {label}
            </span>
          </a>
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center border border-white/20 bg-[var(--color-ink-elevated)] text-white transition-all duration-300 hover:bg-[var(--color-accent-red)] ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </>
  )
}
