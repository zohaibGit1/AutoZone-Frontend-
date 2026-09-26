'use client'

import React from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { JobStatusBadge, PanelCard, PriorityBadge } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function WorkshopNotificationsPage() {
  const store = useWorkshopStore()

  const pendingApprovals = store.jobs.filter(
    (j) => j.approvalStatus === 'AWAITING_APPROVAL' || j.status === 'AWAITING_APPROVAL'
  )
  const readyForDeliveries = store.jobs.filter((j) => j.status === 'READY_FOR_DELIVERY')
  const qualityChecks = store.jobs.filter((j) => j.status === 'QUALITY_CHECK')

  return (
    <WorkshopShell
      title="Alerts & Action Queue"
      subtitle="Critical workshop action items, pending client approvals, and delivery handovers"
      actions={
        <button
          type="button"
          onClick={() => store.repository.resetDefaults()}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <RotateCcw size={14} />
          <span>Reset Demo Store</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Awaiting Customer Approval Section */}
        <PanelCard
          title={`Pending Customer Approvals (${pendingApprovals.length})`}
          subtitle="Estimates sent to clients requiring formal signoff before technician work commences"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            {pendingApprovals.map((job) => {
              const cust = store.customers.find((c) => c.id === job.customerId)
              const veh = store.vehicles.find((v) => v.id === job.vehicleId)
              return (
                <div
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/40 bg-[#1e1a14] p-6 shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-lg font-bold text-white uppercase">
                        {job.jobCode} — {veh?.make} {veh?.model}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        ({veh?.registrationNumber})
                      </span>
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <div className="mt-1.5 text-zinc-300 text-xs sm:text-sm">
                      Client: <strong className="text-white">{cust?.fullName}</strong> ({cust?.phone}) • Estimated Value:{' '}
                      <strong className="font-mono text-[#ea0a0b]">₹{job.actualFinalCost.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <Link
                    href={`/employee/jobs/${job.id}`}
                    className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/40 transition-all"
                  >
                    <span>Review & Approve Estimate</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              )
            })}

            {pendingApprovals.length === 0 && (
              <div className="py-8 text-center text-sm text-[#9e9ea6]">
                All active estimates are signed off. No pending approvals.
              </div>
            )}
          </div>
        </PanelCard>

        {/* Quality Check Pending */}
        <PanelCard
          title={`Quality Check Inspection Audits (${qualityChecks.length})`}
          subtitle="Vehicles with completed detailing requiring Chief Inspector walkaround"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            {qualityChecks.map((job) => {
              const veh = store.vehicles.find((v) => v.id === job.vehicleId)
              const cust = store.customers.find((c) => c.id === job.customerId)
              return (
                <div
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-purple-500/40 bg-[#1b1526] p-6 shadow-md"
                >
                  <div>
                    <div className="font-heading text-lg font-bold text-white uppercase">
                      {job.jobCode} — {veh?.make} {veh?.model}
                    </div>
                    <div className="text-zinc-300 mt-1.5 text-xs sm:text-sm">
                      Coating cured. Ready for IR inspection lamp audit. Client: <strong className="text-white">{cust?.fullName}</strong>
                    </div>
                  </div>

                  <Link
                    href={`/employee/jobs/${job.id}`}
                    className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-purple-500 shadow-lg shadow-purple-950/40 transition-all"
                  >
                    <span>Complete QC Walkaround</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              )
            })}

            {qualityChecks.length === 0 && (
              <div className="py-8 text-center text-sm text-[#9e9ea6]">
                No vehicles currently waiting in quality check stage.
              </div>
            )}
          </div>
        </PanelCard>

        {/* Ready For Delivery */}
        <PanelCard
          title={`Ready for Delivery & Handover (${readyForDeliveries.length})`}
          subtitle="Passed quality check. Staged in delivery bay awaiting customer arrival"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            {readyForDeliveries.map((job) => {
              const veh = store.vehicles.find((v) => v.id === job.vehicleId)
              const cust = store.customers.find((c) => c.id === job.customerId)
              return (
                <div
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-[#132019] p-6 shadow-md"
                >
                  <div>
                    <div className="font-heading text-lg font-bold text-white uppercase">
                      {job.jobCode} — {veh?.make} {veh?.model} ({veh?.registrationNumber})
                    </div>
                    <div className="text-zinc-300 mt-1.5 text-xs sm:text-sm">
                      Customer: <strong className="text-white">{cust?.fullName}</strong> ({cust?.phone}) • Staged at <span className="font-mono text-emerald-400 font-bold">{job.bayNumber}</span>
                    </div>
                  </div>

                  <Link
                    href={`/employee/jobs/${job.id}`}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40 transition-all"
                  >
                    <span>Handover to Client</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              )
            })}

            {readyForDeliveries.length === 0 && (
              <div className="py-8 text-center text-sm text-[#9e9ea6]">
                No vehicles currently staged in delivery bay.
              </div>
            )}
          </div>
        </PanelCard>
      </div>
    </WorkshopShell>
  )
}
