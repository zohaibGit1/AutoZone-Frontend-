'use client'

import React from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { JobStatusBadge, PanelCard, PriorityBadge, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  Package,
  Percent,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminDashboardPage() {
  const store = useWorkshopStore()

  // Business Analytics Calculations
  const totalBilledRevenue = store.jobs.reduce((sum, j) => sum + j.actualFinalCost, 0)
  const totalCollectedRevenue = store.jobs.reduce((sum, j) => sum + j.amountPaid, 0)
  const totalOutstanding = store.jobs.reduce((sum, j) => sum + j.balanceDue, 0)
  const totalMaterialCosts = store.jobs.reduce(
    (sum, j) => sum + j.materials.reduce((mSum, m) => mSum + m.totalCost, 0),
    0
  )
  const grossProfit = totalBilledRevenue - totalMaterialCosts
  const profitMarginPercent =
    totalBilledRevenue > 0 ? ((grossProfit / totalBilledRevenue) * 100).toFixed(1) : 0
  const avgJobValue =
    store.jobs.length > 0 ? Math.round(totalBilledRevenue / store.jobs.length) : 0

  const activeJobs = store.jobs.filter(
    (j) => j.status !== 'DELIVERED' && j.status !== 'COMPLETED' && j.status !== 'CANCELLED'
  )
  const inProgressJobs = store.jobs.filter((j) => j.status === 'IN_PROGRESS')
  const awaitingApprovalJobs = store.jobs.filter(
    (j) => j.approvalStatus === 'AWAITING_APPROVAL' || j.status === 'AWAITING_APPROVAL'
  )
  const readyForDeliveryJobs = store.jobs.filter((j) => j.status === 'READY_FOR_DELIVERY')
  const completedJobs = store.jobs.filter(
    (j) => j.status === 'DELIVERED' || j.status === 'COMPLETED'
  )

  const currentDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <WorkshopShell
      title="Admin Command Center"
      subtitle={`Company-wide operational intelligence & financial executive overview — ${currentDateFormatted}`}
      actions={
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#1d1c24] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#24232e] hover:border-white/30 transition-all"
          >
            <BarChart3 size={16} />
            <span>Business Reports</span>
          </Link>
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
        {/* EXECUTIVE KPI METRIC CARDS (Desktop 6-Card Grid) */}
        <div>
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9e9ea6]">
            Executive Financial & Performance KPIs
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="Total Sales"
              value={`₹${(totalBilledRevenue / 100000).toFixed(2)}L`}
              subvalue="Gross invoiced revenue"
              icon={<DollarSign size={18} />}
              highlight={true}
            />
            <StatCard
              title="Active Jobs"
              value={activeJobs.length}
              subvalue="On workshop floor"
              icon={<Wrench size={18} />}
            />
            <StatCard
              title="Pending Balance"
              value={`₹${(totalOutstanding / 1000).toFixed(1)}k`}
              subvalue="Uncollected receivables"
              icon={<ShieldAlert size={18} />}
              highlight={totalOutstanding > 0}
            />
            <StatCard
              title="Completed Orders"
              value={completedJobs.length}
              subvalue="Quality deliveries"
              icon={<CheckCircle2 size={18} />}
            />
            <StatCard
              title="Avg Job Value"
              value={`₹${avgJobValue.toLocaleString('en-IN')}`}
              subvalue="Per detailing invoice"
              icon={<TrendingUp size={18} />}
            />
            <StatCard
              title="Gross Margin"
              value={`${profitMarginPercent}%`}
              subvalue={`₹${(grossProfit / 100000).toFixed(2)}L net margin`}
              icon={<Percent size={18} />}
            />
          </div>
        </div>

        {/* SECTION 1: TODAY'S WORKSHOP STATUS PIPELINE */}
        <div>
          <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#9e9ea6]">
            Today&apos;s Workshop Floor Operations
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 hover:border-white/30 hover:bg-[#1a1922] transition-all shadow-lg">
              <div className="flex items-center justify-between text-[#9e9ea6]">
                <span className="text-xs font-bold uppercase tracking-wider">Active on Floor</span>
                <Clock size={16} className="text-zinc-300" />
              </div>
              <div className="mt-3 font-heading text-4xl font-extrabold text-white">
                {activeJobs.length} Vehicles
              </div>
              <p className="mt-1 text-xs text-[#9e9ea6]">Under active technician attention</p>
            </div>

            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-6 hover:border-amber-500/60 hover:bg-amber-950/40 transition-all shadow-lg">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-xs font-bold uppercase tracking-wider">Awaiting Signoff</span>
                <AlertCircle size={16} />
              </div>
              <div className="mt-3 font-heading text-4xl font-extrabold text-white">
                {awaitingApprovalJobs.length} Estimates
              </div>
              <p className="mt-1 text-xs text-amber-300">Pending customer digital confirmation</p>
            </div>

            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-6 hover:border-cyan-500/60 hover:bg-cyan-950/40 transition-all shadow-lg">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
                <Wrench size={16} />
              </div>
              <div className="mt-3 font-heading text-4xl font-extrabold text-white">
                {inProgressJobs.length} Jobs
              </div>
              <p className="mt-1 text-xs text-cyan-300">PPF & Ceramic coating in application</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6 hover:border-emerald-500/60 hover:bg-emerald-950/40 transition-all shadow-lg">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-xs font-bold uppercase tracking-wider">Ready for Delivery</span>
                <CheckCircle2 size={16} />
              </div>
              <div className="mt-3 font-heading text-4xl font-extrabold text-white">
                {readyForDeliveryJobs.length} Vehicles
              </div>
              <p className="mt-1 text-xs text-emerald-300">Passed 48-point quality check</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: PROFITABILITY LEDGER & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Table: Job Profitability Audit */}
          <div className="lg:col-span-2">
            <PanelCard
              title="Profitability Audit & Service Breakdown"
              subtitle="Customer invoiced price vs internal chemical & consumable costs"
              action={
                <Link
                  href="/admin/jobs"
                  className="text-xs font-bold uppercase tracking-wider text-[#ea0a0b] hover:underline"
                >
                  View Full Audit Ledger →
                </Link>
              }
            >
              <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                      <th className="py-3.5 px-5">Job Code</th>
                      <th className="py-3.5 px-5">Vehicle Details</th>
                      <th className="py-3.5 px-5 text-right">Customer Billed</th>
                      <th className="py-3.5 px-5 text-right">Material Cost</th>
                      <th className="py-3.5 px-5 text-right">Net Margin</th>
                      <th className="py-3.5 px-5 text-right">Margin Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08]">
                    {store.jobs.map((j) => {
                      const veh = store.vehicles.find((v) => v.id === j.vehicleId)
                      const matCost = j.materials.reduce((sum, m) => sum + m.totalCost, 0)
                      const margin = j.actualFinalCost - matCost
                      const marginPct =
                        j.actualFinalCost > 0
                          ? ((margin / j.actualFinalCost) * 100).toFixed(0)
                          : 0

                      return (
                        <tr key={j.id} className="hover:bg-[#232230] transition-colors">
                          <td className="py-4 px-5 font-heading font-bold text-white text-base">
                            <Link href={`/employee/jobs/${j.id}`} className="hover:text-[#ea0a0b] transition-colors">
                              {j.jobCode}
                            </Link>
                          </td>
                          <td className="py-4 px-5">
                            <div className="font-semibold text-white text-sm">
                              {veh?.make} {veh?.model}
                            </div>
                            <div className="font-mono text-xs text-[#9e9ea6] mt-0.5">
                              {veh?.registrationNumber}
                            </div>
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-white text-sm text-right">
                            ₹{j.actualFinalCost.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-5 font-mono text-zinc-400 text-right">
                            ₹{matCost.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-emerald-400 text-sm text-right">
                            ₹{margin.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <span className="rounded-lg bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300">
                              {marginPct}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </PanelCard>
          </div>

          {/* Right Column: Workload & Reorder Warnings */}
          <div className="space-y-8">
            {/* Staff Workload */}
            <PanelCard
              title="Certified Technician Workload"
              subtitle="Active detailing orders per employee"
              action={
                <Link
                  href="/admin/employees"
                  className="text-xs font-bold uppercase tracking-wider text-[#ea0a0b] hover:underline"
                >
                  Roster →
                </Link>
              }
            >
              <div className="space-y-3 text-xs sm:text-sm">
                {store.employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between rounded-xl bg-[#1d1c26] p-4 border border-white/[0.12] hover:border-white/25 transition-all"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm">{emp.fullName}</div>
                      <div className="text-xs text-[#9e9ea6] mt-0.5">{emp.designation}</div>
                    </div>
                    <span className="rounded-lg bg-[#252432] border border-white/15 px-3 py-1 font-mono text-xs font-bold text-white">
                      {emp.activeJobCount} Active
                    </span>
                  </div>
                ))}
              </div>
            </PanelCard>

            {/* Inventory Alerts */}
            <PanelCard
              title="Chemical & PPF Safety Stock"
              subtitle="Items at or below minimum threshold"
              action={
                <Link
                  href="/admin/inventory"
                  className="text-xs font-bold uppercase tracking-wider text-[#ea0a0b] hover:underline"
                >
                  Inventory →
                </Link>
              }
            >
              <div className="space-y-3 text-xs sm:text-sm">
                {store.inventory.slice(0, 4).map((item) => {
                  const isLow = item.stockQuantity <= item.minimumThreshold
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-[#1d1c26] p-4 border border-white/[0.12] hover:border-white/25 transition-all"
                    >
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-xs font-mono text-[#9e9ea6] mt-0.5">SKU: {item.sku}</div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            'font-bold font-mono text-sm',
                            isLow ? 'text-[#ea0a0b]' : 'text-white'
                          )}
                        >
                          {item.stockQuantity} {item.unit}
                        </div>
                        <span className="text-xs text-zinc-400">Min: {item.minimumThreshold}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </PanelCard>
          </div>
        </div>
      </div>
    </WorkshopShell>
  )
}
