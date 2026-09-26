'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import {
  JobStatusBadge,
  PanelCard,
  PaymentStatusBadge,
  PriorityBadge,
} from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import { JobPriority, JobStatus, PaymentStatus } from '@/lib/workshop/types'
import {
  AlertCircle,
  ArrowUpRight,
  ChevronDown,
  Clock,
  Download,
  Filter,
  Flame,
  Plus,
  Search,
  Wrench,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EmployeeJobsPage() {
  const store = useWorkshopStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL')

  const filteredJobs = store.jobs.filter((job) => {
    const cust = store.customers.find((c) => c.id === job.customerId)
    const veh = store.vehicles.find((v) => v.id === job.vehicleId)

    const matchesSearch =
      searchQuery === '' ||
      job.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust && (cust.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || cust.phone.includes(searchQuery))) ||
      (veh &&
        (veh.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          veh.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          veh.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          veh.vin.toLowerCase().includes(searchQuery.toLowerCase())))

    if (!matchesSearch) return false

    if (statusFilter !== 'ALL' && job.status !== statusFilter) return false
    if (priorityFilter !== 'ALL' && job.priority !== priorityFilter) return false
    if (paymentFilter !== 'ALL' && job.paymentStatus !== paymentFilter) return false

    return true
  })

  return (
    <WorkshopShell
      title="Jobs & Service Orders Master Registry"
      subtitle="Complete lifecycle registry of all active, in-progress, and historical vehicle detailing jobs"
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
      <div className="space-y-8">
        {/* Filters and Search Bar */}
        <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-5 sm:p-6 shadow-md">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job code, license plate, VIN, client name..."
                className="w-full rounded-xl border border-white/20 bg-[#1d1c26] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-400 focus:border-[#ea0a0b] focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none"
              >
                <option value="ALL">All Statuses ({store.jobs.length})</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="INSPECTION">Inspection</option>
                <option value="AWAITING_APPROVAL">Awaiting Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="QUALITY_CHECK">Quality Check</option>
                <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent (VIP / Track Day)</option>
                <option value="HIGH">High Priority</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Master Table */}
        <PanelCard
          title={`Active Pipeline & Ledger (${filteredJobs.length} Results)`}
          subtitle="Real-time status updates and direct access to full 360° vehicle service records"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="px-5 py-3.5">Job ID</th>
                  <th className="px-5 py-3.5">Vehicle Details</th>
                  <th className="px-5 py-3.5">Customer Profile</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Bay & Lead</th>
                  <th className="px-5 py-3.5 text-right">Invoiced Total</th>
                  <th className="px-5 py-3.5">Payment State</th>
                  <th className="px-5 py-3.5 text-right">360° Manage</th>
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
                      <td className="px-5 py-4">
                        <Link
                          href={`/employee/jobs/${job.id}`}
                          className="font-heading text-base font-bold text-white hover:text-[#ea0a0b] transition-colors"
                        >
                          {job.jobCode}
                        </Link>
                        <div className="text-[10px] text-[#9e9ea6] mt-0.5">
                          {new Date(job.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-white text-sm">
                          {veh?.make} {veh?.model}
                        </div>
                        <div className="font-mono text-[11px] text-[#9e9ea6] mt-0.5">
                          {veh?.registrationNumber}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/employee/customers/${cust?.id}`}
                          className="font-semibold text-zinc-200 hover:text-white"
                        >
                          {cust?.fullName}
                        </Link>
                        <div className="text-[11px] text-[#9e9ea6] mt-0.5">
                          {cust?.phone}
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
                          Advisor: {advisor?.fullName?.split(' ')[0] || 'Unassigned'}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="font-mono font-bold text-white text-sm">
                          ₹{job.actualFinalCost.toLocaleString('en-IN')}
                        </div>
                        {job.balanceDue > 0 ? (
                          <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                            Due: ₹{job.balanceDue.toLocaleString('en-IN')}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                            Settled
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <PaymentStatusBadge status={job.paymentStatus} />
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
              <div className="py-16 text-center text-xs text-[#9e9ea6]">
                No jobs match the specified criteria. Try adjusting filters or search query.
              </div>
            )}
          </div>
        </PanelCard>
      </div>
    </WorkshopShell>
  )
}
