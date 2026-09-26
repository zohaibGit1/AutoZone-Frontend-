'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { JobStatusBadge, PanelCard, PriorityBadge } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  User,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function WorkshopCalendarPage() {
  const store = useWorkshopStore()
  const [selectedDay, setSelectedDay] = useState(26)

  const BAYS = [
    { id: 'Bay 1', name: 'Bay 1 (Master Clean Room)', tech: 'Kabir Sengupta (PPF Master)' },
    { id: 'Bay 2', name: 'Bay 2 (Coating & Detailing)', tech: 'Rajesh Sharma (Ceramic Lead)' },
    { id: 'Bay 3', name: 'Bay 3 (Delivery Staging)', tech: 'Vikram Malhotra (Quality Inspector)' },
    { id: 'Bay 4', name: 'Bay 4 (Wash & Decon)', tech: 'Siddharth Rao (Steam & Decon)' },
    { id: 'Bay 5', name: 'Bay 5 (Interior Spa)', tech: 'Siddharth Rao (Leather Care)' },
    { id: 'Bay 6', name: 'Bay 6 (Paint Correction)', tech: 'Rajesh Sharma (Master Detailer)' },
  ]

  const DAYS = [
    { date: 24, day: 'Wed', count: 2 },
    { date: 25, day: 'Thu', count: 3 },
    { date: 26, day: 'Fri (Today)', count: 4, isToday: true },
    { date: 27, day: 'Sat', count: 3 },
    { date: 28, day: 'Sun', count: 1 },
    { date: 29, day: 'Mon', count: 2 },
    { date: 30, day: 'Tue', count: 0 },
  ]

  return (
    <WorkshopShell
      title="Workshop Bay & Technician Schedule"
      subtitle="Live bay allocations, scheduled detailing appointments, and delivery milestones"
      actions={
        <Link
          href="/employee/jobs/new"
          className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-600 transition-all"
        >
          <Plus size={16} />
          <span>Book Bay / New Intake</span>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Date Selector Strip */}
        <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ea0a0b]/20 text-[#ea0a0b]">
                <Calendar size={20} />
              </div>
              <div>
                <span className="font-heading text-xl font-bold uppercase text-white">
                  September 2026
                </span>
                <p className="text-xs text-[#9e9ea6]">Select a day to inspect bay allocation queues</p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {DAYS.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDay(d.date)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-xl px-5 py-3 text-xs font-bold uppercase transition-all min-w-[88px]',
                    selectedDay === d.date
                      ? 'bg-[#ea0a0b] text-white shadow-lg shadow-red-950/50 scale-105'
                      : 'border border-white/[0.12] bg-[#242330] text-[#c0c0c6] hover:bg-[#2c2b3a] hover:text-white'
                  )}
                >
                  <span className="text-[10px] opacity-80 font-medium">{d.day}</span>
                  <span className="text-lg font-bold font-heading mt-0.5">{d.date}</span>
                  <span className="text-[10px] opacity-75 mt-0.5">{d.count} Jobs</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bays Visual Matrix */}
        <PanelCard
          title="Floor Bay Allocations & Work Queues"
          subtitle="Real-time status of service bays, assigned master technicians, and current vehicles"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BAYS.map((bay) => {
              const activeJob = store.jobs.find((j) => j.bayNumber?.includes(bay.id))
              const vehicle = activeJob
                ? store.vehicles.find((v) => v.id === activeJob.vehicleId)
                : null
              const customer = activeJob
                ? store.customers.find((c) => c.id === activeJob.customerId)
                : null

              return (
                <div
                  key={bay.id}
                  className={cn(
                    'rounded-2xl border p-6 transition-all',
                    activeJob
                      ? 'border-white/[0.14] bg-[#16151c] hover:border-[#ea0a0b]/40 shadow-lg'
                      : 'border-dashed border-white/[0.14] bg-[#16151c]/60'
                  )}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="font-heading text-base font-bold uppercase text-white">
                        {bay.name}
                      </span>
                      <p className="text-xs text-[#9e9ea6] mt-1">{bay.tech}</p>
                    </div>
                    <span
                      className={cn(
                        'flex h-3.5 w-3.5 rounded-full',
                        activeJob ? 'bg-[#ea0a0b] animate-pulse shadow-md shadow-red-500/50' : 'bg-zinc-700'
                      )}
                    />
                  </div>

                  {activeJob && vehicle ? (
                    <div className="mt-5 space-y-4 text-xs sm:text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/employee/jobs/${activeJob.id}`}
                            className="font-heading font-bold text-white text-base hover:text-[#ea0a0b] transition-colors"
                          >
                            {activeJob.jobCode} — {vehicle.make} {vehicle.model}
                          </Link>
                          <div className="font-mono text-zinc-300 text-xs mt-0.5">
                            {vehicle.registrationNumber} • {customer?.fullName}
                          </div>
                        </div>
                        <JobStatusBadge status={activeJob.status} />
                      </div>

                      <div className="rounded-xl bg-[#1d1c26] p-4 space-y-2 text-xs border border-white/[0.12]">
                        <div className="flex justify-between text-zinc-400">
                          <span>Service Scope:</span>
                          <span className="font-semibold text-white truncate max-w-[170px]">
                            {activeJob.services[0]?.title || 'Multi-stage detailing'}
                          </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Delivery Target:</span>
                          <span className="font-mono text-white">
                            {new Date(activeJob.expectedDeliveryDate).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                        <span className="text-zinc-300 font-mono font-semibold">
                          ₹{activeJob.actualFinalCost.toLocaleString('en-IN')}
                        </span>
                        <Link
                          href={`/employee/jobs/${activeJob.id}`}
                          className="font-bold text-[#ea0a0b] hover:underline uppercase text-xs tracking-wider"
                        >
                          View Job Detail →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-zinc-500">
                      Bay currently vacant. Ready for incoming vehicle intake.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </PanelCard>
      </div>
    </WorkshopShell>
  )
}
