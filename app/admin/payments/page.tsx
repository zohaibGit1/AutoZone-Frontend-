'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import { CreditCard, DollarSign, Download, Filter, Search, ShieldCheck } from 'lucide-react'

export default function AdminPaymentsPage() {
  const store = useWorkshopStore()

  const allPayments = store.jobs.flatMap((j) =>
    j.payments.map((p) => ({
      ...p,
      jobCode: j.jobCode,
      jobId: j.id,
      customerId: j.customerId,
      vehicleId: j.vehicleId,
    }))
  )

  const totalCollected = allPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalOutstanding = store.jobs.reduce((sum, j) => sum + j.balanceDue, 0)

  return (
    <WorkshopShell
      title="Financial Ledger & Payment Transactions"
      subtitle="Complete accounting record of customer deposits, settlements, and payment channels"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Realized Collections"
            value={`₹${(totalCollected / 100000).toFixed(2)}L`}
            subvalue="collected across all channels"
            icon={<DollarSign size={18} />}
            highlight={true}
          />
          <StatCard
            title="Receivables Outstanding"
            value={`₹${(totalOutstanding / 1000).toFixed(1)}k`}
            subvalue="pending final handovers"
            icon={<ShieldCheck size={18} />}
          />
          <StatCard
            title="Total Transactions"
            value={allPayments.length}
            subvalue="receipts generated"
            icon={<CreditCard size={18} />}
          />
        </div>

        <PanelCard title="Payment Receipts Ledger">
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5">Job ID</th>
                  <th className="py-3.5 px-5">Customer & Vehicle</th>
                  <th className="py-3.5 px-5">Payment Method</th>
                  <th className="py-3.5 px-5">Transaction Reference</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {allPayments.map((p) => {
                  const cust = store.customers.find((c) => c.id === p.customerId)
                  const veh = store.vehicles.find((v) => v.id === p.vehicleId)
                  return (
                    <tr key={p.id} className="hover:bg-[#232230] transition-colors">
                      <td className="py-4 px-5 text-zinc-300">
                        {new Date(p.paymentDate).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 font-heading font-bold text-white text-base">
                        <Link href={`/employee/jobs/${p.jobId}`} className="hover:text-[#ea0a0b] transition-colors">
                          {p.jobCode}
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{cust?.fullName}</div>
                        <div className="text-xs text-[#9e9ea6] mt-0.5">
                          {veh?.make} {veh?.model} ({veh?.registrationNumber})
                        </div>
                      </td>
                      <td className="py-4 px-5 font-bold text-zinc-200">{p.paymentMethod}</td>
                      <td className="py-4 px-5 font-mono text-zinc-400 text-xs">{p.transactionRef}</td>
                      <td className="py-4 px-5 font-mono font-bold text-emerald-400 text-base text-right">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className="inline-flex rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-1 text-[11px] font-bold uppercase text-emerald-300">
                          {p.status}
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
    </WorkshopShell>
  )
}
