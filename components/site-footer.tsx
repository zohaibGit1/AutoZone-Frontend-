import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a090c] pt-20">
      <div className="container grid gap-12 pb-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo size="lg" />
          <h3 className="mt-6 text-xl text-white font-heading font-semibold uppercase">Hello, We Are AutoZone</h3>
          <p className="mt-3 max-w-xs text-sm text-[#8b8b90]">
            Our experienced technicians provide quality detailing and automotive care for your cars.
          </p>
        </div>

        <div>
          <h3 className="text-xl text-white font-heading font-semibold uppercase">Office</h3>
          <p className="mt-5 text-sm leading-relaxed text-[#8b8b90]">
            Germany —<br />
            785 15th Street, Office 478<br />
            Berlin, DE 81566
          </p>
          <a
            href="mailto:info@autozone.com"
            className="mt-4 flex items-center gap-2 text-sm text-white hover:text-[#ea0a0b] transition-colors"
          >
            <Mail size={16} /> info@autozone.com
          </a>
          <a
            href="tel:+18005552569"
            className="mt-2 flex items-center gap-2 text-sm text-white hover:text-[#ea0a0b] transition-colors"
          >
            <Phone size={16} /> +1 800 555 25 69
          </a>
        </div>

        <div>
          <h3 className="text-xl text-white font-heading font-semibold uppercase">Links</h3>
          <ul className="mt-5 space-y-3 text-sm text-[#8b8b90]">
            {[
              ['Home', '/'],
              ['Services', '/services'],
              ['About Us', '/about'],
              ['Shop', '/shop'],
              ['Contacts', '/contact'],
              ['Staff Portal', '/employee/dashboard'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-[#ea0a0b] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl text-white font-heading font-semibold uppercase">Get in Touch</h3>
          <p className="mt-5 text-sm text-[#8b8b90]">
            Follow our latest detailing work and service updates.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              className="border border-white/15 px-4 py-2 text-xs uppercase text-white hover:border-[#ea0a0b] transition-colors"
            >
              Instagram
            </a>
            <a
              href="#"
              className="border border-white/15 px-4 py-2 text-xs uppercase text-white hover:border-[#ea0a0b] transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container flex flex-wrap items-center justify-between gap-4 text-sm text-[#8b8b90]">
          <div>
            AutoZone Detailing & Accessories © {new Date().getFullYear()}. All rights reserved.
          </div>
          <div>
            <Link
              href="/employee/dashboard"
              className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-[#ea0a0b] transition-colors"
            >
              Internal Employee Login →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
