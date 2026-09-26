'use client'

import React, { useState } from 'react'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import { Check, RotateCcw, Save, Settings, ShieldCheck } from 'lucide-react'

export default function AdminSettingsPage() {
  const store = useWorkshopStore()
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    workshopName: 'AutoZone Detailing & Accessories',
    workshopAddress: '785 15th Street, Automotive Hub, Mumbai',
    gstNumber: '27AAAAA0000A1Z5',
    defaultTaxRate: 18,
    currency: 'INR (₹)',
    activeBayCount: 6,
    defaultWarrantyPPFYears: 10,
    defaultWarrantyCeramicYears: 5,
    autoSendEstimateWhatsApp: true,
    requireQCWalkaroundBeforeDelivery: true,
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <WorkshopShell
      title="Workshop Operational Settings"
      subtitle="Tax rates, business registration, bay configuration, and quality assurance rules"
    >
      <div className="space-y-8 max-w-5xl">
        <form onSubmit={handleSave} className="space-y-8">
          <PanelCard title="Business Identity & Tax Configurations">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-xs sm:text-sm">
              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-200 mb-2">
                  Workshop Legal Entity Name
                </label>
                <input
                  type="text"
                  value={settings.workshopName}
                  onChange={(e) => setSettings({ ...settings, workshopName: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:ring-1 focus:ring-[#ea0a0b] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-200 mb-2">
                  GSTIN / Tax ID
                </label>
                <input
                  type="text"
                  value={settings.gstNumber}
                  onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 font-mono text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:ring-1 focus:ring-[#ea0a0b] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-200 mb-2">
                  Default GST / Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.defaultTaxRate}
                  onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white focus:border-[#ea0a0b] focus:ring-1 focus:ring-[#ea0a0b] focus:outline-none font-mono transition-all"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-200 mb-2">
                  Active Detailing Bays
                </label>
                <input
                  type="number"
                  value={settings.activeBayCount}
                  onChange={(e) => setSettings({ ...settings, activeBayCount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white focus:border-[#ea0a0b] focus:ring-1 focus:ring-[#ea0a0b] focus:outline-none font-mono transition-all"
                />
              </div>
            </div>
          </PanelCard>

          <PanelCard title="Quality Assurance & Handover Rules">
            <div className="space-y-4 text-xs sm:text-sm">
              <label className="flex items-start gap-4 cursor-pointer rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5 hover:border-white/30 hover:bg-[#232230] transition-all">
                <input
                  type="checkbox"
                  checked={settings.requireQCWalkaroundBeforeDelivery}
                  onChange={(e) =>
                    setSettings({ ...settings, requireQCWalkaroundBeforeDelivery: e.target.checked })
                  }
                  className="mt-0.5 h-5 w-5 rounded border-white/30 bg-[#16151c] text-[#ea0a0b] focus:ring-[#ea0a0b]"
                />
                <span className="text-zinc-200 leading-relaxed font-medium">
                  <strong className="text-white block font-semibold mb-0.5 text-base">Strict QC Enforcement:</strong>
                  Prevent marking job as DELIVERED until 48-point quality check is signed off by Chief Inspector.
                </span>
              </label>

              <label className="flex items-start gap-4 cursor-pointer rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5 hover:border-white/30 hover:bg-[#232230] transition-all">
                <input
                  type="checkbox"
                  checked={settings.autoSendEstimateWhatsApp}
                  onChange={(e) =>
                    setSettings({ ...settings, autoSendEstimateWhatsApp: e.target.checked })
                  }
                  className="mt-0.5 h-5 w-5 rounded border-white/30 bg-[#16151c] text-[#ea0a0b] focus:ring-[#ea0a0b]"
                />
                <span className="text-zinc-200 leading-relaxed font-medium">
                  <strong className="text-white block font-semibold mb-0.5 text-base">Automatic Client Notifications:</strong>
                  Trigger instant digital estimate link to customer upon job intake.
                </span>
              </label>
            </div>
          </PanelCard>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => store.repository.resetDefaults()}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#1d1c26] px-5 py-3 text-xs font-bold uppercase text-zinc-300 hover:bg-[#24232e] hover:text-white transition-all shadow-sm"
            >
              <RotateCcw size={15} />
              <span>Reset Factory Defaults</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2.5 rounded-xl bg-[#ea0a0b] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/50 transition-all"
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              <span>{saved ? 'Settings Saved' : 'Save Workshop Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </WorkshopShell>
  )
}
