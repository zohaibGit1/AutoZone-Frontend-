'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  ArrowUpRight,
  Car,
  CheckCircle2,
  FileCheck,
  Plus,
  Search,
  Shield,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EmployeeVehiclesPage() {
  const store = useWorkshopStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [bodyTypeFilter, setBodyTypeFilter] = useState<string>('ALL')

  const filteredVehicles = store.vehicles.filter((v) => {
    const owner = store.customers.find((c) => c.id === v.customerId)

    const matchesSearch =
      searchQuery === '' ||
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (owner && owner.fullName.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false
    if (bodyTypeFilter !== 'ALL' && v.bodyType !== bodyTypeFilter) return false
    return true
  })

  return (
    <WorkshopShell
      title="Vehicle Master Registry"
      subtitle="Digital service passports, maintenance records, and chassis specifications"
      actions={
        <Link
          href="/employee/jobs/new"
          className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-600 transition-all"
        >
          <Plus size={16} />
          <span>Intake Vehicle</span>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Registered Vehicles"
            value={store.vehicles.length}
            subvalue="master vehicle records"
            icon={<Car size={18} />}
          />
          <StatCard
            title="Active on Workshop Floor"
            value={
              store.jobs.filter(
                (j) => j.status !== 'DELIVERED' && j.status !== 'COMPLETED' && j.status !== 'CANCELLED'
              ).length
            }
            subvalue="currently in service"
            icon={<Wrench size={18} />}
            highlight={true}
          />
          <StatCard
            title="Supercars & Luxury Fleet"
            value={
              store.vehicles.filter(
                (v) => v.bodyType === 'SUPERCAR' || v.make === 'Porsche' || v.make === 'Mercedes-AMG'
              ).length
            }
            subvalue="high-end track & exotic vehicles"
            icon={<Shield size={18} />}
          />
        </div>

        {/* Search & Filter Matrix */}
        <PanelCard
          title={`Vehicles Database (${filteredVehicles.length} Vehicles)`}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={bodyTypeFilter}
                onChange={(e) => setBodyTypeFilter(e.target.value)}
                className="h-10 rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 text-xs sm:text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
              >
                <option value="ALL">All Body Types</option>
                <option value="SUPERCAR">Supercar / Exotic</option>
                <option value="COUPE">Coupe</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
              </select>

              <div className="relative w-64 sm:w-80">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plate, VIN, make, owner..."
                  className="h-10 w-full rounded-xl border border-white/20 bg-[#1d1c26] pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-400 focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>
            </div>
          }
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="px-5 py-3.5">License Plate</th>
                  <th className="px-5 py-3.5">Make & Model</th>
                  <th className="px-5 py-3.5">Year & Color</th>
                  <th className="px-5 py-3.5">Registered Owner</th>
                  <th className="px-5 py-3.5">Odometer</th>
                  <th className="px-5 py-3.5">Chassis VIN</th>
                  <th className="px-5 py-3.5">Service Visits</th>
                  <th className="px-5 py-3.5 text-right">Digital Passport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {filteredVehicles.map((v) => {
                  const owner = store.customers.find((c) => c.id === v.customerId)
                  const vJobs = store.jobs.filter((j) => j.vehicleId === v.id)
                  return (
                    <tr
                      key={v.id}
                      className="group transition-colors hover:bg-[#232230]"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-white text-sm sm:text-base">
                        <Link
                          href={`/employee/vehicles/${v.id}`}
                          className="hover:text-[#ea0a0b] transition-colors"
                        >
                          {v.registrationNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-heading text-base font-bold uppercase text-white">
                          {v.make} {v.model}
                        </div>
                        <div className="text-xs text-[#9e9ea6] font-normal">{v.variant || v.bodyType}</div>
                      </td>
                      <td className="px-5 py-4 text-zinc-300">
                        <div>
                          {v.year} • {v.color}
                        </div>
                        <div className="text-xs text-[#9e9ea6]">{v.fuelType}</div>
                      </td>
                      <td className="px-5 py-4">
                        {owner ? (
                          <Link
                            href={`/employee/customers/${owner.id}`}
                            className="font-medium text-white hover:text-[#ea0a0b] transition-colors"
                          >
                            {owner.fullName}
                          </Link>
                        ) : (
                          <span className="text-zinc-500">Unassigned</span>
                        )}
                        <div className="text-xs text-[#9e9ea6]">{owner?.phone}</div>
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold text-white">
                        {v.currentOdometer.toLocaleString()} km
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-zinc-400 truncate max-w-[140px]">
                        {v.vin}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-[#242330] px-2.5 py-1 font-mono text-xs font-bold text-zinc-200 border border-white/10">
                          {vJobs.length} Orders
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/employee/vehicles/${v.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-[#242330] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-200 transition-colors group-hover:border-[#ea0a0b] group-hover:bg-[#ea0a0b] group-hover:text-white"
                        >
                          <span>Passport</span>
                          <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredVehicles.length === 0 && (
              <div className="py-16 text-center text-sm text-[#9e9ea6]">
                No vehicles match your search query.
              </div>
            )}
          </div>
        </PanelCard>
      </div>
    </WorkshopShell>
  )
}
