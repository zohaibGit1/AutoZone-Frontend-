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
  ArrowLeft,
  ArrowUpRight,
  Car,
  DollarSign,
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

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehForm.registrationNumber || !vehForm.make) return

    store.repository.createVehicle({
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                Contact Record
              </span>
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
              onClick={() => setAddVehicleModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition-colors shadow-md shadow-red-950/40"
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
                  className="rounded-2xl border border-white/[0.14] bg-[#1d1c26] p-5 sm:p-6 text-xs sm:text-sm transition-all hover:border-white/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-lg font-bold uppercase text-white">
                      {veh.make} {veh.model}
                    </span>
                    <span className="rounded-lg bg-[#242330] px-2.5 py-1 font-mono text-xs font-bold text-[#ea0a0b] border border-white/10">
                      {veh.registrationNumber}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-[#9e9ea6]">
                    <div className="text-zinc-300">
                      Specs: <strong className="text-white">{veh.year}</strong> • {veh.color} • {veh.fuelType}
                    </div>
                    <div className="font-mono text-xs truncate text-zinc-400">VIN: {veh.vin}</div>
                    <div className="text-zinc-300">
                      Odometer: <strong className="text-white">{veh.currentOdometer.toLocaleString()} km</strong>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5">
                    <span className="text-zinc-400 font-medium">{vehJobs.length} service orders</span>
                    <Link
                      href={`/employee/vehicles/${veh.id}`}
                      className="inline-flex items-center gap-1 font-bold text-[#ea0a0b] hover:underline uppercase text-xs tracking-wider"
                    >
                      <span>Passport</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </PanelCard>

        {/* Customer Service Orders History */}
        <PanelCard
          title={`Service History & Invoices (${jobs.length} Orders)`}
          subtitle="Chronological record of all detailing jobs performed for this client"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="px-5 py-3.5">Job Code</th>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Services Scope</th>
                  <th className="px-5 py-3.5 text-right">Total Cost</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {jobs.map((job) => {
                  const veh = store.vehicles.find((v) => v.id === job.vehicleId)
                  return (
                    <tr key={job.id} className="hover:bg-[#232230] transition-colors">
                      <td className="px-5 py-4 font-heading font-bold text-white text-base">
                        <Link href={`/employee/jobs/${job.id}`} className="hover:text-[#ea0a0b]">
                          {job.jobCode}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-semibold text-zinc-200">
                        {veh?.make} {veh?.model}{' '}
                        <span className="font-mono text-xs text-[#9e9ea6]">
                          ({veh?.registrationNumber})
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {new Date(job.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <JobStatusBadge status={job.status} />
                      </td>
                      <td className="px-5 py-4 text-zinc-300">
                        {job.services.length > 0
                          ? job.services.map((s) => s.title).join(', ')
                          : 'Inspection / Intake'}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-white text-base text-right">
                        ₹{job.actualFinalCost.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <PaymentStatusBadge status={job.paymentStatus} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/employee/jobs/${job.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-[#242330] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-[#ea0a0b] hover:text-white transition-colors"
                        >
                          <span>Manage</span>
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
                No jobs created for this customer yet.
              </div>
            )}
          </div>
        </PanelCard>

        {/* Modal: Add Vehicle */}
        {addVehicleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1a1922] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h4 className="font-heading text-xl font-bold uppercase text-white">
                  Add Vehicle to Customer Garage
                </h4>
                <button
                  type="button"
                  onClick={() => setAddVehicleModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      License Plate *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehForm.registrationNumber}
                      onChange={(e) =>
                        setVehForm({ ...vehForm, registrationNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. MH 01 DX 0911"
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
                      Year
                    </label>
                    <input
                      type="number"
                      value={vehForm.year}
                      onChange={(e) => setVehForm({ ...vehForm, year: Number(e.target.value) })}
                      className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
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
                    className="rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/40"
                  >
                    Save Vehicle
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
