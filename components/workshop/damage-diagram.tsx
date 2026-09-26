'use client'

import React, { useState } from 'react'
import {
  DamageRecord,
  DamageSeverity,
  DamageType,
  PanelLocation,
} from '@/lib/workshop/types'
import { DamageSeverityBadge } from './ui-primitives'
import { AlertCircle, Plus, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DamageDiagramProps {
  damages: DamageRecord[]
  onChange?: (damages: DamageRecord[]) => void
  readOnly?: boolean
}

const PANELS: { id: PanelLocation; label: string; zone: 'FRONT' | 'TOP' | 'REAR' | 'SIDES' | 'OTHER' }[] = [
  { id: 'FRONT_BUMPER', label: 'Front Bumper & Splitter', zone: 'FRONT' },
  { id: 'HEADLIGHTS', label: 'Headlights & DRL Lenses', zone: 'FRONT' },
  { id: 'HOOD', label: 'Hood / Front Bonnet', zone: 'FRONT' },
  { id: 'WINDSHIELD', label: 'Front Windshield Glass', zone: 'FRONT' },
  { id: 'ROOF', label: 'Roof / Panoramic Glass', zone: 'TOP' },
  { id: 'LEFT_FENDER', label: 'Left Front Fender', zone: 'SIDES' },
  { id: 'RIGHT_FENDER', label: 'Right Front Fender', zone: 'SIDES' },
  { id: 'LEFT_FRONT_DOOR', label: 'Left Front Door', zone: 'SIDES' },
  { id: 'LEFT_REAR_DOOR', label: 'Left Rear Door & Quarter', zone: 'SIDES' },
  { id: 'RIGHT_FRONT_DOOR', label: 'Right Front Door', zone: 'SIDES' },
  { id: 'RIGHT_REAR_DOOR', label: 'Right Rear Door & Quarter', zone: 'SIDES' },
  { id: 'TRUNK', label: 'Trunk Lid / Active Spoiler', zone: 'REAR' },
  { id: 'REAR_BUMPER', label: 'Rear Bumper & Diffuser', zone: 'REAR' },
  { id: 'WHEELS', label: 'Wheels, Rims & Calipers', zone: 'OTHER' },
  { id: 'INTERIOR', label: 'Cabin Interior & Leather Seats', zone: 'OTHER' },
]

export function DamageDiagram({
  damages,
  onChange,
  readOnly = false,
}: DamageDiagramProps) {
  const [selectedPanel, setSelectedPanel] = useState<PanelLocation | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newDamageType, setNewDamageType] = useState<DamageType>('SCRATCH')
  const [newSeverity, setNewSeverity] = useState<DamageSeverity>('MINOR')
  const [newDescription, setNewDescription] = useState('')

  const handleOpenAddModal = (panel: PanelLocation) => {
    if (readOnly) return
    setSelectedPanel(panel)
    setNewDamageType('SCRATCH')
    setNewSeverity('MINOR')
    setNewDescription('')
    setModalOpen(true)
  }

  const handleSaveDamage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPanel || !onChange) return

    const newRecord: DamageRecord = {
      id: `dmg-${Date.now().toString(36)}`,
      panel: selectedPanel,
      damageType: newDamageType,
      severity: newSeverity,
      description: newDescription || `${newSeverity} ${newDamageType.toLowerCase()} on ${selectedPanel}`,
    }

    onChange([...damages, newRecord])
    setModalOpen(false)
    setSelectedPanel(null)
  }

  const handleDeleteDamage = (id: string) => {
    if (readOnly || !onChange) return
    onChange(damages.filter((d) => d.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Panel Selection Grid */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#8b8b90]">
            Interactive Body Panel Damage Matrix
          </span>
          <span className="text-xs font-semibold text-zinc-300">
            {damages.length} pre-existing defect(s) logged
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PANELS.map((p) => {
            const panelDamages = damages.filter((d) => d.panel === p.id)
            const hasDamage = panelDamages.length > 0
            const maxSeverity = panelDamages.some((d) => d.severity === 'SEVERE')
              ? 'SEVERE'
              : panelDamages.some((d) => d.severity === 'MODERATE')
              ? 'MODERATE'
              : 'MINOR'

            return (
              <button
                key={p.id}
                type="button"
                disabled={readOnly}
                onClick={() => handleOpenAddModal(p.id)}
                className={cn(
                  'group relative flex min-h-[96px] flex-col justify-between rounded-xl border p-4 text-left transition-all',
                  hasDamage
                    ? maxSeverity === 'SEVERE'
                      ? 'border-red-500/60 bg-red-950/40 shadow-sm'
                      : maxSeverity === 'MODERATE'
                      ? 'border-amber-500/60 bg-amber-950/40 shadow-sm'
                      : 'border-blue-500/60 bg-blue-950/40 shadow-sm'
                    : 'border-white/[0.14] bg-[#16151c] hover:border-white/30 hover:bg-[#1d1c26]',
                  readOnly && 'cursor-default'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-heading text-xs font-bold uppercase tracking-wide text-zinc-100">
                    {p.label}
                  </span>
                  {hasDamage ? (
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm',
                        maxSeverity === 'SEVERE'
                          ? 'bg-[#ea0a0b]'
                          : maxSeverity === 'MODERATE'
                          ? 'bg-amber-600'
                          : 'bg-blue-600'
                      )}
                    >
                      {panelDamages.length}
                    </span>
                  ) : (
                    !readOnly && (
                      <Plus
                        size={15}
                        className="text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    )
                  )}
                </div>

                <div className="mt-3 text-[11px] font-medium text-[#9e9ea6]">
                  {hasDamage
                    ? panelDamages.map((d) => d.damageType.toLowerCase().replace(/_/g, ' ')).join(', ')
                    : 'Clean / No defects'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Logged Damages Detailed List */}
      {damages.length > 0 ? (
        <div className="rounded-xl border border-white/[0.14] bg-[#16151c] p-5 sm:p-6 shadow-sm">
          <div className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-200">
            Documented Pre-Existing Damage Records
          </div>
          <div className="divide-y divide-white/[0.08]">
            {damages.map((d) => {
              const panelLabel =
                PANELS.find((p) => p.id === d.panel)?.label || d.panel
              return (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0 text-xs"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                      {panelLabel}
                    </span>
                    <DamageSeverityBadge
                      severity={d.severity}
                      damageType={d.damageType}
                    />
                    <span className="text-zinc-300">
                      {d.description}
                    </span>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDamage(d.id)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/20 bg-[#16151c]/50 p-6 text-center text-xs text-[#9e9ea6]">
          Clean intake condition. No pre-existing vehicle body scratches or dents reported.
        </div>
      )}

      {/* Add Damage Modal Dialog */}
      {modalOpen && selectedPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1a1922] p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-white">
                  Log Damage: {PANELS.find((p) => p.id === selectedPanel)?.label}
                </h4>
                <p className="mt-0.5 text-xs text-[#9e9ea6]">
                  Record pre-existing defect prior to service start
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDamage} className="mt-5 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Damage Type
                </label>
                <select
                  value={newDamageType}
                  onChange={(e) => setNewDamageType(e.target.value as DamageType)}
                  className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                >
                  <option value="SCRATCH">Scratch / Clearcoat Scuff</option>
                  <option value="DENT">Dent / Body Crease</option>
                  <option value="PAINT_CHIP">Stone Chip / Paint Flake</option>
                  <option value="SWIRL_MARKS">Heavy Swirl Marks / Holograms</option>
                  <option value="OXIDATION">Paint Oxidation / Bird Etching</option>
                  <option value="INTERIOR_STAIN">Interior Leather / Carpet Stain</option>
                  <option value="WHEEL_CURB">Wheel Rim Curb Rash</option>
                  <option value="GLASS_CRACK">Glass Chip / Star Crack</option>
                  <option value="OTHER">Other Defect</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Defect Severity
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2.5">
                  {(['MINOR', 'MODERATE', 'SEVERE'] as DamageSeverity[]).map(
                    (sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setNewSeverity(sev)}
                        className={cn(
                          'rounded-xl border px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider transition-all',
                          newSeverity === sev
                            ? sev === 'SEVERE'
                              ? 'border-red-500 bg-[#ea0a0b] text-white shadow-md shadow-red-950/40'
                              : sev === 'MODERATE'
                              ? 'border-amber-500 bg-amber-600 text-white shadow-md shadow-amber-950/40'
                              : 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-950/40'
                            : 'border-white/15 bg-[#1d1c26] text-zinc-300 hover:border-white/30'
                        )}
                      >
                        {sev}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Technician Observation & Exact Location
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. 5cm surface scratch near lower edge, clear coat deep..."
                  className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/50"
                >
                  Save Damage Point
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
