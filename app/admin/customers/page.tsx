'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  AlertCircle,
  ArrowRight,
  Car,
  CheckCircle2,
  Edit2,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  User,
  Users,
  X,
} from 'lucide-react'
import { customersApi, CustomerHistoryDto } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function AdminCustomersPage() {
  const store = useWorkshopStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<CustomerHistoryDto | null>(null)
  const [searchMessage, setSearchMessage] = useState<string | null>(null)

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCustForEdit, setSelectedCustForEdit] = useState<{
    id: string
    backendId?: number
    fullName: string
    phone: string
    email: string
  } | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const [registerForm, setRegisterForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
  })

  const [editForm, setEditForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
  })

  // 1. Search Customer via Backend GET /api/v1/customers/history?search=...
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchMessage(null)
    setSearchResult(null)

    try {
      const res = await store.repository.searchCustomerHistoryBackend(searchQuery.trim())
      if (res && res.customerId) {
        setSearchResult(res)
        setSearchMessage(`Found customer "${res.customerName}" (ID: ${res.customerId}) in database.`)
      } else {
        setSearchMessage(`No customer found for "${searchQuery}". You can register them below.`)
      }
    } catch {
      setSearchMessage(`Search query failed. Showing matching cached records.`)
    } finally {
      setIsSearching(false)
    }
  }

  // 2. Register Customer via Backend POST /api/v1/customers/register-customer
  const handleRegisterCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    const cleanPhone = registerForm.customerPhone.replace(/[^0-9]/g, '').slice(-10)
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number (e.g. 9820012345).')
      return
    }

    if (!registerForm.customerName.trim() || !registerForm.customerEmail.trim()) {
      setFormError('Customer Name and Email are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await store.repository.registerCustomerBackend({
        fullName: registerForm.customerName.trim(),
        phone: cleanPhone,
        email: registerForm.customerEmail.trim(),
        address: 'Workshop Customer',
        city: 'Mumbai',
      })

      setFormSuccess(`Customer "${created.fullName}" successfully registered (Backend ID: ${created.backendCustomerId || created.id}).`)
      setCreateModalOpen(false)
      setRegisterForm({ customerName: '', customerPhone: '', customerEmail: '' })
      setSearchQuery(cleanPhone)
      handleSearch()
    } catch (err: any) {
      setFormError(err.message || 'Failed to register customer on backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 3. Update Customer via Backend PATCH /api/v1/customers/update-customer/{customerId}
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustForEdit) return

    setFormError(null)
    const cleanPhone = editForm.customerPhone.replace(/[^0-9]/g, '').slice(-10)
    if (editForm.customerPhone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFormError('Please enter a valid 10-digit mobile number.')
      return
    }

    setIsSubmitting(true)
    try {
      await store.repository.updateCustomerBackend(selectedCustForEdit.id, {
        fullName: editForm.customerName.trim(),
        phone: cleanPhone,
        email: editForm.customerEmail.trim(),
      })
      setEditModalOpen(false)
      setSelectedCustForEdit(null)
      setSearchMessage(`Customer updated successfully.`)
    } catch (err: any) {
      setFormError(err.message || 'Failed to update customer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (cust: { id: string; backendCustomerId?: number; fullName: string; phone: string; email: string }) => {
    setSelectedCustForEdit({
      id: cust.id,
      backendId: cust.backendCustomerId,
      fullName: cust.fullName,
      phone: cust.phone,
      email: cust.email,
    })
    setEditForm({
      customerName: cust.fullName,
      customerPhone: cust.phone,
      customerEmail: cust.email,
    })
    setFormError(null)
    setEditModalOpen(true)
  }

  return (
    <WorkshopShell
      title="Customer Master Database"
      subtitle="Search existing accounts or register a customer before adding vehicles and visits"
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
          <span>Register New Customer</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Metric Summary */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Registered Customers"
            value={store.customers.length}
            subvalue="Total customer accounts"
            icon={<Users size={18} />}
          />
          <StatCard
            title="Registered Fleet"
            value={store.vehicles.length}
            subvalue="Customer vehicles in database"
            icon={<Car size={18} />}
          />
          <StatCard
            title="Workflow Rule"
            value="Customer First"
            subvalue="Vehicles require existing customer"
            icon={<CheckCircle2 size={18} />}
            highlight={true}
          />
        </div>

        {/* Search Matrix */}
        <PanelCard
          title="Customer Lookup (Backend Search)"
          subtitle="Query the Spring Boot backend by 10-digit mobile number or customer email"
        >
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter 10-digit phone number (e.g. 9820012345) or email..."
                className="h-11 w-full rounded-xl border border-white/20 bg-[#1d1c26] pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:ring-1 focus:ring-[#ea0a0b] focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {isSearching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              <span>Search Database</span>
            </button>
          </form>

          {searchMessage && (
            <div className="mt-4 rounded-xl border border-white/10 bg-[#16151c] p-3 text-xs text-zinc-300">
              {searchMessage}
            </div>
          )}

          {/* Backend Search Result Detail Card */}
          {searchResult && (
            <div className="mt-6 rounded-2xl border border-[#ea0a0b]/40 bg-[#ea0a0b]/10 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ea0a0b]/20 font-heading text-xl font-bold text-[#ea0a0b] border border-[#ea0a0b]/40">
                    {searchResult.customerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold uppercase text-white">
                      {searchResult.customerName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#9e9ea6]">
                      <span className="font-mono text-[#ea0a0b]">ID: {searchResult.customerId}</span>
                      <span>•</span>
                      <span>{searchResult.customerPhone}</span>
                      <span>•</span>
                      <span>{searchResult.customerEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/vehicles?customerId=${searchResult.customerId}`}
                    className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-4 py-2 text-xs font-bold uppercase text-white hover:bg-red-600 transition-all"
                  >
                    <Plus size={14} />
                    <span>Register Vehicle</span>
                  </Link>
                </div>
              </div>

              {/* Associated Vehicles from Backend */}
              <div className="mt-5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block mb-3">
                  Registered Vehicles ({searchResult.vehicles?.length || 0})
                </span>
                {searchResult.vehicles && searchResult.vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {searchResult.vehicles.map((v) => (
                      <div
                        key={v.vehicleId}
                        className="rounded-xl border border-white/10 bg-[#16151c] p-4 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {v.vehicleName} {v.vehicleModel}
                          </div>
                          <div className="font-mono text-xs font-bold text-[#ea0a0b] mt-0.5">
                            {v.vehicleNumber} ({v.vehicleType})
                          </div>
                        </div>
                        <Link
                          href={`/admin/visits?vehicleId=${v.vehicleId}`}
                          className="rounded-lg bg-[#252432] border border-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-[#ea0a0b] transition-all"
                        >
                          New Visit →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">
                    No vehicles registered yet for this customer. Click &quot;Register Vehicle&quot; to add one.
                  </p>
                )}
              </div>
            </div>
          )}
        </PanelCard>

        {/* Customers Table */}
        <PanelCard
          title={`All Registered Customers (${store.customers.length})`}
          subtitle="Master accounts in the AutoZone database"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="py-3.5 px-5">Customer Name</th>
                  <th className="py-3.5 px-5">Mobile Number</th>
                  <th className="py-3.5 px-5">Email Address</th>
                  <th className="py-3.5 px-5 text-right">Vehicles</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {store.customers.map((c) => {
                  const custVehicles = store.repository.getVehiclesByCustomerId(c.id)
                  return (
                    <tr key={c.id} className="hover:bg-[#232230] transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{c.fullName}</div>
                        <div className="text-[11px] text-[#9e9ea6] font-mono">
                          ID: {c.backendCustomerId || c.id}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono text-zinc-200">{c.phone}</td>
                      <td className="py-4 px-5 text-zinc-300">{c.email}</td>
                      <td className="py-4 px-5 font-bold font-mono text-right text-white">
                        {custVehicles.length}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="rounded-lg bg-[#252432] border border-white/15 p-2 text-zinc-300 hover:text-white hover:bg-[#302f40] transition-all"
                            title="Edit Customer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <Link
                            href={`/admin/vehicles?customerId=${c.id}`}
                            className="rounded-lg bg-[#ea0a0b]/20 border border-[#ea0a0b]/40 px-3 py-1 text-xs font-bold text-[#ea0a0b] hover:bg-[#ea0a0b] hover:text-white transition-all"
                          >
                            + Vehicle
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </div>

      {/* CREATE CUSTOMER MODAL (POST /api/v1/customers/register-customer) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#16151c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold uppercase text-white">
                Register Customer on Backend
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterCustomer} className="mt-5 space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-red-300 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.customerName}
                  onChange={(e) => setRegisterForm({ ...registerForm, customerName: e.target.value })}
                  placeholder="e.g. Rohan Singhania"
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Mobile Number (10-digit Indian Number) *
                </label>
                <input
                  type="tel"
                  required
                  value={registerForm.customerPhone}
                  onChange={(e) => setRegisterForm({ ...registerForm, customerPhone: e.target.value })}
                  placeholder="e.g. 9820012345"
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 font-mono text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={registerForm.customerEmail}
                  onChange={(e) => setRegisterForm({ ...registerForm, customerEmail: e.target.value })}
                  placeholder="e.g. rohan@autozone.com"
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold uppercase text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-950/40"
                >
                  {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  <span>Register Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL (PATCH /api/v1/customers/update-customer/{customerId}) */}
      {editModalOpen && selectedCustForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#16151c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold uppercase text-white">
                Update Customer (ID: {selectedCustForEdit.backendId || selectedCustForEdit.id})
              </h3>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="mt-5 space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-red-300 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={editForm.customerPhone}
                  onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 font-mono text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.customerEmail}
                  onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold uppercase text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Edit2 size={15} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkshopShell>
  )
}
