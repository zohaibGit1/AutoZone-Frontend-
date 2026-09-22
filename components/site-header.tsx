'use client'
import Link from 'next/link'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'About Us', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 30)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${solid || open ? 'bg-[#0d0c0f]/96 backdrop-blur-md shadow-lg shadow-black/30' : 'bg-transparent'}`}>
      <div className="container flex h-[82px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-7 w-7 items-center justify-center bg-[#ea0a0b] text-white">
            <span className="text-sm font-bold">✦</span>
          </span>
          <span className="font-heading text-2xl font-bold tracking-wider uppercase text-white">
            AUTOZONE
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className="font-heading text-[15px] font-semibold uppercase tracking-wider text-white transition-colors hover:text-[#ea0a0b]"
            >
              {x.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link href="/shop" aria-label="Shop" className="hidden text-white hover:text-[#ea0a0b] sm:block">
            <ShoppingBag size={20} />
          </Link>
          <button aria-label="Search" className="hidden text-white hover:text-[#ea0a0b] sm:block">
            <Search size={20} />
          </button>
          <Link
            href="/quote"
            className="hidden bg-[#ea0a0b] px-6 py-2.5 font-heading text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-[#0d0c0f] md:block"
          >
            Get a Quote
          </Link>
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="text-white lg:hidden">
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#0d0c0f] px-5 pb-6 lg:hidden">
          <nav className="container flex flex-col">
            {[...links, { label: 'Contact', href: '/contact' }].map((x) => (
              <Link
                key={x.href}
                href={x.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-4 font-heading text-lg font-semibold uppercase text-white"
              >
                {x.label}
              </Link>
            ))}
            <Link
              href="/quote"
              onClick={() => setOpen(false)}
              className="mt-5 bg-[#ea0a0b] py-3 text-center font-heading text-sm font-bold uppercase text-white"
            >
              Get a Quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}