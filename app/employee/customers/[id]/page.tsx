'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import {
  JobStatusBadge,
  PanelCard,
  PaymentStatusBadge,
  StatCard,
} from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Car,
  Database,
  DollarSign,
  Edit2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  User,
  Wrench,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const store = useWorkshopStore()

  const customer = store.repository.getCustomerById(resolvedParams.id)
  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false)
  const [editCustomerModalOpen, setEditCustomerModalOpen] = useState(false)
  const [isSubmittingVeh, setIsSubmittingVeh] = useState(false)
  const [isUpdatingCust, setIsUpdatingCust] = useState(false)
  const [vehError, setVehError] = useState<string | null>(null)
  const [custError, setCustError] = useState<string | null>(null)

  const [editForm, setEditForm] = useState({
    fullName: customer?.fullName || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    city: customer?.city || '',
    notes: customer?.notes || '',
  })

  const [vehForm, setVehForm] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    variant: '',
    year: 2024,
    color: '',
    fuelType: 'PETROL' as any,
    transmission: 'AUTOMATIC' as any,
    vin: '',
    currentOdometer: 10000,
    bodyType: 'SEDAN' as any,
    notes: '',
  })

  if (!customer) {
    return (
      <WorkshopShell title="Customer Profile Not Found">
        <div className="py-16 text-center">
          <h2 className="font-heading text-2xl font-bold uppercase text-white">
            Customer ID &quot;{resolvedParams.id}&quot; was not found.
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            This customer account may have been merged or removed.
          </p>
          <Link
            href="/employee/customers"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-600"
          >
            <ArrowLeft size={16} />
            <span>Return to Customers Master</span>
          </Link>
        </div>
      </WorkshopShell>
    )
  }

  const vehicles = store.repository.getVehiclesByCustomerId(customer.id)
  const jobs = store.jobs.filter((j) => j.customerId === customer.id)

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setVehError(null)
    if (!vehForm.registrationNumber || !vehForm.make) {
      setVehError('License plate and Make are required.')
      return
    }

    setIsSubmittingVeh(true)
    try {
      await store.repository.registerVehicleBackend({
        ...vehForm,
        customerId: customer.id,
        registrationNumber: vehForm.registrationNumber.toUpperCase(),
        vin: vehForm.vin.toUpperCase() || `VIN${Date.now()}`,
      })
      setAddVehicleModalOpen(false)
      setVehForm({
        registrationNumber: '',
        make: '',
        model: '',
        variant: '',
        year: 2024,
        color: '',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        vin: '',
        currentOdometer: 10000,
        bodyType: 'SEDAN',
        notes: '',
      })
    } catch (err: any) {
      setVehError(err.message || 'Failed to register vehicle.')
    } finally {
      setIsSubmittingVeh(false)
    }
  }

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setCustError(null)
    setIsUpdatingCust(true)
    try {
      await store.repository.updateCustomerBackend(customer.id, editForm)
      setEditCustomerModalOpen(false)
    } catch (err: any) {
      setCustError(err.message || 'Failed to update customer.')
    } finally {
      setIsUpdatingCust(false)
    }
  }

  return (
    <WorkshopShell
      title={`Customer 360 Profile — ${customer.fullName}`}
      subtitle="Complete client record, linked garage fleet, and historical detailing invoices"
      actions={
        <div className="flex items-center gap-3">
          <Link
            href="/employee/customers"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Customers List</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setEditForm({
                fullName: customer.fullName,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                city: customer.city,
                notes: customer.notes || '',
              })
              setEditCustomerModalOpen(true)
            }}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#242330] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:border-[#ea0a0b] hover:text-white transition-all cursor-pointer"
          >
            <Edit2 size={14} />
            <span>Edit Profile</span>
          </button>
          <Link
            href="/employee/jobs/new"
            className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-600 transition-colors"
          >
            <Plus size={16} />
            <span>New Service Order</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          <StatCard
            title="Total Workshop Visits"
            value={customer.totalVisits}
            subvalue="completed service orders"
            icon={<Wrench size={18} />}
          />
          <StatCard
            title="Lifetime Spend"
            value={`₹${customer.totalSpent.toLocaleString('en-IN')}`}
            subvalue="gross revenue"
            icon={<DollarSign size={18} />}
          />
          <StatCard
            title="Outstanding Balance"
            value={`₹${customer.outstandingBalance.toLocaleString('en-IN')}`}
            subvalue={customer.outstandingBalance === 0 ? 'Account settled' : 'Pending balance'}
            icon={<ShieldCheck size={18} />}
            highlight={customer.outstandingBalance > 0}
          />
          <StatCard
            title="Vehicles in Garage"
            value={vehicles.length}
            subvalue="registered fleet"
            icon={<Car size={18} />}
          />
        </div>

        {/* Customer Info Card */}
        <PanelCard title="Customer Information & Preferences">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-xs sm:text-sm">
            <div className="space-y-2 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  Contact Record
                </span>
                {customer.backendCustomerId && (
                  <span className="inline-flex items-center gap-1 rounded bg-red-950/40 border border-red-800/40 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-400">
                    <Database size={10} />
                    <span>DB #{customer.backendCustomerId}</span>
                  </span>
                )}
              </div>
              <div className="font-heading text-lg font-bold uppercase text-white">
                {customer.fullName}
              </div>
              <div className="text-zinc-200 font-medium flex items-center gap-2">
                <Phone size={14} className="text-[#ea0a0b]" />
                <span>{customer.phone}</span>
              </div>
              <div className="text-[#9e9ea6] flex items-center gap-2">
                <Mail size={14} className="text-[#ea0a0b]" />
                <span>{customer.email}</span>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                Location & Delivery Address
              </span>
              <div className="text-white font-medium">{customer.city}</div>
              <div className="text-zinc-300 leading-relaxed">{customer.address}</div>
            </div>

            <div className="space-y-2 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                Special Client Preferences
              </span>
              <div className="text-zinc-300 leading-relaxed">
                {customer.notes || 'No special client instructions logged.'}
              </div>
            </div>
          </div>
        </PanelCard>

        {/* Linked Vehicles */}
        <PanelCard
          title={`Registered Vehicles in Garage (${vehicles.length})`}
          subtitle="Vehicles serviced by AutoZone under this customer's account"
          action={
            <button
              type="button"
              onClick={() => {
                setVehError(null)
                setAddVehicleModalOpen(true)
              }}
              className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition-colors shadow-md shadow-red-950/40 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Vehicle</span>
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((veh) => {
              const vehJobs = jobs.filter((j) => j.vehicleId === veh.id)
              return (
                <div
                  key={veh.id}
                  className="rounded-2xl border border-white/[0.12] bg-[#181720] p-5 transition-all hover:border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-[#242330] px-2.5 py-1 font-mono text-xs font-bold text-white border border-white/10">
                          {veh.registrationNumber}
                        </span>
                        {veh.backendVehicleId && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-zinc-400">
                            <Database size={9} />
                            <span>#{veh.backendVehicleId}</span>
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2.5 font-heading text-lg font-bold uppercase text-white">
                        {veh.make} {veh.model}
                      </h4>
                      <p className="text-xs text-[#9e9ea6]">
                        {veh.variant || veh.bodyType} • {veh.year} • {veh.color}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-white/[0.08] pt-3">
                    <div>
                      <span className="text-[#9e9ea6]">Fuel / Trans:</span>
                      <p className="font-semibold text-zinc-200">
                        {veh.fuelType} / {veh.transmission}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#9e9ea6]">Odometer:</span>
                      <p className="font-mono font-semibold text-zinc-200">
                        {veh.currentOdometer.toLocaleString('en-IN')} KM
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
                    <span className="text-xs text-[#9e9ea6]">
                      {vehJobs.length} Service Orders
                    </span>
                    <Link
                      href={`/employee/vehicles/${veh.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase text-[#ea0a0b] hover:text-red-400"
                    >
                      <span>Details</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              )
            })}

            {vehicles.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-[#9e9ea6]">
                No vehicles registered for this client yet. Click &quot;Add Vehicle&quot; to register one.
              </div>
            )}
          </div>
        </PanelCard>

        {/* Historical Service Orders */}
        <PanelCard
          title={`Service History & Orders (${jobs.length})`}
          subtitle="All detailing, PPF, ceramic coating, and repair orders for this client"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="px-5 py-3.5">Job Code</th>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Job Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Invoice Total</th>
                  <th className="px-5 py-3.5 text-right">Balance Due</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {jobs.map((j) => {
                  const jobVeh = store.vehicles.find((v) => v.id === j.vehicleId)
                  return (
                    <tr key={j.id} className="hover:bg-[#232230] transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        <Link
                          href={`/employee/jobs/${j.id}`}
                          className="hover:text-[#ea0a0b] transition-colors"
                        >
                          {j.jobCode}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">
                          {jobVeh ? `${jobVeh.make} ${jobVeh.model}` : 'Vehicle'}
                        </div>
                        <div className="font-mono text-xs text-[#9e9ea6]">
                          {jobVeh?.registrationNumber}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <JobStatusBadge status={j.status} />
                      </td>
                      <td className="px-5 py-4">
                        <PaymentStatusBadge status={j.paymentStatus} />
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-white text-right">
                        ₹{j.actualFinalCost.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={cn(
                            'font-mono font-semibold',
                            j.balanceDue > 0 ? 'text-[#ea0a0b]' : 'text-emerald-400'
                          )}
                        >
                          ₹{j.balanceDue.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/employee/jobs/${j.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-[#242330] px-3 py-1 text-xs font-bold uppercase text-zinc-200 hover:border-[#ea0a0b] hover:bg-[#ea0a0b] hover:text-white transition-all"
                        >
                          <span>Open</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {jobs.length === 0 && (
              <div className="py-12 text-center text-sm text-[#9e9ea6]">
                No service history logged yet for this client.
              </div>
            )}
          </div>
        </PanelCard>

        {/* Modal: Add Vehicle */}
        {addVehicleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1a1922] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-heading text-xl font-bold uppercase text-white">
                    Add Vehicle to Garage
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Syncs with Backend Vehicle Registry
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddVehicleModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {vehError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{vehError}</span>
                </div>
              )}

              <form onSubmit={handleAddVehicle} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      License Plate * (e.g. MH01DX0911)
                    </label>
                    <input
                      type="text"
                      required
                      value={vehForm.registrationNumber}
                      onChange={(e) =>
                        setVehForm({ ...vehForm, registrationNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="MH01DX0911"
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white font-mono focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Make *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehForm.make}
                      onChange={(e) => setVehForm({ ...vehForm, make: e.target.value })}
                      placeholder="e.g. Porsche"
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Model *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehForm.model}
                      onChange={(e) => setVehForm({ ...vehForm, model: e.target.value })}
                      placeholder="e.g. 911 GT3"
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Vehicle Type
                    </label>
                    <select
                      value={vehForm.bodyType}
                      onChange={(e) => setVehForm({ ...vehForm, bodyType: e.target.value as any })}
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    >
                      <option value="SEDAN">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="COUPE">Coupe</option>
                      <option value="SUPERCAR">Supercar</option>
                      <option value="HATCHBACK">Hatchback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Color
                    </label>
                    <input
                      type="text"
                      value={vehForm.color}
                      onChange={(e) => setVehForm({ ...vehForm, color: e.target.value })}
                      placeholder="e.g. Shark Blue"
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddVehicleModalOpen(false)}
                    className="rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingVeh}
                    className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/40 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmittingVeh && <Loader2 size={14} className="animate-spin" />}
                    <span>{isSubmittingVeh ? 'Registering...' : 'Save Vehicle'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Customer */}
        {editCustomerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1a1922] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-heading text-xl font-bold uppercase text-white">
                    Edit Customer Profile
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Syncs updates to Backend Database
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditCustomerModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {custError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{custError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateCustomer} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
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
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Client Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditCustomerModalOpen(false)}
                    className="rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingCust}
                    className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/40 disabled:opacity-60 cursor-pointer"
                  >
                    {isUpdatingCust && <Loader2 size={14} className="animate-spin" />}
                    <span>{isUpdatingCust ? 'Updating...' : 'Save Changes'}</span>
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
