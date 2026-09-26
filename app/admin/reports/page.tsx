'use client'

import React from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import { BarChart3, Calendar, DollarSign, Download, Layers, TrendingUp, Users, Wrench } from 'lucide-react'

export default function AdminReportsPage() {
  const store = useWorkshopStore()

  const totalBilled = store.jobs.reduce((sum, j) => sum + j.actualFinalCost, 0)
  const totalCompleted = store.jobs.filter((j) => j.status === 'DELIVERED' || j.status === 'COMPLETED').length

  const servicePopularity = [
    { title: 'Paint Protection Film (Full Body / Track Pack)', count: 18, revenue: 1840000, share: '42%' },
    { title: '9H Matrix Ceramic Coating (5-Year)', count: 26, revenue: 1092000, share: '25%' },
    { title: 'Multi-Stage Concours Paint Correction', count: 32, revenue: 704000, share: '16%' },
    { title: 'Interior Steam Sanitization & Leather Spa', count: 41, revenue: 512500, share: '12%' },
    { title: 'Wheels-Off Ceramic & Caliper Coating', count: 14, revenue: 224000, share: '5%' },
  ]

  return (
    <WorkshopShell
      title="Business Performance & Detailing Analytics"
      subtitle="Comprehensive revenue breakdowns, service sales distribution, and customer retention metrics"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Gross Revenue (YTD)"
            value={`₹${(totalBilled / 100000).toFixed(2)}L`}
            subvalue="+28% vs previous quarter"
            icon={<TrendingUp size={18} />}
            highlight={true}
          />
          <StatCard
            title="Completed Jobs"
            value={totalCompleted}
            subvalue="quality handovers delivered"
            icon={<Wrench size={18} />}
          />
          <StatCard
            title="Customer Retention Rate"
            value="84.2%"
            subvalue="repeat customer supercar bookings"
            icon={<Users size={18} />}
          />
        </div>

        {/* Popular Services Table */}
        <PanelCard
          title="Top Detailing Services & Revenue Distribution"
          subtitle="Highest grossing packages and volume statistics"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="py-3.5 px-5">Service Package Title</th>
                  <th className="py-3.5 px-5">Jobs Completed</th>
                  <th className="py-3.5 px-5 text-right">Total Sales Generated</th>
                  <th className="py-3.5 px-5 text-right">Revenue Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {servicePopularity.map((s, idx) => (
                  <tr key={idx} className="hover:bg-[#232230] transition-colors">
                    <td className="py-4 px-5 font-semibold text-white">{s.title}</td>
                    <td className="py-4 px-5 font-bold text-zinc-300 font-mono">{s.count} Jobs</td>
                    <td className="py-4 px-5 font-mono font-bold text-emerald-400 text-base text-right">
                      ₹{s.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="font-mono text-white font-bold bg-[#252432] px-3 py-1 rounded-lg border border-white/15 shadow-sm">
                        {s.share}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </div>
    </WorkshopShell>
  )
}
