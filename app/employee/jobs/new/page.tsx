'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { DamageDiagram } from '@/components/workshop/damage-diagram'
import { PanelCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  Customer,
  DamageRecord,
  InspectionFinding,
  JobPriority,
  JobServiceItem,
  Vehicle,
} from '@/lib/workshop/types'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NewJobPage() {
  const router = useRouter()
  const store = useWorkshopStore()

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1)

  // STEP 1 — Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [newCustomerMode, setNewCustomerMode] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Mumbai',
    notes: '',
  })

  // STEP 2 — Vehicle State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')
  const [newVehicleMode, setNewVehicleMode] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    variant: '',
    year: 2024,
    color: '',
    fuelType: 'PETROL' as 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID',
    transmission: 'AUTOMATIC' as 'AUTOMATIC' | 'MANUAL' | 'DUAL_CLUTCH',
    vin: '',
    currentOdometer: 10000,
    bodyType: 'SEDAN' as 'SEDAN' | 'COUPE' | 'SUV' | 'SUPERCAR' | 'HATCHBACK',
    notes: '',
  })

  // STEP 3 — Check-In & Damage
  const [checkInOdometer, setCheckInOdometer] = useState<number>(10000)
  const [fuelLevel, setFuelLevel] = useState<'EMPTY' | 'QUARTER' | 'HALF' | 'THREE_QUARTERS' | 'FULL'>('HALF')
  const [interiorCondition, setInteriorCondition] = useState<'CLEAN' | 'MODERATE' | 'HEAVILY_SOILED'>('CLEAN')
  const [glassCondition, setGlassCondition] = useState<'GOOD' | 'CHIPPED' | 'CRACKED'>('GOOD')
  const [tyreCondition, setTyreCondition] = useState<'GOOD' | 'WORN' | 'NEEDS_REPLACEMENT'>('GOOD')
  const [wheelCondition, setWheelCondition] = useState<'CLEAN' | 'CURBED' | 'SCRATCHED'>('CLEAN')
  const [personalBelongingsRemoved, setPersonalBelongingsRemoved] = useState(true)
  const [damages, setDamages] = useState<DamageRecord[]>([])
  const [checkInNotes, setCheckInNotes] = useState('')

  // STEP 4 — Customer Complaint & Intent
  const [customerComplaints, setCustomerComplaints] = useState<string[]>([])
  const [complaintNotes, setComplaintNotes] = useState('')
  const [customComplaintInput, setCustomComplaintInput] = useState('')

  // STEP 5 — Inspection Findings & Services
  const [inspectionFindings, setInspectionFindings] = useState<InspectionFinding[]>([])
  const [findingArea, setFindingArea] = useState('')
  const [findingObservation, setFindingObservation] = useState('')
  const [findingPrice, setFindingPrice] = useState<number>(0)
  const [findingPriority, setFindingPriority] = useState<'RECOMMENDED' | 'OPTIONAL' | 'URGENT'>('RECOMMENDED')

  const [selectedServices, setSelectedServices] = useState<
    Omit<JobServiceItem, 'id' | 'totalPrice'>[]
  >([])

  const [jobPriority, setJobPriority] = useState<JobPriority>('NORMAL')
  const [assignedEmployeeId, setAssignedEmployeeId] = useState<string>('emp-2')
  const [assignedTechnicianIds, setAssignedTechnicianIds] = useState<string[]>(['emp-3'])
  const [bayNumber, setBayNumber] = useState<string>('Bay 1 (Master Clean Room)')
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(
    new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16)
  )

  // Standard Complaint Options
  const STANDARD_COMPLAINTS = [
    'Paint looks dull & cloudy (Multi-stage correction)',
    'Full Body TPU Paint Protection Film (PPF)',
    '9H Ceramic Coating (High gloss & hydrophobic)',
    'Interior Deep Steam Sanitization & Leather Balming',
    'Brake dust buildup & Wheel Ceramic Coating',
    'Off-road underbody & engine bay detailing',
    'Headlight restoration & film sealing',
    'Rain repellent glass ceramic treatment',
  ]

  // Handlers for Step Transitions
  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomerId(cust.id)
    setCustomerForm({
      fullName: cust.fullName,
      phone: cust.phone,
      email: cust.email,
      address: cust.address,
      city: cust.city,
      notes: cust.notes || '',
    })
    setNewCustomerMode(false)

    // Reset vehicle choice
    const custVehicles = store.repository.getVehiclesByCustomerId(cust.id)
    if (custVehicles.length > 0) {
      handleSelectVehicle(custVehicles[0])
    } else {
      setNewVehicleMode(true)
    }
  }

  const handleSelectVehicle = (veh: Vehicle) => {
    setSelectedVehicleId(veh.id)
    setVehicleForm({
      registrationNumber: veh.registrationNumber,
      make: veh.make,
      model: veh.model,
      variant: veh.variant || '',
      year: veh.year,
      color: veh.color,
      fuelType: veh.fuelType,
      transmission: veh.transmission,
      vin: veh.vin,
      currentOdometer: veh.currentOdometer,
      bodyType: veh.bodyType,
      notes: veh.notes || '',
    })
    setCheckInOdometer(veh.currentOdometer)
    setNewVehicleMode(false)
  }

  const handleToggleComplaint = (complaint: string) => {
    if (customerComplaints.includes(complaint)) {
      setCustomerComplaints(customerComplaints.filter((c) => c !== complaint))
    } else {
      setCustomerComplaints([...customerComplaints, complaint])
    }
  }

  const handleAddCustomComplaint = () => {
    if (!customComplaintInput.trim()) return
    setCustomerComplaints([...customerComplaints, customComplaintInput.trim()])
    setCustomComplaintInput('')
  }

  const handleAddFinding = (e: React.FormEvent) => {
    e.preventDefault()
    if (!findingArea || !findingObservation) return
    const newFinding: InspectionFinding = {
      id: `fnd-${Date.now().toString(36)}`,
      area: findingArea,
      observation: findingObservation,
      priority: findingPriority,
      estimatedPrice: findingPrice || 0,
    }
    setInspectionFindings([...inspectionFindings, newFinding])
    setFindingArea('')
    setFindingObservation('')
    setFindingPrice(0)
  }

  const handleAddCatalogService = (catalogServiceId: string) => {
    const srv = store.services.find((s) => s.id === catalogServiceId)
    if (!srv) return

    const newItem: Omit<JobServiceItem, 'id' | 'totalPrice'> = {
      serviceId: srv.id,
      title: srv.title,
      category: srv.category,
      quantity: 1,
      unitPrice: srv.basePrice,
      discount: 0,
      taxRate: 18,
      estimatedDurationHours: srv.defaultDurationHours,
      assignedTechnicianId: assignedTechnicianIds[0] || 'emp-3',
      status: 'PENDING',
      approvedByCustomer: true,
    }
    setSelectedServices([...selectedServices, newItem])
  }

  const handleRemoveService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index))
  }

  // Calculate Subtotals
  const subtotal = selectedServices.reduce(
    (sum, s) => sum + s.quantity * s.unitPrice,
    0
  )
  const totalDiscount = selectedServices.reduce((sum, s) => sum + (s.discount || 0), 0)
  const taxable = Math.max(0, subtotal - totalDiscount)
  const taxAmount = Math.round(taxable * 0.18)
  const estimatedTotal = taxable + taxAmount

  // Final Submit
  const handleCreateJob = () => {
    // 1. Ensure Customer Exists or Create New
    let finalCustId = selectedCustomerId
    if (newCustomerMode || !finalCustId) {
      const created = store.repository.createCustomer({
        fullName: customerForm.fullName || 'Walk-In Customer',
        phone: customerForm.phone || '+91 90000 00000',
        email: customerForm.email || 'customer@autozone.com',
        address: customerForm.address || 'Workshop Intake',
        city: customerForm.city || 'Mumbai',
        notes: customerForm.notes,
      })
      finalCustId = created.id
    }

    // 2. Ensure Vehicle Exists or Create New
    let finalVehId = selectedVehicleId
    if (newVehicleMode || !finalVehId) {
      const createdVeh = store.repository.createVehicle({
        customerId: finalCustId,
        registrationNumber: vehicleForm.registrationNumber || 'MH 01 NEW',
        make: vehicleForm.make || 'Custom',
        model: vehicleForm.model || 'Model',
        variant: vehicleForm.variant,
        year: Number(vehicleForm.year) || 2024,
        color: vehicleForm.color || 'Gloss Black',
        fuelType: vehicleForm.fuelType,
        transmission: vehicleForm.transmission,
        vin: vehicleForm.vin || `VIN${Date.now()}`,
        currentOdometer: Number(checkInOdometer) || 1000,
        bodyType: vehicleForm.bodyType,
        notes: vehicleForm.notes,
      })
      finalVehId = createdVeh.id
    }

    // 3. Build Services Array with calculated totalPrices
    const formattedServices: JobServiceItem[] = selectedServices.map((s, idx) => {
      const sTaxable = Math.max(0, s.quantity * s.unitPrice - (s.discount || 0))
      const sTax = Math.round((sTaxable * (s.taxRate || 18)) / 100)
      return {
        ...s,
        id: `jsrv-${Date.now().toString(36)}-${idx}`,
        totalPrice: sTaxable + sTax,
      }
    })

    // 4. Create Job in Repository
    const createdJob = store.repository.createJob({
      customerId: finalCustId,
      vehicleId: finalVehId,
      priority: jobPriority,
      assignedEmployeeId,
      assignedTechnicianIds,
      bayNumber,
      checkIn: {
        checkInDate: new Date().toISOString(),
        receivedByEmployeeId: assignedEmployeeId,
        odometerReading: Number(checkInOdometer) || 1000,
        fuelLevel,
        interiorCondition,
        glassCondition,
        tyreCondition,
        wheelCondition,
        personalBelongingsRemoved,
        preExistingDamages: damages,
        checkInNotes,
      },
      customerComplaints,
      customerComplaintNotes: complaintNotes,
      inspectionFindings,
      services: formattedServices,
      estimatedCost: estimatedTotal,
      expectedDeliveryDate,
    })

    router.push(`/employee/jobs/${createdJob.id}`)
  }

  const customerSearchResults = store.customers.filter((c) =>
    c.fullName.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    c.phone.includes(customerSearchQuery)
  )

  const selectedCustomerVehicles = selectedCustomerId
    ? store.repository.getVehiclesByCustomerId(selectedCustomerId)
    : []

  return (
    <WorkshopShell
      title="New Service Intake Wizard"
      subtitle="Complete 5-step vehicle check-in, damage documentation, and estimate builder"
      actions={
        <Link
          href="/employee/jobs"
          className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/5 transition-all"
        >
          <ArrowLeft size={15} />
          <span>Back to Jobs</span>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Step Progress Bar Header */}
        <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-5 sm:p-6 shadow-lg">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { num: 1, stepKey: '01', label: 'Customer', desc: 'Contact & Profile' },
              { num: 2, stepKey: '02', label: 'Vehicle', desc: 'Specs & Plate' },
              { num: 3, stepKey: '03', label: 'Check-In', desc: 'Damage Checklist' },
              { num: 4, stepKey: '04', label: 'Complaints', desc: 'Customer Intent' },
              { num: 5, stepKey: '05', label: 'Estimate', desc: 'Findings & Pricing' },
            ].map((step) => {
              const isDone = currentStep > step.num
              const isCurrent = currentStep === step.num
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num as any)}
                  className={cn(
                    'flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all',
                    isCurrent
                      ? 'border-[#ea0a0b] bg-[#ea0a0b]/15 text-white shadow-md shadow-red-950/40'
                      : isDone
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                      : 'border-white/[0.1] bg-[#1d1c26] text-zinc-400 hover:border-white/20 hover:text-white'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold',
                      isCurrent
                        ? 'bg-[#ea0a0b] text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    )}
                  >
                    {isDone ? <Check size={16} /> : step.stepKey}
                  </div>
                  <div>
                    <div className="font-heading text-xs font-bold uppercase tracking-wider">
                      {step.label}
                    </div>
                    <div className="hidden text-[11px] text-[#9e9ea6] sm:block">
                      {step.desc}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* STEP 1: CUSTOMER */}
        {currentStep === 1 && (
          <PanelCard
            title="Step 01 — Customer Identification & Account"
            subtitle="Search existing customer database or register a new client profile"
          >
            <div className="space-y-8">
              {!newCustomerMode && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2.5">
                    Search Registered Customer
                  </label>
                  <div className="relative max-w-2xl">
                    <Search
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      placeholder="Type customer name or phone number..."
                      className="w-full rounded-xl border border-white/20 bg-[#1d1c26] pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-400 focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  {/* Customer Results Grid */}
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 max-h-72 overflow-y-auto">
                    {customerSearchResults.map((cust) => {
                      const isSelected = selectedCustomerId === cust.id
                      return (
                        <div
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className={cn(
                            'cursor-pointer rounded-xl border p-4 transition-all',
                            isSelected
                              ? 'border-[#ea0a0b] bg-[#ea0a0b]/15 shadow-md shadow-red-950/40'
                              : 'border-white/[0.14] bg-[#1d1c26] hover:border-white/30'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white text-sm">
                              {cust.fullName}
                            </span>
                            {isSelected && <CheckCircle2 size={18} className="text-[#ea0a0b]" />}
                          </div>
                          <div className="mt-1 text-xs text-[#9e9ea6]">
                            {cust.phone} • {cust.email}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 border-t border-white/[0.08] pt-2">
                            <span>{cust.totalVisits} previous visits</span>
                            <span className="font-mono font-bold text-white">
                              ₹{cust.totalSpent.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                    <span className="text-xs text-zinc-400">
                      Can&apos;t find customer in records?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId('')
                        setNewCustomerMode(true)
                      }}
                      className="flex items-center gap-2 rounded-xl border border-dashed border-[#ea0a0b]/60 bg-[#ea0a0b]/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-[#ea0a0b]/25 transition-all"
                    >
                      <Plus size={15} />
                      <span>Register New Customer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Customer Form Fields */}
              <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-heading text-base font-bold uppercase text-white">
                    {newCustomerMode
                      ? 'New Customer Information'
                      : 'Selected Customer Profile Details'}
                  </span>
                  {newCustomerMode && (
                    <button
                      type="button"
                      onClick={() => setNewCustomerMode(false)}
                      className="text-xs text-zinc-300 hover:text-white"
                    >
                      ← Back to Search
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerForm.fullName}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, fullName: e.target.value })
                      }
                      placeholder="e.g. Vikramaditya Singhania"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerForm.phone}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, phone: e.target.value })
                      }
                      placeholder="+91 98200 12345"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, email: e.target.value })
                      }
                      placeholder="client@gmail.com"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Address / Locality
                    </label>
                    <input
                      type="text"
                      value={customerForm.address}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, address: e.target.value })
                      }
                      placeholder="Flat / Villa / Street"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      City
                    </label>
                    <input
                      type="text"
                      value={customerForm.city}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, city: e.target.value })
                      }
                      placeholder="Mumbai"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      VIP Client Notes / Special Preferences
                    </label>
                    <textarea
                      rows={2}
                      value={customerForm.notes}
                      onChange={(e) =>
                        setCustomerForm({ ...customerForm, notes: e.target.value })
                      }
                      placeholder="Preferences, allergies, timing preferences..."
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!customerForm.fullName}
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-950/50 transition-all"
                >
                  <span>Continue to Vehicle Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </PanelCard>
        )}

        {/* STEP 2: VEHICLE */}
        {currentStep === 2 && (
          <PanelCard
            title="Step 02 — Vehicle Specifications"
            subtitle="Select from customer's garage or register a new vehicle record"
          >
            <div className="space-y-8">
              {/* Existing Customer Vehicles */}
              {selectedCustomerVehicles.length > 0 && !newVehicleMode && (
                <div>
                  <div className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Existing Vehicles in Customer&apos;s Garage
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedCustomerVehicles.map((veh) => {
                      const isSelected = selectedVehicleId === veh.id
                      return (
                        <div
                          key={veh.id}
                          onClick={() => handleSelectVehicle(veh)}
                          className={cn(
                            'cursor-pointer rounded-xl border p-5 transition-all',
                            isSelected
                              ? 'border-[#ea0a0b] bg-[#ea0a0b]/15 shadow-md shadow-red-950/40'
                              : 'border-white/[0.14] bg-[#1d1c26] hover:border-white/30'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-heading font-bold text-white text-lg">
                              {veh.make} {veh.model}
                            </span>
                            {isSelected && (
                              <CheckCircle2 size={18} className="text-[#ea0a0b]" />
                            )}
                          </div>
                          <div className="mt-1 font-mono text-sm font-bold text-zinc-300">
                            {veh.registrationNumber}
                          </div>
                          <div className="mt-2 text-xs text-[#9e9ea6]">
                            {veh.color} • {veh.year} • {veh.fuelType} • {veh.currentOdometer.toLocaleString()} km
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVehicleId('')
                        setNewVehicleMode(true)
                      }}
                      className="flex items-center gap-2 rounded-xl border border-dashed border-[#ea0a0b]/60 bg-[#ea0a0b]/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-[#ea0a0b]/25"
                    >
                      <Plus size={15} />
                      <span>Add New Vehicle to Customer Garage</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Vehicle Form */}
              <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-heading text-base font-bold uppercase text-white">
                    {newVehicleMode
                      ? 'Register New Vehicle'
                      : 'Vehicle Identification Details'}
                  </span>
                  {newVehicleMode && selectedCustomerVehicles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setNewVehicleMode(false)}
                      className="text-xs text-zinc-300 hover:text-white"
                    >
                      ← Select From Existing Garage
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      License Plate / Registration *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.registrationNumber}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          registrationNumber: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g. MH 01 DX 0911"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 font-mono text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Make / Brand *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.make}
                      onChange={(e) =>
                        setVehicleForm({ ...vehicleForm, make: e.target.value })
                      }
                      placeholder="e.g. Porsche / BMW / Mercedes"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Model *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleForm.model}
                      onChange={(e) =>
                        setVehicleForm({ ...vehicleForm, model: e.target.value })
                      }
                      placeholder="e.g. 911 GT3 / M4 Competition"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Variant / Trim
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.variant}
                      onChange={(e) =>
                        setVehicleForm({ ...vehicleForm, variant: e.target.value })
                      }
                      placeholder="e.g. Clubsport Package"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Model Year
                    </label>
                    <input
                      type="number"
                      value={vehicleForm.year}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          year: Number(e.target.value),
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Exterior Color & Finish
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.color}
                      onChange={(e) =>
                        setVehicleForm({ ...vehicleForm, color: e.target.value })
                      }
                      placeholder="e.g. Shark Blue (Non-Metallic)"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Fuel Type
                    </label>
                    <select
                      value={vehicleForm.fuelType}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          fuelType: e.target.value as any,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    >
                      <option value="PETROL">Petrol</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="ELECTRIC">Electric (EV)</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Transmission
                    </label>
                    <select
                      value={vehicleForm.transmission}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          transmission: e.target.value as any,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    >
                      <option value="AUTOMATIC">Automatic</option>
                      <option value="MANUAL">Manual</option>
                      <option value="DUAL_CLUTCH">Dual-Clutch (PDK/DCT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      VIN / Chassis Number
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.vin}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          vin: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g. WP0ZZZ99ZPS182931"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 font-mono text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                >
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!vehicleForm.registrationNumber || !vehicleForm.make}
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-950/50 transition-all"
                >
                  <span>Continue to Check-In & Damage Matrix</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </PanelCard>
        )}

        {/* STEP 3: VEHICLE CHECK-IN & DAMAGE MATRIX */}
        {currentStep === 3 && (
          <PanelCard
            title="Step 03 — Vehicle Check-In & Damage Matrix"
            subtitle="Document pre-existing defects, odometer, fuel, and component health"
          >
            <div className="space-y-8">
              {/* Check-In Health Grid */}
              <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 sm:p-7">
                <div className="mb-5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Intake Condition Checklist
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Odometer (KM) *
                    </label>
                    <input
                      type="number"
                      required
                      value={checkInOdometer}
                      onChange={(e) => setCheckInOdometer(Number(e.target.value))}
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Fuel Gauge Level
                    </label>
                    <select
                      value={fuelLevel}
                      onChange={(e) => setFuelLevel(e.target.value as any)}
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    >
                      <option value="FULL">Full Tank</option>
                      <option value="THREE_QUARTERS">3/4 Tank</option>
                      <option value="HALF">1/2 Tank</option>
                      <option value="QUARTER">1/4 Tank</option>
                      <option value="EMPTY">Reserve / Empty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Interior State
                    </label>
                    <select
                      value={interiorCondition}
                      onChange={(e) => setInteriorCondition(e.target.value as any)}
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    >
                      <option value="CLEAN">Clean Factory</option>
                      <option value="MODERATE">Moderate Dust/Stains</option>
                      <option value="HEAVILY_SOILED">Heavily Soiled / Mud</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Glass / Windshield
                    </label>
                    <select
                      value={glassCondition}
                      onChange={(e) => setGlassCondition(e.target.value as any)}
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                    >
                      <option value="GOOD">Good / Flawless</option>
                      <option value="CHIPPED">Stone Chipped</option>
                      <option value="CRACKED">Cracked</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 border-t border-white/[0.08] pt-4">
                  <input
                    type="checkbox"
                    id="belongingsCheck"
                    checked={personalBelongingsRemoved}
                    onChange={(e) => setPersonalBelongingsRemoved(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-[#ea0a0b]"
                  />
                  <label
                    htmlFor="belongingsCheck"
                    className="text-xs font-semibold text-zinc-300 cursor-pointer"
                  >
                    Customer confirmed all valuable personal belongings have been removed from cabin and trunk.
                  </label>
                </div>
              </div>

              {/* Damage Diagram */}
              <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 sm:p-7">
                <DamageDiagram damages={damages} onChange={setDamages} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Additional Check-In Inspector Notes
                </label>
                <textarea
                  rows={3}
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="Notes on custom aftermarket bodykits, paint thickness gauge results, dashcam status..."
                  className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                >
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/50 transition-all"
                >
                  <span>Continue to Customer Complaints</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </PanelCard>
        )}

        {/* STEP 4: CUSTOMER COMPLAINTS */}
        {currentStep === 4 && (
          <PanelCard
            title="Step 04 — Customer Complaints & Service Intent"
            subtitle="Record what the customer wants resolved and requested detailing packages"
          >
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                  Select Customer Complaint Categories & Package Requests
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {STANDARD_COMPLAINTS.map((item) => {
                    const isSelected = customerComplaints.includes(item)
                    return (
                      <div
                        key={item}
                        onClick={() => handleToggleComplaint(item)}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-xl border p-4 text-xs font-semibold transition-all',
                          isSelected
                            ? 'border-[#ea0a0b] bg-[#ea0a0b]/15 text-white shadow-sm'
                            : 'border-white/[0.14] bg-[#1d1c26] text-zinc-300 hover:border-white/30 hover:text-white'
                        )}
                      >
                        <span>{item}</span>
                        {isSelected ? (
                          <CheckCircle2 size={18} className="text-[#ea0a0b]" />
                        ) : (
                          <Plus size={16} className="text-zinc-500" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Custom Complaint Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customComplaintInput}
                  onChange={(e) => setCustomComplaintInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomComplaint()
                    }
                  }}
                  placeholder="Add custom voice-of-customer requirement..."
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomComplaint}
                  className="shrink-0 rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#2c2b3a] transition-all"
                >
                  Add Requirement
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Detailed Voice-of-Customer Notes
                </label>
                <textarea
                  rows={3}
                  value={complaintNotes}
                  onChange={(e) => setComplaintNotes(e.target.value)}
                  placeholder="e.g. Customer emphasized zero holograms under sunlight. Wants door edges wrapped in PPF without visible seams..."
                  className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                >
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/50 transition-all"
                >
                  <span>Continue to Inspection & Estimate Builder</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </PanelCard>
        )}

        {/* STEP 5: INSPECTION FINDINGS & SERVICE ESTIMATE BUILDER */}
        {currentStep === 5 && (
          <div className="space-y-8">
            {/* Technician Findings Builder */}
            <PanelCard
              title="Step 05A — Technician Physical Inspection Findings"
              subtitle="Record what the shop technician actually observed on the vehicle"
            >
              <form onSubmit={handleAddFinding} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Inspection Area
                    </label>
                    <input
                      type="text"
                      value={findingArea}
                      onChange={(e) => setFindingArea(e.target.value)}
                      placeholder="e.g. Roof & Trunk Paintwork"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Observation & Technical Analysis
                    </label>
                    <input
                      type="text"
                      value={findingObservation}
                      onChange={(e) => setFindingObservation(e.target.value)}
                      placeholder="e.g. Moderate swirl marks and acid rain etching, 130μm paint depth"
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Finding Priority
                    </label>
                    <select
                      value={findingPriority}
                      onChange={(e) => setFindingPriority(e.target.value as any)}
                      className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none"
                    >
                      <option value="RECOMMENDED">Recommended</option>
                      <option value="URGENT">Urgent / Critical</option>
                      <option value="OPTIONAL">Optional Upsell</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!findingArea || !findingObservation}
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#2c2b3a] disabled:opacity-50 transition-all"
                  >
                    <Plus size={15} />
                    <span>Add Inspection Finding</span>
                  </button>
                </div>
              </form>

              {/* Inspection Findings List */}
              {inspectionFindings.length > 0 && (
                <div className="mt-5 divide-y divide-white/[0.08] rounded-xl border border-white/[0.14] bg-[#16151c]">
                  {inspectionFindings.map((f, i) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-4 sm:p-5 text-xs"
                    >
                      <div>
                        <span className="font-heading font-bold text-white uppercase text-sm">
                          {f.area}
                        </span>
                        <p className="text-zinc-300 mt-0.5">{f.observation}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setInspectionFindings(
                            inspectionFindings.filter((_, idx) => idx !== i)
                          )
                        }
                        className="rounded-lg p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </PanelCard>

            {/* Service & Estimate Builder */}
            <PanelCard
              title="Step 05B — Service Scope & Price Builder"
              subtitle="Add packages from service catalog or configure custom line items"
            >
              <div className="space-y-8">
                {/* Catalog Quick Pick */}
                <div>
                  <div className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Quick Pick From Service Catalog
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {store.services.map((srv) => (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => handleAddCatalogService(srv.id)}
                        className="flex flex-col justify-between rounded-xl border border-white/[0.14] bg-[#1d1c26] p-4 text-left transition-all hover:border-[#ea0a0b]/50 hover:bg-[#242330]"
                      >
                        <div className="font-heading text-xs font-bold uppercase text-white">
                          {srv.title}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs border-t border-white/[0.08] pt-2">
                          <span className="font-bold text-[#ea0a0b] font-mono">
                            ₹{srv.basePrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[#9e9ea6]">
                            {srv.defaultDurationHours} hrs
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Services Table */}
                <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 sm:p-7">
                  <div className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
                    Estimated Line Items ({selectedServices.length})
                  </div>

                  {selectedServices.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[10px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                            <th className="px-5 py-3.5">Service Title</th>
                            <th className="px-5 py-3.5">Unit Price</th>
                            <th className="px-5 py-3.5">Qty</th>
                            <th className="px-5 py-3.5">Discount</th>
                            <th className="px-5 py-3.5">Tax</th>
                            <th className="px-5 py-3.5 text-right">Line Total</th>
                            <th className="px-5 py-3.5 text-right">Remove</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.08]">
                          {selectedServices.map((srv, idx) => {
                            const lineTaxable = Math.max(
                              0,
                              srv.quantity * srv.unitPrice - (srv.discount || 0)
                            )
                            const lineTax = Math.round(
                              (lineTaxable * (srv.taxRate || 18)) / 100
                            )
                            const lineTotal = lineTaxable + lineTax

                            return (
                              <tr key={idx} className="hover:bg-[#232230]">
                                <td className="px-5 py-4 font-semibold text-white text-sm">
                                  {srv.title}
                                </td>
                                <td className="px-5 py-4 font-mono text-zinc-300">
                                  ₹{srv.unitPrice.toLocaleString('en-IN')}
                                </td>
                                <td className="px-5 py-4">
                                  <input
                                    type="number"
                                    min="1"
                                    value={srv.quantity}
                                    onChange={(e) => {
                                      const val = Math.max(1, Number(e.target.value))
                                      const updated = [...selectedServices]
                                      updated[idx].quantity = val
                                      setSelectedServices(updated)
                                    }}
                                    className="w-16 rounded-lg border border-white/20 bg-[#1d1c26] px-2 py-1 text-xs text-white"
                                  />
                                </td>
                                <td className="px-5 py-4">
                                  <input
                                    type="number"
                                    min="0"
                                    value={srv.discount || 0}
                                    onChange={(e) => {
                                      const val = Number(e.target.value)
                                      const updated = [...selectedServices]
                                      updated[idx].discount = val
                                      setSelectedServices(updated)
                                    }}
                                    className="w-24 rounded-lg border border-white/20 bg-[#1d1c26] px-2 py-1 text-xs text-white"
                                  />
                                </td>
                                <td className="px-5 py-4 text-zinc-300">
                                  {srv.taxRate}% (₹{lineTax.toLocaleString('en-IN')})
                                </td>
                                <td className="px-5 py-4 font-mono font-bold text-[#ea0a0b] text-sm text-right">
                                  ₹{lineTotal.toLocaleString('en-IN')}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveService(idx)}
                                    className="rounded-lg p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-[#9e9ea6]">
                      No services selected yet. Pick packages from catalog above.
                    </div>
                  )}

                  {/* Financial Total Summary */}
                  {selectedServices.length > 0 && (
                    <div className="mt-6 flex flex-col items-end border-t border-white/10 pt-5 text-xs space-y-2">
                      <div className="flex w-72 justify-between text-zinc-400">
                        <span>Services Subtotal:</span>
                        <span className="font-mono text-white">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex w-72 justify-between text-zinc-400">
                        <span>Discount Applied:</span>
                        <span className="font-mono text-emerald-400">
                          -₹{totalDiscount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex w-72 justify-between text-zinc-400">
                        <span>GST / Tax (18%):</span>
                        <span className="font-mono text-white">
                          ₹{taxAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex w-72 justify-between border-t border-white/15 pt-3 text-sm font-bold text-white">
                        <span>ESTIMATED TOTAL:</span>
                        <span className="font-mono text-[#ea0a0b] text-lg">
                          ₹{estimatedTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Workshop Execution Assignment */}
                <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 sm:p-7">
                  <div className="mb-5 text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Workshop Allocation & Schedule
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Job Priority
                      </label>
                      <select
                        value={jobPriority}
                        onChange={(e) => setJobPriority(e.target.value as any)}
                        className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none"
                      >
                        <option value="LOW">Low Priority</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent (VIP / Track Day)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Lead Service Advisor
                      </label>
                      <select
                        value={assignedEmployeeId}
                        onChange={(e) => setAssignedEmployeeId(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none"
                      >
                        {store.employees
                          .filter((e) => e.role === 'ADMIN' || e.role === 'MANAGER' || e.role === 'EMPLOYEE')
                          .map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.fullName} ({e.designation})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Assigned Detailing Bay
                      </label>
                      <select
                        value={bayNumber}
                        onChange={(e) => setBayNumber(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none"
                      >
                        <option value="Bay 1 (Master Clean Room)">Bay 1 (Master Clean Room)</option>
                        <option value="Bay 2 (Coating & Detailing)">Bay 2 (Coating & Detailing)</option>
                        <option value="Bay 3 (Delivery Staging)">Bay 3 (Delivery Staging)</option>
                        <option value="Bay 4 (Wash & Decon)">Bay 4 (Wash & Decon)</option>
                        <option value="Bay 5 (Interior Spa)">Bay 5 (Interior Spa)</option>
                        <option value="Bay 6 (Paint Correction)">Bay 6 (Paint Correction)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Target Delivery Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={expectedDeliveryDate}
                        onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-3.5 py-2.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                  >
                    <ArrowLeft size={15} />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateJob}
                    className="flex items-center gap-2.5 rounded-xl bg-[#ea0a0b] px-9 py-3.5 font-heading text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-red-950/60 hover:bg-red-600 active:scale-[0.98] transition-all"
                  >
                    <FileCheck size={18} />
                    <span>Generate Service Order & Check-In</span>
                  </button>
                </div>
              </div>
            </PanelCard>
          </div>
        )}
      </div>
    </WorkshopShell>
  )
}
