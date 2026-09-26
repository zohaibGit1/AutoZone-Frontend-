'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { DamageDiagram } from '@/components/workshop/damage-diagram'
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
  Camera,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  Plus,
  Shield,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const store = useWorkshopStore()

  const vehicle = store.repository.getVehicleById(resolvedParams.id)

  if (!vehicle) {
    return (
      <WorkshopShell title="Vehicle Not Found">
        <div className="py-16 text-center">
          <h2 className="font-heading text-2xl font-bold uppercase text-white">
            Vehicle ID &quot;{resolvedParams.id}&quot; was not found.
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            This vehicle record may have been merged or removed.
          </p>
          <Link
            href="/employee/vehicles"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-600"
          >
            <ArrowLeft size={16} />
            <span>Return to Vehicles Registry</span>
          </Link>
        </div>
      </WorkshopShell>
    )
  }

  const owner = store.customers.find((c) => c.id === vehicle.customerId)
  const jobs = store.jobs.filter((j) => j.vehicleId === vehicle.id)

  const totalSpentOnVehicle = jobs.reduce((sum, j) => sum + j.actualFinalCost, 0)

  // Aggregate all photos and damages for this vehicle
  const allPhotos = jobs.flatMap((j) => j.photos)
  const allDamages = jobs.flatMap((j) => j.checkIn.preExistingDamages)

  return (
    <WorkshopShell
      title={`Vehicle Passport — ${vehicle.make} ${vehicle.model}`}
      subtitle={`Official AutoZone digital service passport for ${vehicle.registrationNumber}`}
      actions={
        <div className="flex items-center gap-3">
          <Link
            href="/employee/vehicles"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Vehicles Registry</span>
          </Link>
          <Link
            href="/employee/jobs/new"
            className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-600 transition-colors"
          >
            <Plus size={16} />
            <span>New Service Intake</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          <StatCard
            title="Service Passport Records"
            value={jobs.length}
            subvalue="detailing visits logged"
            icon={<FileCheck size={18} />}
          />
          <StatCard
            title="Cumulative Vehicle Spend"
            value={`₹${totalSpentOnVehicle.toLocaleString('en-IN')}`}
            subvalue="total care investment"
            icon={<DollarSign size={18} />}
          />
          <StatCard
            title="Last Recorded Odometer"
            value={`${vehicle.currentOdometer.toLocaleString()} km`}
            subvalue="verified mileage"
            icon={<Car size={18} />}
          />
          <StatCard
            title="Registered Owner"
            value={owner?.fullName?.split(' ')[0] || 'Client'}
            subvalue={owner?.phone}
            icon={<User size={18} />}
          />
        </div>

        {/* Chassis & Technical Specs Card */}
        <PanelCard title="Chassis & Factory Specifications">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-xs sm:text-sm">
            <div className="rounded-xl border border-white/[0.14] bg-[#1d1c26] p-4 shadow-sm">
              <span className="text-[#9e9ea6] uppercase text-[10px] font-bold tracking-wider">Plate #</span>
              <div className="font-mono font-bold text-white text-base mt-1 text-[#ea0a0b]">
                {vehicle.registrationNumber}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.14] bg-[#1d1c26] p-4 shadow-sm">
              <span className="text-[#9e9ea6] uppercase text-[10px] font-bold tracking-wider">Make & Model</span>
              <div className="font-semibold text-white mt-1">
                {vehicle.make} {vehicle.model}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.14] bg-[#1d1c26] p-4 shadow-sm">
              <span className="text-[#9e9ea6] uppercase text-[10px] font-bold tracking-wider">Year & Body</span>
              <div className="text-zinc-200 mt-1">
                {vehicle.year} • {vehicle.bodyType}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.14] bg-[#1d1c26] p-4 shadow-sm">
              <span className="text-[#9e9ea6] uppercase text-[10px] font-bold tracking-wider">Exterior Paint</span>
              <div className="text-zinc-200 mt-1">{vehicle.color}</div>
            </div>
            <div className="rounded-xl border border-white/[0.14] bg-[#1d1c26] p-4 shadow-sm">
              <span className="text-[#9e9ea6] uppercase text-[10px] font-bold tracking-wider">Powertrain</span>
              <div className="text-zinc-200 mt-1">
                {vehicle.fuelType} • {vehicle.transmission}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.14] bg-[#1d1c26] p-4 shadow-sm">
              <span className="text-[#9e9ea6] uppercase text-[10px] font-bold tracking-wider">Chassis VIN</span>
              <div className="font-mono text-zinc-300 truncate mt-1 text-xs">
                {vehicle.vin}
              </div>
            </div>
          </div>

          {vehicle.notes && (
            <div className="mt-4 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-4 text-xs sm:text-sm text-zinc-300">
              <span className="font-bold text-white uppercase text-[11px] tracking-wider block mb-1">
                Vehicle Specific Care Instructions:
              </span>
              <p className="leading-relaxed">{vehicle.notes}</p>
            </div>
          )}
        </PanelCard>

        {/* Service Orders Passport Timeline */}
        <PanelCard
          title={`Chronological Service Passport (${jobs.length} Records)`}
          subtitle="Permanent service history including ceramic coatings, PPF installations, and warranties"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="px-5 py-3.5">Job Code</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Odometer</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Services Performed</th>
                  <th className="px-5 py-3.5 text-right">Invoice Total</th>
                  <th className="px-5 py-3.5 text-right">Service Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#232230] transition-colors">
                    <td className="px-5 py-4 font-heading font-bold text-white text-base">
                      <Link
                        href={`/employee/jobs/${job.id}`}
                        className="hover:text-[#ea0a0b]"
                      >
                        {job.jobCode}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {new Date(job.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 font-mono text-zinc-300">
                      {job.checkIn.odometerReading.toLocaleString()} km
                    </td>
                    <td className="px-5 py-4">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-5 py-4 text-zinc-300">
                      {job.services.map((s) => s.title).join(', ') || 'Intake / Inspection'}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-white text-base text-right">
                      ₹{job.actualFinalCost.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/employee/jobs/${job.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-[#ea0a0b] hover:text-white transition-colors"
                      >
                        <span>View 360°</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {jobs.length === 0 && (
              <div className="py-12 text-center text-sm text-[#9e9ea6]">
                No service history logged for this vehicle yet.
              </div>
            )}
          </div>
        </PanelCard>

        {/* Historical Damage Logs */}
        {allDamages.length > 0 && (
          <PanelCard
            title={`Cumulative Body Damage History (${allDamages.length} Points Recorded)`}
            subtitle="Permanent matrix of pre-existing scratches, paint chips, and dents recorded across visits"
          >
            <DamageDiagram damages={allDamages} readOnly={true} />
          </PanelCard>
        )}

        {/* Historical Photo Transformations */}
        {allPhotos.length > 0 && (
          <PanelCard
            title={`Vehicle Transformation Gallery (${allPhotos.length} Photos)`}
            subtitle="Before, during, and after high-resolution condition documentation"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allPhotos.map((p) => (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-white/[0.14] bg-[#16151c] shadow-md"
                >
                  <div className="relative h-52 w-full bg-zinc-900">
                    <img
                      src={p.url}
                      alt={p.caption}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-bold uppercase text-white backdrop-blur">
                      {p.stage}
                    </span>
                  </div>
                  <div className="p-5 text-xs sm:text-sm">
                    <div className="font-semibold text-white">{p.caption}</div>
                    <div className="mt-2 text-xs text-[#9e9ea6]">
                      {new Date(p.uploadedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        )}
      </div>
    </WorkshopShell>
  )
}
