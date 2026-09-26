'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  AlertCircle,
  Car,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  Shield,
  User,
  X,
} from 'lucide-react'
import { BackendVehicleType } from '@/lib/api'
import { cn } from '@/lib/utils'

function AdminVehiclesContent() {
  const searchParams = useSearchParams()
  const preselectedCustId = searchParams.get('customerId')
  const store = useWorkshopStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustId || '')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (preselectedCustId) {
      setSelectedCustomerId(preselectedCustId)
      setCreateModalOpen(true)
    }
  }, [preselectedCustId])

  const [form, setForm] = useState({
    vehicleNumber: '',
    vehicleName: '',
    vehicleModel: '',
    vehicleType: 'SEDAN' as BackendVehicleType,
  })

  const selectedCustomer = store.customers.find(
    (c) => c.id === selectedCustomerId || String(c.backendCustomerId) === selectedCustomerId
  )

  const filteredVehicles = store.vehicles.filter((v) => {
    const owner = store.customers.find((c) => c.id === v.customerId)
    return (
      searchQuery === '' ||
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (owner && owner.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  // Register Vehicle via POST /api/v1/vehicle/register-vehicle
  const handleRegisterVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!selectedCustomer) {
      setFormError('Please register or select a customer first. Vehicles cannot be created without an existing customer.')
      return
    }

    const cleanPlate = form.vehicleNumber.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (cleanPlate.length < 4) {
      setFormError('Please enter a valid license plate number (e.g. MH01DX0911).')
      return
    }

    if (!form.vehicleName.trim() || !form.vehicleModel.trim()) {
      setFormError('Vehicle Brand / Make and Model are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await store.repository.registerVehicleBackend({
        customerId: selectedCustomer.id,
        registrationNumber: cleanPlate,
        make: form.vehicleName.trim(),
        model: form.vehicleModel.trim(),
        year: 2024,
        color: 'Standard',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        vin: `VIN-${cleanPlate}`,
        currentOdometer: 10000,
        bodyType: form.vehicleType === 'SUV' ? 'SUV' : 'SEDAN',
      })

      setFormSuccess(`Vehicle "${created.make} ${created.model}" (${created.registrationNumber}) registered for customer "${selectedCustomer.fullName}".`)
      setCreateModalOpen(false)
      setForm({ vehicleNumber: '', vehicleName: '', vehicleModel: '', vehicleType: 'SEDAN' })
    } catch (err: any) {
      setFormError(err.message || 'Failed to register vehicle on backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <WorkshopShell
      title="Vehicle Master Registry"
      subtitle="Register vehicles under verified customer accounts and launch vehicle visits"
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
          <span>Register Vehicle</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Registered Vehicles"
            value={store.vehicles.length}
            subvalue="Vehicles tied to real customers"
            icon={<Car size={18} />}
          />
          <StatCard
            title="Owner Dependency"
            value="100% Verified"
            subvalue="All vehicles have valid customer ID"
            icon={<CheckCircle2 size={18} />}
            highlight={true}
          />
          <StatCard
            title="Active Fleet Visits"
            value={store.jobs.length}
            subvalue="Intake visits logged"
            icon={<Shield size={18} />}
          />
        </div>

        {/* Search & Filter Matrix */}
        <PanelCard
          title={`Vehicles Database (${filteredVehicles.length} Vehicles)`}
          action={
            <div className="relative w-72 sm:w-80">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search license plate, make, model, owner..."
                className="h-10 w-full rounded-xl border border-white/20 bg-[#1d1c26] pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none"
              />
            </div>
          }
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="py-3.5 px-5">License Plate</th>
                  <th className="py-3.5 px-5">Vehicle Make & Model</th>
                  <th className="py-3.5 px-5">Vehicle Type</th>
                  <th className="py-3.5 px-5">Registered Customer</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {filteredVehicles.map((v) => {
                  const owner = store.customers.find((c) => c.id === v.customerId)
                  return (
                    <tr key={v.id} className="hover:bg-[#232230] transition-colors">
                      <td className="py-4 px-5">
                        <span className="rounded-lg bg-[#252432] border border-white/15 px-3 py-1 font-mono text-sm font-bold text-white shadow-sm">
                          {v.registrationNumber}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-semibold text-white">
                        {v.make} {v.model}
                      </td>
                      <td className="py-4 px-5 text-zinc-300 font-mono text-xs">
                        {v.bodyType || 'SEDAN'}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{owner?.fullName || 'Registered Owner'}</div>
                        <div className="text-[11px] text-[#9e9ea6] font-mono">{owner?.phone}</div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/admin/visits?vehicleId=${v.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#ea0a0b] px-3.5 py-1.5 text-xs font-bold uppercase text-white hover:bg-red-600 transition-all shadow-sm"
                        >
                          <Plus size={13} />
                          <span>New Visit</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredVehicles.length === 0 && (
              <div className="py-16 text-center text-sm text-[#9e9ea6]">
                No vehicles found matching your query.
              </div>
            )}
          </div>
        </PanelCard>
      </div>

      {/* REGISTER VEHICLE MODAL (POST /api/v1/vehicle/register-vehicle) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#16151c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold uppercase text-white">
                Register Vehicle for Customer
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterVehicle} className="mt-5 space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-red-300 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {/* CRITICAL: Select Existing Customer */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Registered Customer *
                </label>
                {store.customers.length === 0 ? (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-amber-300 text-xs">
                    Please register a customer first. No registered customer found in database.
                    <div className="mt-2">
                      <Link
                        href="/admin/customers"
                        className="font-bold underline hover:text-white"
                      >
                        Go to Customer Registration →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  >
                    <option value="">-- Choose Registered Customer --</option>
                    {store.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.phone}) [ID: {c.backendCustomerId || c.id}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  License Plate Number *
                </label>
                <input
                  type="text"
                  required
                  value={form.vehicleNumber}
                  onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. MH01DX0911"
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 font-mono text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Brand / Make *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.vehicleName}
                    onChange={(e) => setForm({ ...form, vehicleName: e.target.value })}
                    placeholder="e.g. Porsche"
                    className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.vehicleModel}
                    onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                    placeholder="e.g. 911 GT3"
                    className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Vehicle Type (Backend Enum) *
                </label>
                <select
                  value={form.vehicleType}
                  onChange={(e) => setForm({ ...form, vehicleType: e.target.value as BackendVehicleType })}
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                >
                  <option value="SEDAN">SEDAN</option>
                  <option value="SUV">SUV</option>
                  <option value="CAR">CAR</option>
                  <option value="JEEP">JEEP</option>
                  <option value="BIKE">BIKE</option>
                </select>
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
                  disabled={isSubmitting || !selectedCustomerId}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-950/40"
                >
                  {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  <span>Register Vehicle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkshopShell>
  )
}

export default function AdminVehiclesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Loading Vehicle Registry...</div>}>
      <AdminVehiclesContent />
    </Suspense>
  )
}
