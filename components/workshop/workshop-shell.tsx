'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Car,
  Clock,
  Database,
  DollarSign,
  ExternalLink,
  Menu,
  Users,
  X,
} from 'lucide-react'
import { healthApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface WorkshopShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export function WorkshopShell({
  children,
  title,
  subtitle,
  actions,
}: WorkshopShellProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true
    const checkHealth = () => {
      healthApi.checkHealth().then((res) => {
        if (isMounted) setBackendOnline(res.status === 'UP')
      })
    }
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Strict backend-supported Admin navigation links
  const adminLinks = [
    {
      label: 'Customers',
      href: '/admin/customers',
      icon: <Users size={18} />,
    },
    {
      label: 'Vehicles',
      href: '/admin/vehicles',
      icon: <Car size={18} />,
    },
    {
      label: 'Vehicle Visits',
      href: '/admin/visits',
      icon: <Clock size={18} />,
    },
    {
      label: 'Invoices & Payments',
      href: '/admin/invoices',
      icon: <DollarSign size={18} />,
    },
    {
      label: 'Backend Health',
      href: '/admin/health',
      icon: <Database size={18} />,
    },
  ]

  return (
    <div className="flex min-h-screen w-full bg-[#0d0c0f] text-[#d6d6d8]">
      {/* Sidebar - Fixed 260px Desktop Layout */}
      <aside className="sticky top-0 hidden h-screen w-[260px] min-w-[260px] max-w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#111015] lg:flex">
        {/* Brand Header */}
        <div className="flex h-[72px] shrink-0 items-center border-b border-white/10 bg-[#131217] px-5">
          <Link href="/admin/customers" className="flex items-center gap-3 focus:outline-none">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10">
              <Image
                src="/images/autozone-logo.png"
                alt="AutoZone"
                width={40}
                height={40}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="font-heading text-lg font-extrabold uppercase tracking-wider text-white">
                AUTO<span className="text-[#ea0a0b]">ZONE</span>
              </span>
              <span className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-[#8b8b90] mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-5 scrollbar-none">
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b8b90]">
              Admin
            </div>
            <nav className="space-y-1.5">
              {adminLinks.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex min-h-[44px] h-[44px] w-full items-center justify-between rounded-xl px-3 transition-all select-none',
                      isActive
                        ? 'bg-[#ea0a0b]/15 text-white border border-[#ea0a0b]/40 shadow-sm relative before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-[#ea0a0b] before:rounded-r'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                          isActive
                            ? 'text-[#ea0a0b]'
                            : 'text-zinc-500 group-hover:text-zinc-300'
                        )}
                      >
                        {item.icon}
                      </div>
                      <span
                        className={cn(
                          'text-xs font-bold uppercase tracking-wide truncate max-w-[170px]',
                          isActive ? 'text-white' : 'text-zinc-300'
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Backend Status & Public Website Link */}
        <div className="shrink-0 border-t border-white/10 p-3 bg-[#0d0c0f] space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-[#17161b] p-2.5 border border-white/10">
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className={cn(
                  'h-2 w-2 rounded-full shrink-0',
                  backendOnline === true
                    ? 'bg-emerald-400 animate-pulse'
                    : backendOnline === false
                    ? 'bg-red-500'
                    : 'bg-zinc-500'
                )}
              />
              <div className="overflow-hidden">
                <div className="truncate text-xs font-bold text-white">
                  Spring Boot API
                </div>
                <div className="truncate text-[10px] uppercase tracking-wider text-[#8b8b90]">
                  {backendOnline === true
                    ? 'Online (Port 8081)'
                    : backendOnline === false
                    ? 'Offline / Standby'
                    : 'Checking Status...'}
                </div>
              </div>
            </div>

            <Link
              href="/admin/health"
              title="View Health Actuator"
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Database size={14} />
            </Link>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ExternalLink size={13} />
            <span>Visit Customer Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0c0f]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          {/* Left: Mobile trigger & breadcrumb */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#131217] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#8b8b90]">
                AutoZone Admin
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {title || 'Management'}
              </span>
            </div>
          </div>

          {/* Right: Backend API Connection Status & Public Site Link */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Backend API Connection Status */}
            <Link
              href="/admin/health"
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                backendOnline === true
                  ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/50'
                  : backendOnline === false
                  ? 'border-red-900/40 bg-red-950/30 text-red-400 hover:bg-red-950/50'
                  : 'border-white/10 bg-white/5 text-zinc-400'
              )}
              title="Spring Boot Backend Status (Actuator Health)"
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  backendOnline === true
                    ? 'bg-emerald-400 animate-pulse'
                    : backendOnline === false
                    ? 'bg-red-500'
                    : 'bg-zinc-500'
                )}
              />
              <Database size={12} />
              <span>{backendOnline ? 'Backend: Online' : 'Backend: Standby'}</span>
            </Link>

            {/* Quick Public Site Link */}
            <Link
              href="/"
              target="_blank"
              className="hidden rounded-xl border border-white/15 bg-[#17161b] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:bg-white/5 hover:text-white sm:flex items-center gap-2"
            >
              <span>Public Site</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        {/* Optional Page Header */}
        {(title || actions) && (
          <div className="border-b border-white/10 bg-[#111015]/70 px-4 py-5 sm:px-6 lg:px-8">
            <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
              <div>
                {title && (
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1 text-xs text-[#8b8b90] sm:text-sm leading-relaxed max-w-3xl">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
            </div>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative z-10 flex h-[100dvh] w-[280px] max-w-[80vw] flex-col bg-[#111015] border-r border-white/10 shadow-2xl overflow-hidden box-border">
            {/* Header */}
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[#131217] px-4">
              <Link
                href="/admin/customers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 focus:outline-none shrink-0"
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10">
                  <Image
                    src="/images/autozone-logo.png"
                    alt="AutoZone"
                    width={36}
                    height={36}
                    priority
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center leading-none">
                  <span className="font-heading text-base font-extrabold uppercase tracking-wider text-white">
                    AUTO<span className="text-[#ea0a0b]">ZONE</span>
                  </span>
                  <span className="font-heading text-[8px] font-bold uppercase tracking-[0.2em] text-[#8b8b90] mt-0.5">
                    Admin Panel
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Navigation Menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-4 scrollbar-none">
              <div>
                <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b8b90]">
                  Admin
                </div>
                <nav className="space-y-1.5">
                  {adminLinks.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'group flex min-h-[44px] h-[44px] w-full items-center justify-between rounded-xl px-3 transition-all select-none',
                          isActive
                            ? 'bg-[#ea0a0b]/15 text-white border border-[#ea0a0b]/40 shadow-sm relative before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-[#ea0a0b] before:rounded-r'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                              isActive
                                ? 'text-[#ea0a0b]'
                                : 'text-zinc-500 group-hover:text-zinc-300'
                            )}
                          >
                            {item.icon}
                          </div>
                          <span
                            className={cn(
                              'text-xs font-bold uppercase tracking-wide truncate max-w-[170px]',
                              isActive ? 'text-white' : 'text-zinc-300'
                            )}
                          >
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Bottom Backend Status & Website Link */}
            <div className="shrink-0 border-t border-white/10 bg-[#0d0c0f] p-3 space-y-2">
              <Link
                href="/admin/health"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl bg-[#17161b] p-2.5 border border-white/10"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      backendOnline === true ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                    )}
                  />
                  <div className="overflow-hidden">
                    <div className="truncate text-xs font-bold text-white">
                      Spring Boot API
                    </div>
                    <div className="truncate text-[9px] uppercase tracking-wider text-[#8b8b90]">
                      {backendOnline ? 'Online' : 'Standby'}
                    </div>
                  </div>
                </div>
                <Database size={14} className="text-zinc-400" />
              </Link>

              <Link
                href="/"
                target="_blank"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ExternalLink size={12} />
                <span>Visit Customer Website</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
