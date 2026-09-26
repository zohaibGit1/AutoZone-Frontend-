'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import {
  JobStatusBadge,
  PanelCard,
  PriorityBadge,
  StatCard,
} from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import { JobStatus } from '@/lib/workshop/types'
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Flame,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EmployeeDashboardPage() {
  const store = useWorkshopStore()
  const [filterTab, setFilterTab] = useState<'ALL' | 'IN_PROGRESS' | 'AWAITING_APPROVAL' | 'READY_FOR_DELIVERY' | 'URGENT'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Metrics
  const activeJobs = store.jobs.filter(
    (j) => j.status !== 'DELIVERED' && j.status !== 'COMPLETED' && j.status !== 'CANCELLED'
  )
  const inProgressJobs = store.jobs.filter((j) => j.status === 'IN_PROGRESS')
  const awaitingApprovalJobs = store.jobs.filter(
    (j) => j.approvalStatus === 'AWAITING_APPROVAL' || j.status === 'AWAITING_APPROVAL'
  )
  const readyForDeliveryJobs = store.jobs.filter((j) => j.status === 'READY_FOR_DELIVERY')
  const urgentJobs = store.jobs.filter((j) => j.priority === 'URGENT' && j.status !== 'COMPLETED')

  const totalTodayRevenue = store.jobs.reduce((sum, j) => {
    const todayPayments = j.payments.reduce((pSum, p) => pSum + p.amount, 0)
    return sum + todayPayments
  }, 0)

  const pendingPaymentsTotal = store.jobs.reduce((sum, j) => sum + j.balanceDue, 0)

  // Filtered jobs list
  const filteredJobs = store.jobs.filter((job) => {
    const cust = store.customers.find((c) => c.id === job.customerId)
    const veh = store.vehicles.find((v) => v.id === job.vehicleId)

    const matchesSearch =
      searchQuery === '' ||
      job.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust && cust.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (veh &&
        (veh.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          veh.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          veh.model.toLowerCase().includes(searchQuery.toLowerCase())))

    if (!matchesSearch) return false

    if (filterTab === 'IN_PROGRESS') return job.status === 'IN_PROGRESS'
    if (filterTab === 'AWAITING_APPROVAL')
      return job.approvalStatus === 'AWAITING_APPROVAL' || job.status === 'AWAITING_APPROVAL'
    if (filterTab === 'READY_FOR_DELIVERY') return job.status === 'READY_FOR_DELIVERY'
    if (filterTab === 'URGENT') return job.priority === 'URGENT'

    return true
  })

  // Workshop Bay definitions
  const BAYS = [
    {
      id: 'Bay 1',
      name: 'Bay 1 (Master Clean Room)',
      type: 'PPF & High-End Wrap',
      currentJobId: 'job-101',
    },
    {
      id: 'Bay 2',
      name: 'Bay 2 (Coating & Detailing)',
      type: 'Ceramic 9H & Curing',
      currentJobId: 'job-102',
    },
    {
      id: 'Bay 3',
      name: 'Bay 3 (Delivery Staging)',
      type: 'Final Inspection & Walkaround',
      currentJobId: 'job-103',
    },
    {
      id: 'Bay 4',
      name: 'Bay 4 (Wash & Decon)',
      type: 'High-Pressure Steam & De-Iron',
      currentJobId: 'job-104',
    },
    {
      id: 'Bay 5',
      name: 'Bay 5 (Interior Spa)',
      type: 'Leather & Alcantara Restoration',
      currentJobId: null,
    },
    {
      id: 'Bay 6',
      name: 'Bay 6 (Paint Correction)',
      type: 'Multi-Stage Rotary Jeweling',
      currentJobId: null,
    },
  ]

  return (
    <WorkshopShell
      title="Workshop Command Center"
      subtitle="Live floor management, bay allocation, service queues, and quality handovers."
      actions={
        <div className="flex items-center gap-3">
          <Link
            href="/employee/jobs/new"
            className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/50 hover:bg-red-600 transition-all"
          >
            <Plus size={16} />
            <span>New Service Intake</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-10">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Active Jobs"
            value={activeJobs.length}
            subvalue="On workshop floor"
            icon={<Wrench size={18} />}
            highlight={true}
          />
          <StatCard
            title="In Progress"
            value={inProgressJobs.length}
            subvalue="Under technician care"
            icon={<Clock size={18} />}
          />
          <StatCard
            title="Awaiting Signoff"
            value={awaitingApprovalJobs.length}
            subvalue="Estimate pending"
            icon={<AlertCircle size={18} />}
          />
          <StatCard
            title="Ready For Delivery"
            value={readyForDeliveryJobs.length}
            subvalue="QC checklist passed"
            icon={<CheckCircle2 size={18} />}
          />
          <StatCard
            title="Today's Revenue"
            value={`₹${(totalTodayRevenue / 1000).toFixed(0)}k`}
            subvalue="Collected payments"
            icon={<DollarSign size={18} />}
          />
          <StatCard
            title="Pending Balances"
            value={`₹${(pendingPaymentsTotal / 1000).toFixed(0)}k`}
            subvalue="Due on handover"
            icon={<ShieldCheck size={18} />}
          />
        </div>

        {/* Live Workshop Bay Allocation Matrix */}
        <PanelCard
          title="Live Workshop Bays & Floor Allocation"
          subtitle="Real-time vehicle status across detailing and clean room bays"
          action={
            <Link
              href="/employee/calendar"
              className="text-xs font-bold uppercase text-[#ea0a0b] hover:underline"
            >
              View Full Bay Schedule →
            </Link>
          }
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BAYS.map((bay) => {
              const job = bay.currentJobId
                ? store.jobs.find((j) => j.id === bay.currentJobId)
                : null
              const vehicle = job
                ? store.vehicles.find((v) => v.id === job.vehicleId)
                : null
              const customer = job
                ? store.customers.find((c) => c.id === job.customerId)
                : null
              const isOccupied = !!job

              return (
                <div
                  key={bay.id}
                  className={cn(
                    'relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all',
                    isOccupied
                      ? 'border-white/[0.14] bg-[#16151c] hover:border-[#ea0a0b]/40 shadow-sm'
                      : 'border-dashed border-white/20 bg-[#16151c]/40'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-heading text-base font-bold uppercase text-white">
                        {bay.name}
                      </span>
                      <p className="text-xs text-[#9e9ea6] mt-0.5">{bay.type}</p>
                    </div>
                    <span
                      className={cn(
                        'flex h-3 w-3 rounded-full',
                        isOccupied ? 'bg-[#ea0a0b] animate-pulse' : 'bg-zinc-700'
                      )}
                    />
                  </div>

                  {isOccupied && job && vehicle ? (
                    <div className="mt-4 border-t border-white/10 pt-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/employee/jobs/${job.id}`}
                            className="font-heading text-base font-bold text-white hover:text-[#ea0a0b] transition-colors"
                          >
                            {job.jobCode} — {vehicle.make} {vehicle.model}
                          </Link>
                          <div className="text-xs text-[#9e9ea6] mt-0.5">
                            <span className="font-mono text-zinc-300 font-semibold">{vehicle.registrationNumber}</span> • {customer?.fullName}
                          </div>
                        </div>
                        <JobStatusBadge status={job.status} size="sm" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-zinc-300 rounded-xl bg-[#1d1c26] border border-white/10 p-3">
                        <span className="text-[#9e9ea6]">Target Delivery:</span>
                        <span className="font-semibold text-white">
                          {new Date(job.expectedDeliveryDate).toLocaleDateString(
                            'en-IN',
                            { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                          )}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 flex items-center justify-between border-t border-dashed border-white/15 pt-4">
                      <span className="text-xs text-zinc-500">Bay Unoccupied</span>
                      <Link
                        href="/employee/jobs/new"
                        className="rounded-lg bg-[#242330] border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-[#ea0a0b] hover:border-[#ea0a0b] hover:text-white transition-all"
                      >
                        Assign Vehicle +
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </PanelCard>

        {/* Master Active Jobs Pipeline */}
        <PanelCard
          title="Active Service Orders Pipeline"
          subtitle="Search and manage all workshop jobs, customer approvals, and work progress"
          action={
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64 sm:w-80">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by job, plate, client..."
                  className="h-10 w-full rounded-xl border border-white/20 bg-[#1d1c26] pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>
            </div>
          }
        >
          {/* Filter Tabs */}
          <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
            {[
              { id: 'ALL', label: `All Jobs (${store.jobs.length})` },
              { id: 'IN_PROGRESS', label: `In Progress (${inProgressJobs.length})` },
              {
                id: 'AWAITING_APPROVAL',
                label: `Awaiting Signoff (${awaitingApprovalJobs.length})`,
              },
              {
                id: 'READY_FOR_DELIVERY',
                label: `Ready For Delivery (${readyForDeliveryJobs.length})`,
              },
              { id: 'URGENT', label: `Urgent (${urgentJobs.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id as any)}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
                  filterTab === tab.id
                    ? 'bg-[#ea0a0b] text-white shadow-md shadow-red-950/40'
                    : 'bg-[#242330] border border-white/[0.12] text-[#c0c0c6] hover:bg-[#2c2b3a] hover:text-white'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Jobs Table */}
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="px-5 py-3.5">Job ID</th>
                  <th className="px-5 py-3.5">Vehicle & Client</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Assigned Bay & Staff</th>
                  <th className="px-5 py-3.5 text-right">Balance Due</th>
                  <th className="px-5 py-3.5">Target Handover</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {filteredJobs.map((job) => {
                  const cust = store.customers.find((c) => c.id === job.customerId)
                  const veh = store.vehicles.find((v) => v.id === job.vehicleId)
                  const advisor = store.employees.find((e) => e.id === job.assignedEmployeeId)

                  return (
                    <tr
                      key={job.id}
                      className="group transition-colors hover:bg-[#232230]"
                    >
                      <td className="px-5 py-4 font-heading font-bold text-white text-base">
                        <Link
                          href={`/employee/jobs/${job.id}`}
                          className="hover:text-[#ea0a0b] transition-colors"
                        >
                          {job.jobCode}
                        </Link>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-zinc-100 text-sm">
                          {veh?.make} {veh?.model}
                        </div>
                        <div className="text-xs text-[#9e9ea6] mt-0.5">
                          <span className="text-zinc-300 font-mono font-semibold">
                            {veh?.registrationNumber}
                          </span>{' '}
                          • {cust?.fullName}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <JobStatusBadge status={job.status} size="sm" />
                      </td>

                      <td className="px-5 py-4">
                        <PriorityBadge priority={job.priority} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-zinc-200 font-medium">{job.bayNumber || 'Floor'}</div>
                        <div className="text-[11px] text-[#9e9ea6]">
                          Lead: {advisor?.fullName?.split(' ')[0] || 'Unassigned'}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="font-mono font-bold text-white text-sm">
                          ₹{job.balanceDue.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-[#9e9ea6]">
                          of ₹{job.actualFinalCost.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-zinc-300 font-semibold">
                        {new Date(job.expectedDeliveryDate).toLocaleDateString(
                          'en-IN',
                          { month: 'short', day: 'numeric' }
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/employee/jobs/${job.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-[#242330] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-200 transition-all hover:border-[#ea0a0b] hover:bg-[#ea0a0b] hover:text-white"
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

            {filteredJobs.length === 0 && (
              <div className="py-12 text-center text-xs text-[#9e9ea6]">
                No jobs match the selected filter criteria.
              </div>
            )}
          </div>
        </PanelCard>
      </div>
    </WorkshopShell>
  )
}
