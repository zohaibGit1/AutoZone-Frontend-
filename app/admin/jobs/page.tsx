'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { JobStatusBadge, PanelCard, PaymentStatusBadge, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import { ArrowUpRight, DollarSign, Download, Filter, Layers, Percent, Search, ShieldCheck } from 'lucide-react'

export default function AdminJobsPage() {
  const store = useWorkshopStore()
  const [search, setSearch] = useState('')

  const filteredJobs = store.jobs.filter((j) => {
    const cust = store.customers.find((c) => c.id === j.customerId)
    const veh = store.vehicles.find((v) => v.id === j.vehicleId)
    return (
      search === '' ||
      j.jobCode.toLowerCase().includes(search.toLowerCase()) ||
      (cust && cust.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (veh &&
        (veh.make.toLowerCase().includes(search.toLowerCase()) ||
          veh.model.toLowerCase().includes(search.toLowerCase()) ||
          veh.registrationNumber.toLowerCase().includes(search.toLowerCase())))
    )
  })

  const totalSales = store.jobs.reduce((sum, j) => sum + j.actualFinalCost, 0)
  const totalMatCosts = store.jobs.reduce(
    (sum, j) => sum + j.materials.reduce((mSum, m) => mSum + m.totalCost, 0),
    0
  )
  const netMargin = totalSales - totalMatCosts

  return (
    <WorkshopShell
      title="Company Jobs & Financial Margin Audit"
      subtitle="Complete profit and loss analysis per service order including internal materials and labor"
    >
      <div className="space-y-8">
        {/* KPI Top Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Revenue"
            value={`₹${(totalSales / 100000).toFixed(2)}L`}
            subvalue="Gross invoiced sales"
            icon={<DollarSign size={18} />}
          />
          <StatCard
            title="Material Outlay"
            value={`₹${(totalMatCosts / 1000).toFixed(1)}k`}
            subvalue="Internal chemical consumables"
            icon={<Layers size={18} />}
          />
          <StatCard
            title="Company Net Margin"
            value={`₹${(netMargin / 100000).toFixed(2)}L`}
            subvalue={`${((netMargin / (totalSales || 1)) * 100).toFixed(1)}% gross profit rate`}
            icon={<Percent size={18} />}
            highlight={true}
          />
        </div>

        {/* Master Ledger Table */}
        <PanelCard
          title={`Job Profitability Ledger (${filteredJobs.length} Orders)`}
          subtitle="Detailed financial audit of customer billings, consumable materials, and realized profit"
          action={
            <div className="relative w-72 sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job code, plate, customer..."
                className="h-10 w-full rounded-xl border border-white/20 bg-[#1d1c26] pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:ring-1 focus:ring-[#ea0a0b] focus:outline-none transition-all"
              />
            </div>
          }
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="py-3.5 px-5">Job ID</th>
                  <th className="py-3.5 px-5">Client & Vehicle</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Customer Billed</th>
                  <th className="py-3.5 px-5 text-right">Internal Cost</th>
                  <th className="py-3.5 px-5 text-right">Gross Profit</th>
                  <th className="py-3.5 px-5">Payment State</th>
                  <th className="py-3.5 px-5 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {filteredJobs.map((j) => {
                  const cust = store.customers.find((c) => c.id === j.customerId)
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
                          {veh?.registrationNumber} • {cust?.fullName}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <JobStatusBadge status={j.status} size="sm" />
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-white text-sm text-right">
                        ₹{j.actualFinalCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 font-mono text-zinc-400 text-right">
                        ₹{matCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-emerald-400 text-sm text-right">
                        ₹{margin.toLocaleString('en-IN')}{' '}
                        <span className="text-xs text-zinc-400 font-normal">({marginPct}%)</span>
                      </td>
                      <td className="py-4 px-5">
                        <PaymentStatusBadge status={j.paymentStatus} />
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/employee/jobs/${j.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#252432] border border-white/15 px-3.5 py-1.5 text-xs font-bold uppercase text-white hover:bg-[#ea0a0b] hover:border-[#ea0a0b] transition-all shadow-sm"
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
              <div className="py-16 text-center text-sm text-[#9e9ea6]">
                No jobs match your search criteria.
              </div>
            )}
          </div>
        </PanelCard>
      </div>
    </WorkshopShell>
  )
}
