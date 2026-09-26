'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  AlertCircle,
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  User,
  X,
} from 'lucide-react'
import { visitsApi, complaintsApi } from '@/lib/api'
import { cn } from '@/lib/utils'

function AdminVisitsContent() {
  const searchParams = useSearchParams()
  const preselectedVehId = searchParams.get('vehicleId')
  const store = useWorkshopStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(preselectedVehId || '')
  const [currentKm, setCurrentKm] = useState<number>(10000)
  const [complaintText, setComplaintText] = useState('')

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [complaintModalOpen, setComplaintModalOpen] = useState(false)
  const [activeVisitForComplaint, setActiveVisitForComplaint] = useState<{
    id: string
    backendVisitId?: number
    vehicleName: string
    regNumber: string
  } | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (preselectedVehId) {
      setSelectedVehicleId(preselectedVehId)
      setCreateModalOpen(true)
    }
  }, [preselectedVehId])

  const selectedVehicle = store.vehicles.find(
    (v) => v.id === selectedVehicleId || String(v.backendVehicleId) === selectedVehicleId
  )
  const owner = selectedVehicle
    ? store.customers.find((c) => c.id === selectedVehicle.customerId)
    : undefined

  const filteredVisits = store.jobs.filter((j) => {
    const cust = store.customers.find((c) => c.id === j.customerId)
    const veh = store.vehicles.find((v) => v.id === j.vehicleId)
    return (
      searchQuery === '' ||
      j.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust && cust.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (veh &&
        (veh.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          veh.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          veh.model.toLowerCase().includes(searchQuery.toLowerCase())))
    )
  })

  // 1. Create Vehicle Visit on Backend via POST /api/v1/vehicle-visit
  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!selectedVehicle) {
      setFormError('Please select a registered vehicle for this intake visit.')
      return
    }

    if (currentKm < 0) {
      setFormError('Current odometer reading cannot be negative.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await store.repository.createJobBackend({
        customerId: selectedVehicle.customerId,
        vehicleId: selectedVehicle.id,
        priority: 'NORMAL',
        assignedEmployeeId: 'emp-2',
        assignedTechnicianIds: ['emp-3'],
        bayNumber: 'Bay 1',
        checkIn: {
          checkInDate: new Date().toISOString(),
          receivedByEmployeeId: 'emp-2',
          odometerReading: currentKm,
          fuelLevel: 'HALF',
          interiorCondition: 'CLEAN',
          glassCondition: 'GOOD',
          tyreCondition: 'GOOD',
          wheelCondition: 'CLEAN',
          personalBelongingsRemoved: true,
          preExistingDamages: [],
        },
        customerComplaints: complaintText.trim() ? [complaintText.trim()] : ['General Workshop Inspection'],
        inspectionFindings: [],
        services: [
          {
            id: `srv-${Date.now()}`,
            serviceId: 'srv-std-insp',
            title: 'Comprehensive Vehicle Inspection',
            category: 'DETAILING',
            quantity: 1,
            unitPrice: 1500,
            discount: 0,
            taxRate: 18,
            totalPrice: 1770,
            estimatedDurationHours: 2,
            status: 'PENDING',
            approvedByCustomer: true,
          },
        ],
        estimatedCost: 1770,
        expectedDeliveryDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      })

      setFormSuccess(`Vehicle Visit logged successfully (Visit Code: ${created.jobCode}).`)
      setCreateModalOpen(false)
      setComplaintText('')
    } catch (err: any) {
      setFormError(err.message || 'Failed to create vehicle visit on backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2. Register Complaint on Backend via POST /api/v1/complaint/register/complaint
  const handleAddComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeVisitForComplaint || !complaintText.trim()) return

    setFormError(null)
    setIsSubmitting(true)
    try {
      const targetJob = store.jobs.find((j) => j.id === activeVisitForComplaint.id)
      const backendVisitId = targetJob?.backendVisitId || 1

      await complaintsApi.registerComplaint({
        complaintDescription: complaintText.trim(),
        vehicleVisitId: backendVisitId,
      })

      if (targetJob) {
        targetJob.customerComplaints.push(complaintText.trim())
      }

      setComplaintModalOpen(false)
      setComplaintText('')
      setActiveVisitForComplaint(null)
    } catch (err: any) {
      setFormError(err.message || 'Failed to register complaint on backend.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <WorkshopShell
      title="Vehicle Visits & Intake Management"
      subtitle="Log vehicle arrivals, check-in odometer readings, and record customer complaints"
      actions={
        <button
          type="button"
          onClick={() => {
            setFormError(null)
            setCreateModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-600 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>New Vehicle Visit</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Vehicle Visits"
            value={store.jobs.length}
            subvalue="Recorded check-in visits"
            icon={<Clock size={18} />}
          />
          <StatCard
            title="Active on Floor"
            value={
              store.jobs.filter(
                (j) => j.status !== 'DELIVERED' && j.status !== 'COMPLETED'
              ).length
            }
            subvalue="Vehicles currently in workshop"
            icon={<Car size={18} />}
            highlight={true}
          />
          <StatCard
            title="Backend Contract"
            value="POST /vehicle-visit"
            subvalue="With currentKm and vehicleId"
            icon={<CheckCircle2 size={18} />}
          />
        </div>

        {/* Visits Ledger Table */}
        <PanelCard
          title={`Vehicle Visits Ledger (${filteredVisits.length} Records)`}
          subtitle="All intake visits logged in the database"
          action={
            <div className="relative w-72 sm:w-80">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visit code, plate, customer..."
                className="h-10 w-full rounded-xl border border-white/20 bg-[#1d1c26] pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none"
              />
            </div>
          }
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="py-3.5 px-5">Visit Code</th>
                  <th className="py-3.5 px-5">Vehicle & Customer</th>
                  <th className="py-3.5 px-5 text-right">Odometer (KM)</th>
                  <th className="py-3.5 px-5">Customer Complaints</th>
                  <th className="py-3.5 px-5 text-right">Billing Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {filteredVisits.map((j) => {
                  const cust = store.customers.find((c) => c.id === j.customerId)
                  const veh = store.vehicles.find((v) => v.id === j.vehicleId)

                  return (
                    <tr key={j.id} className="hover:bg-[#232230] transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-heading font-bold text-white text-base">
                          {j.jobCode}
                        </span>
                        <div className="text-[11px] text-[#9e9ea6] font-mono mt-0.5">
                          Visit ID: {j.backendVisitId || 1}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">
                          {veh?.make} {veh?.model}
                        </div>
                        <div className="text-xs text-[#9e9ea6] font-mono mt-0.5">
                          {veh?.registrationNumber} • {cust?.fullName}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-right text-white">
                        {j.checkIn.odometerReading.toLocaleString()} KM
                      </td>
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          {j.customerComplaints.map((c, i) => (
                            <div key={i} className="text-xs text-zinc-300 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#ea0a0b]" />
                              <span>{c}</span>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveVisitForComplaint({
                                id: j.id,
                                backendVisitId: j.backendVisitId,
                                vehicleName: `${veh?.make} ${veh?.model}`,
                                regNumber: veh?.registrationNumber || '',
                              })
                              setComplaintModalOpen(true)
                            }}
                            className="text-[11px] font-bold text-[#ea0a0b] hover:underline mt-1 block"
                          >
                            + Add Complaint
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/admin/invoices?visitId=${j.backendVisitId || 1}&jobId=${j.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#ea0a0b] px-3.5 py-1.5 text-xs font-bold uppercase text-white hover:bg-red-600 transition-all shadow-sm"
                        >
                          <FileText size={13} />
                          <span>Invoice & Billing →</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredVisits.length === 0 && (
              <div className="py-16 text-center text-sm text-[#9e9ea6]">
                No vehicle visits found. Click &quot;New Vehicle Visit&quot; to log one.
              </div>
            )}
          </div>
        </PanelCard>
      </div>

      {/* CREATE VEHICLE VISIT MODAL (POST /api/v1/vehicle-visit) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#16151c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold uppercase text-white">
                Log Vehicle Visit Intake
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="mt-5 space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-red-300 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Registered Vehicle *
                </label>
                {store.vehicles.length === 0 ? (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-amber-300 text-xs">
                    No vehicles found. Please register a customer and vehicle first.
                    <div className="mt-2">
                      <Link href="/admin/vehicles" className="font-bold underline hover:text-white">
                        Go to Vehicle Registry →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <select
                    required
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  >
                    <option value="">-- Choose Registered Vehicle --</option>
                    {store.vehicles.map((v) => {
                      const cust = store.customers.find((c) => c.id === v.customerId)
                      return (
                        <option key={v.id} value={v.id}>
                          {v.registrationNumber} — {v.make} {v.model} (Owner: {cust?.fullName})
                        </option>
                      )
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Current Odometer Reading (KM) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={currentKm}
                  onChange={(e) => setCurrentKm(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 font-mono text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Initial Customer Complaint / Service Intent
                </label>
                <textarea
                  rows={3}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="e.g. Multi-stage paint correction, ceramic coating, or brake dust cleaning"
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold uppercase text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedVehicleId}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-950/40"
                >
                  {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  <span>Log Visit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COMPLAINT MODAL (POST /api/v1/complaint/register/complaint) */}
      {complaintModalOpen && activeVisitForComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#16151c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold uppercase text-white">
                Register Customer Complaint
              </h3>
              <button
                type="button"
                onClick={() => setComplaintModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddComplaint} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div className="rounded-xl bg-[#1d1c26] p-3 text-xs text-zinc-300">
                Logging complaint for <strong className="text-white">{activeVisitForComplaint.vehicleName}</strong> ({activeVisitForComplaint.regNumber})
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Complaint Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="e.g. Swirl marks visible on hood; needs PPF edge re-wrapping"
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setComplaintModalOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold uppercase text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !complaintText.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />}
                  <span>Save Complaint</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkshopShell>
  )
}

export default function AdminVisitsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Loading Vehicle Visits...</div>}>
      <AdminVisitsContent />
    </Suspense>
  )
}
