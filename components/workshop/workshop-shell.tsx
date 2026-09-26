'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import { EmployeeRole } from '@/lib/workshop/types'
import {
  Bell,
  Calendar,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  Wrench,
  X,
  Database,
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
  const router = useRouter()
  const store = useWorkshopStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true
    healthApi.checkHealth().then((res) => {
      if (isMounted) setBackendOnline(res.status === 'UP')
    })
    return () => {
      isMounted = false
    }
  }, [])

  // Keyboard shortcut Cmd+K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
        setMobileMenuOpen(false)
        setRoleDropdownOpen(false)
        setNotificationOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const searchResults = store.repository.searchAll(searchQuery)

  const activeJobsCount = store.jobs.filter(
    (j) => j.status !== 'DELIVERED' && j.status !== 'COMPLETED' && j.status !== 'CANCELLED'
  ).length

  const pendingApprovalsCount = store.jobs.filter(
    (j) => j.approvalStatus === 'AWAITING_APPROVAL' || j.status === 'AWAITING_APPROVAL'
  ).length

  // Dedicated navigation links (Single dominant intake CTA is positioned at top)
  const employeeLinks = [
    {
      label: 'Workshop Dashboard',
      href: '/employee/dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: 'Jobs & Service Orders',
      href: '/employee/jobs',
      icon: <FileText size={18} />,
      badge: activeJobsCount > 0 ? activeJobsCount : undefined,
    },
    {
      label: 'Customer Database',
      href: '/employee/customers',
      icon: <Users size={18} />,
    },
    {
      label: 'Vehicle Passports',
      href: '/employee/vehicles',
      icon: <Car size={18} />,
    },
    {
      label: 'Bay Schedule & Calendar',
      href: '/employee/calendar',
      icon: <Calendar size={18} />,
    },
    {
      label: 'Alerts & Approvals',
      href: '/employee/notifications',
      icon: <Bell size={18} />,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-[#ea0a0b]',
    },
  ]

  const adminLinks = [
    {
      label: 'Command Center',
      href: '/admin/dashboard',
      icon: <Shield size={18} />,
    },
    {
      label: 'Company Jobs Audit',
      href: '/admin/jobs',
      icon: <Layers size={18} />,
    },
    {
      label: 'Staff & Technicians',
      href: '/admin/employees',
      icon: <UserCheck size={18} />,
    },
    {
      label: 'Service Price Catalog',
      href: '/admin/services',
      icon: <Sparkles size={18} />,
    },
    {
      label: 'Chemicals & PPF Stock',
      href: '/admin/inventory',
      icon: <Package size={18} />,
    },
    {
      label: 'Financial Ledger',
      href: '/admin/payments',
      icon: <DollarSign size={18} />,
    },
    {
      label: 'Business Reports',
      href: '/admin/reports',
      icon: <FileSpreadsheet size={18} />,
    },
    {
      label: 'Workshop Settings',
      href: '/admin/settings',
      icon: <Settings size={18} />,
    },
  ]

  const handleRoleChange = (role: EmployeeRole) => {
    store.repository.setRole(role)
    setRoleDropdownOpen(false)
  }

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex min-h-screen w-full bg-[#0d0c0f] text-[#d6d6d8]">
      {/* Sidebar - Fixed 260px Desktop Layout */}
      <aside className="sticky top-0 hidden h-screen w-[260px] min-w-[260px] max-w-[260px] shrink-0 flex-col border-r border-white/10 bg-[#111015] lg:flex">
        {/* Compact, Perfectly Proportioned Brand Header */}
        <div className="flex h-[72px] shrink-0 items-center border-b border-white/10 bg-[#131217] px-5">
          <Link href="/employee/dashboard" className="flex items-center gap-3 focus:outline-none">
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
                Detailing & Accessories
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-none">
          {/* Dominant Primary Intake CTA */}
          <Link
            href="/employee/jobs/new"
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#ea0a0b] px-3.5 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-600 active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>New Service Intake</span>
          </Link>

          {/* Workshop Floor Navigation */}
          <div>
            <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8b90]">
              Workshop
            </div>
            <nav className="space-y-1">
              {employeeLinks.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/employee/dashboard' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex min-h-[42px] h-[42px] w-full items-center justify-between rounded-xl px-3 transition-all select-none',
                      isActive
                        ? 'bg-[#ea0a0b]/15 text-white border border-[#ea0a0b]/40 shadow-sm relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#ea0a0b] before:rounded-r'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
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
                      <span className={cn('text-xs font-bold uppercase tracking-wide truncate max-w-[155px]', isActive ? 'text-white' : 'text-zinc-300')}>
                        {item.label}
                      </span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white font-mono',
                          item.badgeColor || 'bg-zinc-800 border border-zinc-700'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Admin Command Navigation */}
          {(store.currentRole === 'ADMIN' || store.currentRole === 'MANAGER') && (
            <div className="pt-3 border-t border-white/10">
              <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8b90]">
                Admin
              </div>
              <nav className="space-y-1">
                {adminLinks.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex min-h-[42px] h-[42px] w-full items-center justify-between rounded-xl px-3 transition-all select-none',
                        isActive
                          ? 'bg-[#ea0a0b]/15 text-white border border-[#ea0a0b]/40 shadow-sm relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#ea0a0b] before:rounded-r'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
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
                        <span className={cn('text-xs font-bold uppercase tracking-wide truncate max-w-[155px]', isActive ? 'text-white' : 'text-zinc-300')}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Bottom Profile & Role Bar */}
        <div className="shrink-0 border-t border-white/10 p-3 bg-[#0d0c0f]">
          <div className="flex items-center justify-between rounded-xl bg-[#17161b] p-2.5 border border-white/10">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ea0a0b]/20 font-heading text-xs font-bold text-[#ea0a0b]">
                {store.currentEmployee?.fullName.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="truncate text-xs font-bold text-white">
                  {store.currentEmployee?.fullName}
                </div>
                <div className="truncate text-[9px] uppercase tracking-wider text-[#8b8b90]">
                  {store.currentRole}
                </div>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              title="View Public AutoZone Website"
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area — Expands to occupy all remaining viewport width */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0c0f]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          {/* Left: Mobile trigger & search */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#131217] text-zinc-300 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Quick Search Input */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 rounded-xl border border-white/15 bg-[#131217] px-3.5 py-2 text-xs text-[#8b8b90] transition-colors hover:border-white/30 sm:w-72 md:w-96"
            >
              <Search size={15} className="text-zinc-500" />
              <span className="hidden sm:inline">Search jobs, plates, VINs, customers...</span>
              <span className="sm:hidden">Search...</span>
              <kbd className="ml-auto hidden rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400 sm:inline-block">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Bay Status, Operational Date & Role Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Operational Context Date */}
            <div className="hidden items-center gap-2 text-xs font-semibold text-[#8b8b90] xl:flex">
              <Clock size={14} className="text-zinc-500" />
              <span>{currentDateFormatted}</span>
            </div>

            {/* Bay status pill */}
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-400 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>4 / 6 Bays Active</span>
            </div>

            {/* Backend API Connection Status */}
            <div
              className={cn(
                'hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:flex',
                backendOnline === true
                  ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-400'
                  : backendOnline === false
                  ? 'border-zinc-700 bg-zinc-900/60 text-zinc-400'
                  : 'border-white/10 bg-white/5 text-zinc-400'
              )}
              title={
                backendOnline
                  ? 'Spring Boot Backend API is connected'
                  : 'Spring Boot Backend is offline (Using cached local data)'
              }
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  backendOnline === true
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-zinc-500'
                )}
              />
              <Database size={11} />
              <span>{backendOnline ? 'API Connected' : 'API Standby'}</span>
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#17161b] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-200 transition-colors hover:border-white/30 shadow-sm"
              >
                <span className="text-[10px] text-[#8b8b90]">Role:</span>
                <span className="font-bold text-[#ea0a0b]">{store.currentRole}</span>
                <ChevronDown size={14} className="text-zinc-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/15 bg-[#17161b] p-2 shadow-2xl z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8b8b90]">
                    Switch Perspective (UI Simulation)
                  </div>
                  {(['ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN'] as EmployeeRole[]).map(
                    (r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleChange(r)}
                        className={cn(
                          'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors',
                          store.currentRole === r
                            ? 'bg-[#ea0a0b] text-white'
                            : 'text-zinc-300 hover:bg-white/5'
                        )}
                      >
                        <span>{r}</span>
                        {store.currentRole === r && <CheckCircle2 size={14} />}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                aria-label="Workshop Notifications"
                className="relative rounded-xl border border-white/15 bg-[#17161b] p-2 text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
              >
                <Bell size={17} />
                {pendingApprovalsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ea0a0b] text-[9px] font-bold text-white">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/15 bg-[#17161b] p-4 shadow-2xl z-50">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                      Workshop Alerts ({pendingApprovalsCount + 2})
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotificationOpen(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <Link
                      href="/employee/jobs/job-101"
                      onClick={() => setNotificationOpen(false)}
                      className="block rounded-xl border border-white/5 bg-white/[0.02] p-2.5 hover:border-white/20 transition-all"
                    >
                      <div className="font-semibold text-white">
                        AZ-101 (Porsche 911 GT3)
                      </div>
                      <div className="text-[11px] text-[#8b8b90] mt-0.5">
                        PPF Stage 1 complete. Ready for wheel ceramic coating.
                      </div>
                    </Link>
                    <Link
                      href="/employee/jobs/job-102"
                      onClick={() => setNotificationOpen(false)}
                      className="block rounded-xl border border-white/5 bg-white/[0.02] p-2.5 hover:border-white/20 transition-all"
                    >
                      <div className="font-semibold text-white">
                        AZ-102 (BMW M4)
                      </div>
                      <div className="text-[11px] text-[#8b8b90] mt-0.5">
                        Quality Check in progress under IR curing lamps.
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        store.repository.resetDefaults()
                        setNotificationOpen(false)
                      }}
                      className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-white/5"
                    >
                      <RotateCcw size={12} />
                      Reset Demo Data
                    </button>
                  </div>
                </div>
              )}
            </div>

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

      {/* Global Instant Search Modal (Cmd+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 p-4 pt-16 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#17161b] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
              <Search size={18} className="text-[#ea0a0b]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Job ID (AZ-101), License Plate (MH 01...), Customer, VIN, Make..."
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
              {searchQuery.trim() === '' ? (
                <div className="py-8 text-center text-xs text-[#8b8b90]">
                  Type at least 1 character to search active jobs, license plates, customer phone numbers, or VINs.
                </div>
              ) : (
                <>
                  {/* Matching Jobs */}
                  {searchResults.jobs.length > 0 && (
                    <div>
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#8b8b90]">
                        Service Orders ({searchResults.jobs.length})
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.jobs.map((job) => {
                          const cust = store.customers.find((c) => c.id === job.customerId)
                          const veh = store.vehicles.find((v) => v.id === job.vehicleId)
                          return (
                            <Link
                              key={job.id}
                              href={`/employee/jobs/${job.id}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between rounded-xl border border-white/5 bg-[#111015] p-3 hover:border-[#ea0a0b]/40 hover:bg-white/5 transition-all"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-heading font-bold text-white text-sm">
                                    {job.jobCode}
                                  </span>
                                  <span className="text-xs text-zinc-400">
                                    • {veh?.make} {veh?.model} ({veh?.registrationNumber})
                                  </span>
                                </div>
                                <div className="text-xs text-[#8b8b90] mt-0.5">
                                  Client: {cust?.fullName} ({cust?.phone})
                                </div>
                              </div>
                              <span className="text-xs font-bold text-[#ea0a0b] uppercase">
                                {job.status.replace(/_/g, ' ')}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matching Customers */}
                  {searchResults.customers.length > 0 && (
                    <div>
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#8b8b90]">
                        Customers ({searchResults.customers.length})
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.customers.map((c) => (
                          <Link
                            key={c.id}
                            href={`/employee/customers/${c.id}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-[#111015] p-3 hover:border-white/20 transition-all"
                          >
                            <div>
                              <div className="font-semibold text-white text-xs">{c.fullName}</div>
                              <div className="text-[11px] text-[#8b8b90]">
                                {c.phone} • {c.email}
                              </div>
                            </div>
                            <span className="text-xs text-zinc-400 font-mono">
                              {c.totalVisits} visits • ₹{c.totalSpent.toLocaleString('en-IN')}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Vehicles */}
                  {searchResults.vehicles.length > 0 && (
                    <div>
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#8b8b90]">
                        Vehicles ({searchResults.vehicles.length})
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.vehicles.map((v) => {
                          const owner = store.customers.find((c) => c.id === v.customerId)
                          return (
                            <Link
                              key={v.id}
                              href={`/employee/vehicles/${v.id}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between rounded-xl border border-white/5 bg-[#111015] p-3 hover:border-white/20 transition-all"
                            >
                              <div>
                                <div className="font-semibold text-white text-xs">
                                  {v.registrationNumber} — {v.make} {v.model}
                                </div>
                                <div className="text-[11px] text-[#8b8b90]">
                                  VIN: {v.vin} • Owner: {owner?.fullName}
                                </div>
                              </div>
                              <span className="text-xs text-zinc-400 font-mono">
                                {v.currentOdometer.toLocaleString()} km
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer (Compact, Zero-Clipping, 280px Width Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container: Bounded at 280px with box-sizing */}
          <div className="relative z-10 flex h-[100dvh] w-[280px] max-w-[80vw] flex-col bg-[#111015] border-r border-white/10 shadow-2xl overflow-hidden box-border">
            {/* Header: Proportional brand logo & close button */}
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 bg-[#131217] px-4">
              <Link
                href="/employee/dashboard"
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
                    Detailing & Accessories
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
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3.5 space-y-4 scrollbar-none">
              {/* Dominant Primary Action CTA */}
              <Link
                href="/employee/jobs/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#ea0a0b] px-3.5 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/50 transition-all hover:bg-red-600 active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>New Service Intake</span>
              </Link>

              {/* WORKSHOP Section */}
              <div>
                <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8b90]">
                  Workshop
                </div>
                <nav className="space-y-1">
                  {employeeLinks.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/employee/dashboard' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'group flex min-h-[42px] h-[42px] w-full items-center justify-between rounded-xl px-2.5 transition-all select-none',
                          isActive
                            ? 'bg-[#ea0a0b]/15 text-white border border-[#ea0a0b]/40 shadow-sm relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#ea0a0b] before:rounded-r'
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
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
                              'text-xs font-bold uppercase tracking-wide truncate max-w-[165px]',
                              isActive ? 'text-white' : 'text-zinc-300'
                            )}
                          >
                            {item.label}
                          </span>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={cn(
                              'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white font-mono',
                              item.badgeColor || 'bg-zinc-800 border border-zinc-700'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* ADMIN Section */}
              {(store.currentRole === 'ADMIN' || store.currentRole === 'MANAGER') && (
                <div className="pt-3 border-t border-white/10">
                  <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8b8b90]">
                    Admin
                  </div>
                  <nav className="space-y-1">
                    {adminLinks.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'group flex min-h-[42px] h-[42px] w-full items-center justify-between rounded-xl px-2.5 transition-all select-none',
                            isActive
                              ? 'bg-[#ea0a0b]/15 text-white border border-[#ea0a0b]/40 shadow-sm relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[#ea0a0b] before:rounded-r'
                              : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
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
                                'text-xs font-bold uppercase tracking-wide truncate max-w-[165px]',
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
              )}
            </div>

            {/* Bottom Profile and Customer Website Link */}
            <div className="shrink-0 border-t border-white/10 bg-[#0d0c0f] p-3 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-[#17161b] p-2 border border-white/10">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ea0a0b]/20 font-heading text-[11px] font-bold text-[#ea0a0b]">
                    {store.currentEmployee?.fullName.charAt(0) || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="truncate text-xs font-bold text-white">
                      {store.currentEmployee?.fullName}
                    </div>
                    <div className="truncate text-[9px] uppercase tracking-wider text-[#8b8b90]">
                      {store.currentRole}
                    </div>
                  </div>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  title="View Customer Facing Website"
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <ExternalLink size={14} />
                </Link>
              </div>

              <Link
                href="/"
                target="_blank"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
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
