'use client'

import React from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import { DollarSign, Layers, Plus, Sparkles, Wrench } from 'lucide-react'

export default function AdminServicesPage() {
  const store = useWorkshopStore()

  return (
    <WorkshopShell
      title="Detailing Service Price Catalog"
      subtitle="Standard workshop service packages, labor hour baselines, and recommended consumable materials"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Catalog Services"
            value={store.services.length}
            subvalue="standard packages configured"
            icon={<Sparkles size={18} />}
          />
          <StatCard
            title="Paint Protection Film"
            value={store.services.filter((s) => s.category === 'PPF').length}
            subvalue="TPU self-healing packages"
            icon={<Layers size={18} />}
          />
          <StatCard
            title="Ceramic Coatings"
            value={store.services.filter((s) => s.category === 'CERAMIC').length}
            subvalue="9H multi-layer coatings"
            icon={<Wrench size={18} />}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {store.services.map((srv) => (
            <div
              key={srv.id}
              className="flex flex-col justify-between rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 sm:p-7 transition-all hover:border-white/30 hover:bg-[#1a1922] shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-[#ea0a0b]/20 border border-[#ea0a0b]/40 px-2.5 py-1 text-[11px] font-bold uppercase text-[#ea0a0b]">
                    {srv.category}
                  </span>
                  <span className="text-xs text-[#9e9ea6] font-medium bg-[#201f28] border border-white/10 px-2.5 py-1 rounded-md">
                    {srv.defaultDurationHours} hrs standard labor
                  </span>
                </div>

                <h3 className="mt-4 font-heading text-xl font-bold uppercase text-white">
                  {srv.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {srv.description}
                </p>

                {srv.recommendedMaterials.length > 0 && (
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <span className="text-[11px] font-bold uppercase text-[#9e9ea6] block mb-2 tracking-wider">
                      Required Consumables:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {srv.recommendedMaterials.map((mat, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-[#201f28] border border-white/15 px-2.5 py-1 text-xs text-zinc-200"
                        >
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs sm:text-sm text-[#9e9ea6] font-medium">Base Package Rate:</span>
                <span className="font-mono text-2xl font-bold text-[#ea0a0b]">
                  ₹{srv.basePrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkshopShell>
  )
}
