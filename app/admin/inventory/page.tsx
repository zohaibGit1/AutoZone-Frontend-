'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import { AlertCircle, CheckCircle2, DollarSign, Package, Plus, Search, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminInventoryPage() {
  const store = useWorkshopStore()
  const [search, setSearch] = useState('')

  const totalInventoryValue = store.inventory.reduce(
    (sum, item) => sum + item.stockQuantity * item.unitCost,
    0
  )

  const filteredItems = store.inventory.filter(
    (i) =>
      search === '' ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()) ||
      i.supplier.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <WorkshopShell
      title="Detailing Chemicals & Consumables Stock"
      subtitle="PPF rolls, 9H Ceramic kits, polishing compounds, and supplier reorder points"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Stock Value"
            value={`₹${(totalInventoryValue / 100000).toFixed(2)}L`}
            subvalue="capital in workshop store"
            icon={<DollarSign size={18} />}
          />
          <StatCard
            title="Active SKUs"
            value={store.inventory.length}
            subvalue="product lines tracked"
            icon={<Package size={18} />}
          />
          <StatCard
            title="Reorder Warnings"
            value={store.inventory.filter((i) => i.stockQuantity <= i.minimumThreshold).length}
            subvalue="below threshold safety stock"
            icon={<AlertCircle size={18} />}
            highlight={store.inventory.some((i) => i.stockQuantity <= i.minimumThreshold)}
          />
        </div>

        <PanelCard
          title={`Inventory Stock Ledger (${filteredItems.length} SKUs)`}
          action={
            <div className="relative w-72 sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SKU or chemical name..."
                className="h-10 w-full rounded-xl border border-white/20 bg-[#1d1c26] pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:ring-1 focus:ring-[#ea0a0b] focus:outline-none transition-all"
              />
            </div>
          }
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5">SKU</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5 text-right">Unit Cost</th>
                  <th className="py-3.5 px-5 text-right">In Stock</th>
                  <th className="py-3.5 px-5 text-right">Threshold</th>
                  <th className="py-3.5 px-5 text-right">Total Value</th>
                  <th className="py-3.5 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {filteredItems.map((item) => {
                  const isLow = item.stockQuantity <= item.minimumThreshold
                  return (
                    <tr key={item.id} className="hover:bg-[#232230] transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-xs text-[#9e9ea6] mt-0.5">{item.supplier}</div>
                      </td>
                      <td className="py-4 px-5 font-mono text-zinc-300 font-semibold">{item.sku}</td>
                      <td className="py-4 px-5 text-zinc-300">{item.category}</td>
                      <td className="py-4 px-5 font-mono text-zinc-300 text-right">
                        ₹{item.unitCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 font-bold text-white font-mono text-sm text-right">
                        {item.stockQuantity} {item.unit}
                      </td>
                      <td className="py-4 px-5 text-zinc-400 font-mono text-right">
                        {item.minimumThreshold} {item.unit}
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-white text-base text-right">
                        ₹{(item.stockQuantity * item.unitCost).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span
                          className={cn(
                            'inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase',
                            isLow
                              ? 'border-red-500/50 bg-red-950/60 text-red-300'
                              : 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                          )}
                        >
                          {isLow ? 'Low Stock' : 'Optimal'}
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
