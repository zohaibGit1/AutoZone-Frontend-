'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  AlertCircle,
  ArrowUpRight,
  Car,
  Database,
  DollarSign,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EmployeeCustomersPage() {
  const store = useWorkshopStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearchingBackend, setIsSearchingBackend] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null)

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Mumbai',
    notes: '',
  })

  const totalSpend = store.customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const totalOutstanding = store.customers.reduce((sum, c) => sum + c.outstandingBalance, 0)

  const filteredCustomers = store.customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.fullName || !form.phone) {
      setFormError('Customer name and phone number are required.')
      return
    }

    // Validate phone number format (Indian 10-digit number starting with 6-9)
    const cleanPhone = form.phone.replace(/[^0-9]/g, '')
    const tenDigit = cleanPhone.slice(-10)
    if (!/^[6-9]\d{9}$/.test(tenDigit)) {
      setFormError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.')
      return
    }

    setIsSubmitting(true)
    try {
      await store.repository.registerCustomerBackend({
        ...form,
        phone: tenDigit,
      })
      setCreateModalOpen(false)
      setForm({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: 'Mumbai',
        notes: '',
      })
    } catch (err: any) {
      setFormError(err.message || 'Failed to register customer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackendSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearchingBackend(true)
    setSearchFeedback(null)
    try {
      const history = await store.repository.searchCustomerHistoryBackend(searchQuery.trim())
      if (history) {
        setSearchFeedback(`Found customer "${history.customerName}" from backend database.`)
      } else {
        setSearchFeedback(`No matching backend records for "${searchQuery}". Showing local results.`)
      }
    } catch {
      setSearchFeedback('Unable to reach backend database. Showing cached records.')
    } finally {
      setIsSearchingBackend(false)
      setTimeout(() => setSearchFeedback(null), 5000)
    }
  }

  return (
    <WorkshopShell
      title="Customer Master Database"
      subtitle="Complete client profiles, vehicle fleets, lifetime value, and service histories"
      actions={
        <button
          type="button"
          onClick={() => {
            setFormError(null)
            setCreateModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-600 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>New Customer Profile</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Registered Clients"
            value={store.customers.length}
            subvalue="active customer accounts"
            icon={<Users size={18} />}
          />
          <StatCard
            title="Cumulative Spend (LTV)"
            value={`₹${(totalSpend / 100000).toFixed(2)}L`}
            subvalue="total revenue generated"
            icon={<DollarSign size={18} />}
          />
          <StatCard
            title="Receivables Outstanding"
            value={`₹${totalOutstanding.toLocaleString('en-IN')}`}
            subvalue="pending payment balances"
            icon={<ShieldCheck size={18} />}
            highlight={totalOutstanding > 0}
          />
        </div>

        {/* Search and Table */}
        <PanelCard
          title={`Clients Directory (${filteredCustomers.length} Records)`}
          action={
            <div className="flex items-center gap-2">
              <div className="relative w-64 sm:w-80">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBackendSearch()
                  }}
                  placeholder="Search name, phone, email..."
                  className="h-10 w-full rounded-xl border border-white/20 bg-[#1d1c26] pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-400 focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleBackendSearch}
                disabled={isSearchingBackend || !searchQuery.trim()}
                title="Search Backend DB"
                className="flex h-10 items-center gap-1.5 rounded-xl border border-white/20 bg-[#242330] px-3 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:border-[#ea0a0b] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSearchingBackend ? (
                  <Loader2 size={14} className="animate-spin text-[#ea0a0b]" />
                ) : (
                  <RefreshCw size={14} />
                )}
                <span className="hidden sm:inline">DB Lookup</span>
              </button>
            </div>
          }
        >
          {searchFeedback && (
            <div className="mb-4 rounded-xl border border-white/10 bg-[#1d1c26] px-4 py-2.5 text-xs text-zinc-300 flex items-center gap-2">
              <Database size={14} className="text-[#ea0a0b]" />
              <span>{searchFeedback}</span>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">City & Address</th>
                  <th className="px-5 py-3.5">Garage Fleet</th>
                  <th className="px-5 py-3.5">Visits</th>
                  <th className="px-5 py-3.5 text-right">Lifetime Value</th>
                  <th className="px-5 py-3.5 text-right">Balance Due</th>
                  <th className="px-5 py-3.5 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {filteredCustomers.map((cust) => {
                  const vehicles = store.repository.getVehiclesByCustomerId(cust.id)
                  return (
                    <tr
                      key={cust.id}
                      className="group transition-colors hover:bg-[#232230]"
                    >
                      <td className="px-5 py-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/employee/customers/${cust.id}`}
                            className="font-heading text-base font-bold uppercase text-white hover:text-[#ea0a0b] transition-colors"
                          >
                            {cust.fullName}
                          </Link>
                          {cust.backendCustomerId && (
                            <span className="inline-flex items-center gap-1 rounded bg-red-950/40 border border-red-800/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400">
                              <Database size={10} />
                              <span>DB #{cust.backendCustomerId}</span>
                            </span>
                          )}
                        </div>
                        {cust.notes && (
                          <div className="text-xs text-[#9e9ea6] font-normal truncate max-w-xs mt-0.5">
                            {cust.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-zinc-200 font-medium">{cust.phone}</div>
                        <div className="text-xs text-[#9e9ea6]">{cust.email}</div>
                      </td>
                      <td className="px-5 py-4 text-zinc-300">
                        <div>{cust.city}</div>
                        <div className="text-xs text-[#9e9ea6] truncate max-w-[160px]">
                          {cust.address}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-white">
                          <Car size={15} className="text-[#ea0a0b]" />
                          <span>{vehicles.length} Vehicles</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-zinc-300 font-semibold">
                        {cust.totalVisits}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-white text-base text-right">
                        ₹{cust.totalSpent.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={cn(
                            'font-mono font-semibold',
                            cust.outstandingBalance > 0
                              ? 'text-[#ea0a0b]'
                              : 'text-emerald-400'
                          )}
                        >
                          ₹{cust.outstandingBalance.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/employee/customers/${cust.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-[#242330] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-200 transition-colors group-hover:border-[#ea0a0b] group-hover:bg-[#ea0a0b] group-hover:text-white"
                        >
                          <span>View 360</span>
                          <ArrowUpRight size={14} className="text-[#ea0a0b] group-hover:text-white" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="py-16 text-center text-sm text-[#9e9ea6]">
                No client records match your search criteria.
              </div>
            )}
          </div>
        </PanelCard>

        {/* Modal: Create Customer */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1a1922] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-heading text-xl font-bold uppercase text-white">
                    Add New Customer Profile
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Syncs with AutoZone Backend Database
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateCustomer} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. Yashvardhan Singhania"
                    className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Mobile Number * (10 Digits)
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="9820012345"
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="client@luxury.in"
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Street / Area Address
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Altamount Road, South Mumbai"
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    VIP / Client Notes
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Prefers contactless delivery, track days enthusiast..."
                    className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/40 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    <span>{isSubmitting ? 'Registering...' : 'Create Profile'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkshopShell>
  )
}
