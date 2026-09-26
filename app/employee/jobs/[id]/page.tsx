'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { DamageDiagram } from '@/components/workshop/damage-diagram'
import {
  ApprovalBadge,
  DamageSeverityBadge,
  JobStatusBadge,
  PanelCard,
  PaymentStatusBadge,
  PriorityBadge,
  StatCard,
} from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  ApprovalStatus,
  DamageRecord,
  JobPriority,
  JobStatus,
  PaymentMethod,
  PhotoStage,
} from '@/lib/workshop/types'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Camera,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Flame,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Printer,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  Wrench,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const store = useWorkshopStore()

  const job = store.repository.getJobById(resolvedParams.id)

  const [activeTab, setActiveTab] = useState<
    | 'OVERVIEW'
    | 'CUSTOMER'
    | 'VEHICLE'
    | 'INSPECTION'
    | 'SERVICES'
    | 'ESTIMATE'
    | 'PROGRESS'
    | 'MATERIALS'
    | 'PHOTOS'
    | 'PAYMENTS'
    | 'TIMELINE'
  >('OVERVIEW')

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false)
  const [addPhotoModalOpen, setAddPhotoModalOpen] = useState(false)
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)

  // Form states for modals
  const [newStatus, setNewStatus] = useState<JobStatus>('IN_PROGRESS')
  const [statusNote, setStatusNote] = useState('')

  const [newApprovalStatus, setNewApprovalStatus] = useState<ApprovalStatus>('APPROVED')
  const [approvalNote, setApprovalNote] = useState('')

  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI')
  const [paymentRef, setPaymentRef] = useState('')

  const [newServiceId, setNewServiceId] = useState('')
  const [newServicePrice, setNewServicePrice] = useState(0)

  const [photoStage, setPhotoStage] = useState<PhotoStage>('DURING')
  const [photoCaption, setPhotoCaption] = useState('')
  const [photoUrl, setPhotoUrl] = useState('/images/ceramic-coating.png')

  const [deliveryReceiver, setDeliveryReceiver] = useState('')
  const [deliveryRemarks, setDeliveryRemarks] = useState('')
  const [deliveryRating, setDeliveryRating] = useState(5)

  if (!job) {
    return (
      <WorkshopShell title="Job Not Found">
        <div className="py-16 text-center">
          <h2 className="font-heading text-2xl font-bold uppercase text-white">
            Job ID &quot;{resolvedParams.id}&quot; was not found.
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            This job record may have been archived or removed from the database.
          </p>
          <Link
            href="/employee/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-600"
          >
            <ArrowLeft size={16} />
            <span>Return to Jobs Master</span>
          </Link>
        </div>
      </WorkshopShell>
    )
  }

  const customer = store.customers.find((c) => c.id === job.customerId)
  const vehicle = store.vehicles.find((v) => v.id === job.vehicleId)
  const advisor = store.employees.find((e) => e.id === job.assignedEmployeeId)

  // Status Handlers
  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault()
    store.repository.updateJobStatus(job.id, newStatus, statusNote)
    setStatusModalOpen(false)
    setStatusNote('')
  }

  const handleUpdateApproval = (e: React.FormEvent) => {
    e.preventDefault()
    store.repository.updateApproval(job.id, newApprovalStatus, approvalNote)
    setApprovalModalOpen(false)
    setApprovalNote('')
  }

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentAmount <= 0) return
    store.repository.addPayment(job.id, {
      amount: paymentAmount,
      paymentMethod,
      transactionRef: paymentRef || `TXN-${Date.now()}`,
      notes: `Recorded at workshop counter.`,
    })
    setPaymentModalOpen(false)
    setPaymentAmount(0)
    setPaymentRef('')
  }

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault()
    const catalogItem = store.services.find((s) => s.id === newServiceId)
    if (!catalogItem) return

    store.repository.addJobService(job.id, {
      serviceId: catalogItem.id,
      title: catalogItem.title,
      category: catalogItem.category,
      quantity: 1,
      unitPrice: newServicePrice || catalogItem.basePrice,
      discount: 0,
      taxRate: 18,
      estimatedDurationHours: catalogItem.defaultDurationHours,
      assignedTechnicianId: job.assignedTechnicianIds[0],
    })
    setAddServiceModalOpen(false)
    setNewServiceId('')
  }

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault()
    store.repository.addPhoto(job.id, {
      url: photoUrl,
      stage: photoStage,
      caption: photoCaption || `${photoStage} stage inspection documentation`,
    })
    setAddPhotoModalOpen(false)
    setPhotoCaption('')
  }

  const handleCompleteDelivery = (e: React.FormEvent) => {
    e.preventDefault()
    store.repository.completeDelivery(job.id, {
      receivedByCustomerName: deliveryReceiver || customer?.fullName || 'Customer',
      customerSignatureAck: true,
      finalOdometer: job.checkIn.odometerReading + 2,
      qualityCheckPassed: true,
      allBelongingsReturned: true,
      customerFeedbackScore: deliveryRating,
      customerRemarks: deliveryRemarks,
    })
    setDeliveryModalOpen(false)
  }

  const TABS = [
    { id: 'OVERVIEW', label: 'Overview', icon: <Layers size={15} /> },
    { id: 'CUSTOMER', label: 'Customer', icon: <User size={15} /> },
    { id: 'VEHICLE', label: 'Vehicle', icon: <Car size={15} /> },
    {
      id: 'INSPECTION',
      label: `Inspection (${job.checkIn.preExistingDamages.length + job.inspectionFindings.length})`,
      icon: <AlertCircle size={15} />,
    },
    { id: 'SERVICES', label: `Services (${job.services.length})`, icon: <Wrench size={15} /> },
    { id: 'ESTIMATE', label: 'Estimate & Approval', icon: <FileCheck size={15} /> },
    { id: 'PROGRESS', label: 'Work Progress', icon: <Sparkles size={15} /> },
    { id: 'MATERIALS', label: `Materials (${job.materials.length})`, icon: <Package size={15} /> },
    { id: 'PHOTOS', label: `Photos (${job.photos.length})`, icon: <Camera size={15} /> },
    {
      id: 'PAYMENTS',
      label: `Payments (₹${job.amountPaid.toLocaleString('en-IN')})`,
      icon: <DollarSign size={15} />,
    },
    { id: 'TIMELINE', label: `Audit Log (${job.timeline.length})`, icon: <Clock size={15} /> },
  ]

  return (
    <WorkshopShell>
      <div className="space-y-8">
        {/* Header Ribbon Card */}
        <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 sm:p-7 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <Link
                href="/employee/jobs"
                className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-[#242330] text-zinc-300 transition-colors hover:bg-[#2c2b3a] hover:text-white"
                title="Back to Jobs"
              >
                <ArrowLeft size={20} />
              </Link>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-heading text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {job.jobCode}
                  </h1>
                  <JobStatusBadge status={job.status} />
                  <PriorityBadge priority={job.priority} />
                  <ApprovalBadge status={job.approvalStatus} />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-zinc-300">
                  <span className="font-bold text-white">
                    {vehicle?.make} {vehicle?.model}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="font-mono font-semibold text-[#ea0a0b]">
                    {vehicle?.registrationNumber}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-300">
                    Client: <strong className="text-white font-medium">{customer?.fullName}</strong>
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="rounded-md bg-[#242330] border border-white/10 px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-200">
                    {job.bayNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setNewStatus(job.status)
                  setStatusModalOpen(true)
                }}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#242330] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#2c2b3a]"
              >
                <Wrench size={15} className="text-[#ea0a0b]" />
                <span>Update Status</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-300 transition-colors hover:bg-emerald-950/70"
              >
                <CreditCard size={15} />
                <span>Record Payment</span>
              </button>

              {job.status === 'READY_FOR_DELIVERY' && (
                <button
                  type="button"
                  onClick={() => setDeliveryModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/60 hover:bg-red-600 animate-pulse transition-all"
                >
                  <CheckCircle2 size={16} />
                  <span>Handover Vehicle</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex overflow-x-auto border-b border-white/10 pb-1 scrollbar-none">
          <div className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
                  activeTab === tab.id
                    ? 'bg-[#ea0a0b] text-white shadow-lg shadow-red-950/40'
                    : 'bg-[#242330] border border-white/[0.12] text-[#c0c0c6] hover:bg-[#2c2b3a] hover:text-white'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            {/* Metric Summary */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <StatCard
                title="Total Service Value"
                value={`₹${job.actualFinalCost.toLocaleString('en-IN')}`}
                subvalue="Incl. 18% GST"
                icon={<DollarSign size={18} />}
              />
              <StatCard
                title="Amount Paid"
                value={`₹${job.amountPaid.toLocaleString('en-IN')}`}
                subvalue={job.paymentStatus}
                icon={<CheckCircle2 size={18} />}
              />
              <StatCard
                title="Balance Due"
                value={`₹${job.balanceDue.toLocaleString('en-IN')}`}
                subvalue={job.balanceDue === 0 ? 'Fully Settled' : 'Payment Pending'}
                icon={<ShieldCheck size={18} />}
                highlight={job.balanceDue > 0}
              />
              <StatCard
                title="Target Delivery"
                value={new Date(job.expectedDeliveryDate).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                })}
                subvalue={new Date(job.expectedDeliveryDate).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                icon={<Clock size={18} />}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column: Key Details */}
              <div className="space-y-6 lg:col-span-2">
                {/* Voice of Customer & Complaints */}
                <PanelCard
                  title="Customer Complaints & Desired Scope"
                  subtitle="Primary pain points and expectations logged during intake"
                >
                  <ul className="space-y-3 text-xs sm:text-sm">
                    {job.customerComplaints.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-4 text-zinc-200"
                      >
                        <span className="font-bold text-[#ea0a0b] text-base leading-none">•</span>
                        <span className="leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>

                  {job.customerComplaintNotes && (
                    <div className="mt-4 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-4 text-xs sm:text-sm text-zinc-300">
                      <span className="font-bold uppercase text-[11px] tracking-wider text-white block mb-1.5">
                        Specific Advisor Notes:
                      </span>
                      <p className="leading-relaxed">{job.customerComplaintNotes}</p>
                    </div>
                  )}
                </PanelCard>

                {/* Service Scope Snapshot */}
                <PanelCard
                  title="Approved Service Package Scope"
                  action={
                    <button
                      type="button"
                      onClick={() => setActiveTab('SERVICES')}
                      className="text-xs font-bold uppercase tracking-wider text-[#ea0a0b] hover:underline"
                    >
                      View Full Scope →
                    </button>
                  }
                >
                  <div className="divide-y divide-white/[0.08]">
                    {job.services.map((srv) => (
                      <div
                        key={srv.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0 text-xs sm:text-sm"
                      >
                        <div>
                          <div className="font-semibold text-white">{srv.title}</div>
                          <div className="text-xs text-[#9e9ea6] mt-0.5">
                            {srv.estimatedDurationHours} hours estimated labor
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-[#ea0a0b]">
                            ₹{srv.totalPrice.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                            {srv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </PanelCard>
              </div>

              {/* Right Column: Staff & Customer Card */}
              <div className="space-y-6">
                <PanelCard title="Assigned Workshop Team">
                  <div className="space-y-5 text-xs sm:text-sm">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                        Lead Service Advisor
                      </span>
                      <div className="mt-2 flex items-center gap-3.5 rounded-xl bg-[#1d1c26] p-3.5 border border-white/[0.14]">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ea0a0b]/20 font-bold text-[#ea0a0b]">
                          {advisor?.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{advisor?.fullName}</div>
                          <div className="text-xs text-[#9e9ea6]">{advisor?.phone}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                        Assigned Technicians ({job.assignedTechnicianIds.length})
                      </span>
                      <div className="mt-2 space-y-2">
                        {job.assignedTechnicianIds.map((tId) => {
                          const tech = store.employees.find((e) => e.id === tId)
                          return (
                            <div
                              key={tId}
                              className="flex items-center justify-between rounded-xl bg-[#1d1c26] p-3 border border-white/[0.14]"
                            >
                              <span className="font-semibold text-white">
                                {tech?.fullName}
                              </span>
                              <span className="text-[11px] text-[#9e9ea6]">
                                {tech?.designation}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                        Workshop Bay
                      </span>
                      <div className="mt-2 rounded-xl border border-white/20 bg-[#1d1c26] p-3 font-semibold text-white font-mono">
                        {job.bayNumber}
                      </div>
                    </div>
                  </div>
                </PanelCard>

                {/* Quick Customer Card */}
                <PanelCard title="Customer Contact">
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="font-bold text-white text-base">
                      {customer?.fullName}
                    </div>
                    <div className="text-zinc-300 flex items-center gap-2.5">
                      <Phone size={15} className="text-[#ea0a0b]" />
                      <span>{customer?.phone}</span>
                    </div>
                    <div className="text-zinc-300 flex items-center gap-2.5">
                      <MapPin size={15} className="text-[#ea0a0b]" />
                      <span>
                        {customer?.address}, {customer?.city}
                      </span>
                    </div>
                    {customer?.notes && (
                      <div className="mt-3 rounded-xl bg-amber-950/30 border border-amber-500/30 p-3 text-xs text-amber-300">
                        {customer.notes}
                      </div>
                    )}
                  </div>
                </PanelCard>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMER */}
        {activeTab === 'CUSTOMER' && customer && (
          <PanelCard
            title={`Customer Profile — ${customer.fullName}`}
            subtitle="Complete customer history, registered vehicles, and billing stats"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-3.5 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5 text-xs sm:text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  Contact Information
                </span>
                <div>
                  <div className="font-bold text-white text-base">{customer.fullName}</div>
                  <div className="text-zinc-300 mt-1">{customer.phone}</div>
                  <div className="text-[#9e9ea6]">{customer.email}</div>
                  <div className="mt-2 text-zinc-400">
                    {customer.address}, {customer.city}
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5 text-xs sm:text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  Lifetime Relationship
                </span>
                <div>
                  <div className="text-zinc-300">Total Visits: {customer.totalVisits}</div>
                  <div className="text-lg font-bold text-white mt-1">
                    Lifetime Spend: ₹{customer.totalSpent.toLocaleString('en-IN')}
                  </div>
                  <div className="text-amber-400 mt-1 font-semibold">
                    Outstanding: ₹{customer.outstandingBalance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="space-y-3.5 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5 text-xs sm:text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  Client Direct Actions
                </span>
                <div className="flex flex-col gap-2.5">
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#ea0a0b] py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-600 shadow-md shadow-red-950/40"
                  >
                    <Phone size={15} />
                    <span>Call Customer</span>
                  </a>
                  <Link
                    href={`/employee/customers/${customer.id}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-[#242330] py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-[#2c2b3a] hover:text-white transition-colors"
                  >
                    <span>View Customer 360 Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </PanelCard>
        )}

        {/* TAB 3: VEHICLE */}
        {activeTab === 'VEHICLE' && vehicle && (
          <PanelCard
            title={`Vehicle Passport — ${vehicle.make} ${vehicle.model}`}
            subtitle="Vehicle specifications, chassis VIN, and check-in mechanical snapshot"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5 text-xs sm:text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  Specifications
                </span>
                <div className="grid grid-cols-2 gap-3 text-zinc-300">
                  <div>
                    Plate: <span className="font-mono text-white font-bold">{vehicle.registrationNumber}</span>
                  </div>
                  <div>
                    Year: <span className="text-white font-semibold">{vehicle.year}</span>
                  </div>
                  <div>
                    Color: <span className="text-white">{vehicle.color}</span>
                  </div>
                  <div>
                    Body: <span className="text-white">{vehicle.bodyType}</span>
                  </div>
                  <div>
                    Fuel: <span className="text-white">{vehicle.fuelType}</span>
                  </div>
                  <div>
                    Gearbox: <span className="text-white">{vehicle.transmission}</span>
                  </div>
                </div>
                <div className="mt-3 font-mono text-xs text-zinc-400 border-t border-white/[0.08] pt-2">
                  VIN: {vehicle.vin}
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5 text-xs sm:text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  Current Check-In Condition
                </span>
                <div className="space-y-1.5 text-zinc-300">
                  <div>
                    Odometer: <span className="font-bold text-white">{job.checkIn.odometerReading.toLocaleString()} km</span>
                  </div>
                  <div>
                    Fuel Level: <span className="text-white font-semibold">{job.checkIn.fuelLevel}</span>
                  </div>
                  <div>
                    Interior: <span className="text-white">{job.checkIn.interiorCondition}</span>
                  </div>
                  <div>
                    Glass: <span className="text-white">{job.checkIn.glassCondition}</span>
                  </div>
                  <div>
                    Tyres: <span className="text-white">{job.checkIn.tyreCondition}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5 text-xs sm:text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  Vehicle Passport Actions
                </span>
                <p className="text-xs text-zinc-400">
                  Access complete multi-visit maintenance and coating history.
                </p>
                <Link
                  href={`/employee/vehicles/${vehicle.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-[#242330] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#2c2b3a] transition-colors"
                >
                  <Car size={16} />
                  <span>View Permanent Vehicle History</span>
                </Link>
              </div>
            </div>
          </PanelCard>
        )}

        {/* TAB 4: INSPECTION & DAMAGE MATRIX */}
        {activeTab === 'INSPECTION' && (
          <div className="space-y-8">
            <PanelCard
              title="Pre-Existing Body Damage Matrix"
              subtitle="Documented scratch, dent, and paint chip records taken at check-in"
            >
              <DamageDiagram
                damages={job.checkIn.preExistingDamages}
                readOnly={true}
              />
            </PanelCard>

            <PanelCard
              title="Physical Inspection Findings"
              subtitle="Technician observations, paint depth measurements, and recommended corrective work"
            >
              <div className="divide-y divide-white/[0.08] text-xs sm:text-sm">
                {job.inspectionFindings.map((f) => (
                  <div
                    key={f.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-heading font-bold text-white uppercase text-base">
                          {f.area}
                        </span>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 text-[10px] font-bold uppercase rounded border',
                            f.priority === 'URGENT'
                              ? 'bg-red-950/50 text-red-400 border-red-500/40'
                              : 'bg-blue-950/50 text-blue-400 border-blue-500/40'
                          )}
                        >
                          {f.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-zinc-300">{f.observation}</p>
                    </div>

                    {f.estimatedPrice > 0 && (
                      <div className="font-mono text-base font-bold text-[#ea0a0b]">
                        ₹{f.estimatedPrice.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PanelCard>
          </div>
        )}

        {/* TAB 5: SERVICES */}
        {activeTab === 'SERVICES' && (
          <PanelCard
            title="Service Package Line Items"
            subtitle="Itemized detailing services, labor hours, and technician assignment"
            action={
              <button
                type="button"
                onClick={() => setAddServiceModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition-colors shadow-md shadow-red-950/40"
              >
                <Plus size={15} />
                <span>Add Service Line</span>
              </button>
            }
          >
            <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                    <th className="px-5 py-3.5">Service Title</th>
                    <th className="px-5 py-3.5">Unit Price</th>
                    <th className="px-5 py-3.5">Qty</th>
                    <th className="px-5 py-3.5">Discount</th>
                    <th className="px-5 py-3.5">Tax</th>
                    <th className="px-5 py-3.5 text-right">Total Amount</th>
                    <th className="px-5 py-3.5">Assigned Tech</th>
                    <th className="px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {job.services.map((srv) => {
                    const tech = store.employees.find(
                      (e) => e.id === srv.assignedTechnicianId
                    )
                    return (
                      <tr key={srv.id} className="hover:bg-[#232230] transition-colors">
                        <td className="px-5 py-4 font-semibold text-white">
                          {srv.title}
                          {srv.notes && (
                            <div className="text-xs text-[#9e9ea6] font-normal mt-0.5">
                              {srv.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-zinc-300">
                          ₹{srv.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 text-zinc-200">{srv.quantity}</td>
                        <td className="px-5 py-4 text-emerald-400 font-mono">
                          -₹{(srv.discount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 text-zinc-400">{srv.taxRate}%</td>
                        <td className="px-5 py-4 font-mono font-bold text-[#ea0a0b] text-right">
                          ₹{srv.totalPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 text-zinc-300">
                          {tech?.fullName?.split(' ')[0] || 'Assigned'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span
                            className={cn(
                              'px-2.5 py-1 text-[10px] font-bold uppercase rounded border',
                              srv.status === 'COMPLETED'
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-950/40 text-amber-400 border-amber-500/30'
                            )}
                          >
                            {srv.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="mt-8 flex flex-col items-end border-t border-white/10 pt-5 text-xs sm:text-sm space-y-2">
              <div className="flex w-72 justify-between text-zinc-400">
                <span>Discount Total:</span>
                <span className="font-mono text-emerald-400">
                  -₹{job.totalDiscount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex w-72 justify-between text-zinc-400">
                <span>GST (18%):</span>
                <span className="font-mono text-white">
                  ₹{job.taxAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex w-72 justify-between border-t border-white/15 pt-3 text-base font-bold text-white">
                <span>FINAL INVOICE COST:</span>
                <span className="font-mono text-[#ea0a0b] text-xl">
                  ₹{job.actualFinalCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </PanelCard>
        )}

        {/* TAB 6: ESTIMATE & APPROVAL */}
        {activeTab === 'ESTIMATE' && (
          <PanelCard
            title="Customer Estimate & Formal Approval Audit"
            subtitle="Track digital estimate transmission and customer sign-off timestamps"
            action={
              <button
                type="button"
                onClick={() => setApprovalModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition-colors shadow-md shadow-red-950/40"
              >
                <CheckCircle2 size={15} />
                <span>Update Approval State</span>
              </button>
            }
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-6 text-xs sm:text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  Approval Status
                </span>
                <div className="flex items-center gap-3">
                  <ApprovalBadge status={job.approvalStatus} />
                  {job.approvalDate && (
                    <span className="text-zinc-400 text-xs">
                      on {new Date(job.approvalDate).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {job.approvalNotes && (
                  <div className="mt-2 text-zinc-300 bg-[#242330] p-4 rounded-xl border border-white/10 leading-relaxed">
                    &quot;{job.approvalNotes}&quot;
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-xl border border-white/[0.14] bg-[#1d1c26] p-6 text-xs sm:text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  Cost Distinction
                </span>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Estimated Cost:</span>
                    <span className="font-mono text-white">
                      ₹{job.estimatedCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Approved Cost:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ₹{job.approvedCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3 font-bold text-base">
                    <span className="text-white">Actual Final Invoiced:</span>
                    <span className="font-mono text-[#ea0a0b] text-lg">
                      ₹{job.actualFinalCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </PanelCard>
        )}

        {/* TAB 7: WORK PROGRESS */}
        {activeTab === 'PROGRESS' && (
          <PanelCard
            title="Technician Workflow & Quality Milestones"
            subtitle="Step-by-step detailing progress and quality checkpoint approvals"
          >
            <div className="space-y-3.5 text-xs sm:text-sm">
              {[
                { title: 'Decontamination & Iron Fallout Wash', done: true, tech: 'Rajesh Sharma' },
                { title: 'Paint Depth Thickness Gauging (135μm avg)', done: true, tech: 'Vikram Malhotra' },
                { title: 'Stage 1 Heavy Cut Rotary Compounding', done: true, tech: 'Rajesh Sharma' },
                { title: 'Stage 2 Dual-Action Jeweling Polish', done: true, tech: 'Rajesh Sharma' },
                { title: 'IPA Surface Wipe & Inspection Lamp Audit', done: true, tech: 'Vikram Malhotra' },
                {
                  title: 'Self-Healing PPF Application (Front End)',
                  done:
                    job.status === 'IN_PROGRESS' ||
                    job.status === 'QUALITY_CHECK' ||
                    job.status === 'READY_FOR_DELIVERY' ||
                    job.status === 'DELIVERED',
                  tech: 'Kabir Sengupta',
                },
                {
                  title: '9H Ceramic Base Coating Application',
                  done:
                    job.status === 'QUALITY_CHECK' ||
                    job.status === 'READY_FOR_DELIVERY' ||
                    job.status === 'DELIVERED',
                  tech: 'Rajesh Sharma',
                },
                {
                  title: 'Infrared (IR) Heat Lamp Curing (4 Hours)',
                  done:
                    job.status === 'QUALITY_CHECK' ||
                    job.status === 'READY_FOR_DELIVERY' ||
                    job.status === 'DELIVERED',
                  tech: 'Rajesh Sharma',
                },
                {
                  title: '48-Point Final Quality Check & Staging',
                  done: job.status === 'READY_FOR_DELIVERY' || job.status === 'DELIVERED',
                  tech: 'Vikram Malhotra',
                },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-4.5 transition-all',
                    m.done
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                      : 'border-white/[0.14] bg-[#1d1c26] text-zinc-400'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                        m.done ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'
                      )}
                    >
                      {m.done ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <span className={cn('font-semibold text-sm', m.done ? 'text-white' : 'text-zinc-300')}>
                      {m.title}
                    </span>
                  </div>
                  <span className="text-xs text-[#9e9ea6]">Tech: {m.tech}</span>
                </div>
              ))}
            </div>
          </PanelCard>
        )}

        {/* TAB 8: MATERIALS */}
        {activeTab === 'MATERIALS' && (
          <PanelCard
            title="Parts, Materials & Consumables Ledger"
            subtitle="Track products used during service (Internal cost separation)"
          >
            <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                    <th className="px-5 py-3.5">Product Name</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Quantity</th>
                    <th className="px-5 py-3.5">Internal Unit Cost</th>
                    <th className="px-5 py-3.5 pr-5 text-right">Internal Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  {job.materials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-[#232230] transition-colors">
                      <td className="px-5 py-4 font-semibold text-white">
                        {mat.productName}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">{mat.category}</td>
                      <td className="px-5 py-4 text-zinc-200">
                        {mat.quantity} {mat.unit}
                      </td>
                      <td className="px-5 py-4 font-mono text-zinc-300">
                        ₹{mat.unitCost.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4 pr-5 text-right font-mono font-bold text-white">
                        ₹{mat.totalCost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {job.materials.length === 0 && (
                <div className="py-12 text-center text-sm text-[#9e9ea6]">
                  No consumable materials logged for this job yet.
                </div>
              )}
            </div>
          </PanelCard>
        )}

        {/* TAB 9: PHOTOS */}
        {activeTab === 'PHOTOS' && (
          <PanelCard
            title="Vehicle Photo Documentation"
            subtitle="High-resolution Before, During, and After service condition photos"
            action={
              <button
                type="button"
                onClick={() => setAddPhotoModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition-colors shadow-md shadow-red-950/40"
              >
                <Camera size={15} />
                <span>Upload Photo</span>
              </button>
            }
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {job.photos.map((p) => (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-white/[0.14] bg-[#16151c]"
                >
                  <div className="relative h-52 w-full bg-zinc-900">
                    <img
                      src={p.url}
                      alt={p.caption}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded-md bg-black/85 px-2.5 py-1 text-[11px] font-bold uppercase text-white backdrop-blur">
                      {p.stage}
                    </span>
                  </div>
                  <div className="p-4 text-xs sm:text-sm">
                    <div className="font-semibold text-white">{p.caption}</div>
                    <div className="mt-2 flex items-center justify-between text-xs text-[#9e9ea6]">
                      <span>{p.panel || 'Bodywork'}</span>
                      <span>
                        {new Date(p.uploadedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {job.photos.length === 0 && (
              <div className="py-16 text-center text-sm text-[#9e9ea6]">
                No photos uploaded yet. Click &quot;Upload Photo&quot; to document condition.
              </div>
            )}
          </PanelCard>
        )}

        {/* TAB 10: PAYMENTS */}
        {activeTab === 'PAYMENTS' && (
          <PanelCard
            title="Payment Ledger & Receipts"
            subtitle="Transaction records, advance deposits, and settlement status"
            action={
              <button
                type="button"
                onClick={() => setPaymentModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 transition-colors shadow-md shadow-red-950/40"
              >
                <Plus size={15} />
                <span>Record New Payment</span>
              </button>
            }
          >
            <div className="space-y-6">
              {/* Financial Balance Strip */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl border border-white/[0.14] bg-[#16151c] p-5 text-xs sm:text-sm">
                <div>
                  <span className="text-[#9e9ea6] uppercase text-[11px] font-bold">Total Billable:</span>
                  <div className="font-mono text-xl font-bold text-white mt-1">
                    ₹{job.actualFinalCost.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[#9e9ea6] uppercase text-[11px] font-bold">Total Paid to Date:</span>
                  <div className="font-mono text-xl font-bold text-emerald-400 mt-1">
                    ₹{job.amountPaid.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[#9e9ea6] uppercase text-[11px] font-bold">Outstanding Balance:</span>
                  <div className="font-mono text-xl font-bold text-[#ea0a0b] mt-1">
                    ₹{job.balanceDue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                      <th className="px-5 py-3.5">Date & Time</th>
                      <th className="px-5 py-3.5 text-right">Amount</th>
                      <th className="px-5 py-3.5">Payment Method</th>
                      <th className="px-5 py-3.5">Transaction Reference</th>
                      <th className="px-5 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08]">
                    {job.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#232230] transition-colors">
                        <td className="px-5 py-4 text-zinc-300">
                          {new Date(p.paymentDate).toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-white text-base text-right">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 text-zinc-300 font-semibold">{p.paymentMethod}</td>
                        <td className="px-5 py-4 font-mono text-zinc-400">
                          {p.transactionRef}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-bold uppercase text-emerald-400">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {job.payments.length === 0 && (
                  <div className="py-12 text-center text-sm text-[#9e9ea6]">
                    No payments recorded yet.
                  </div>
                )}
              </div>
            </div>
          </PanelCard>
        )}

        {/* TAB 11: TIMELINE & AUDIT TRAIL */}
        {activeTab === 'TIMELINE' && (
          <PanelCard
            title="Permanent Service History & Audit Trail"
            subtitle="Immutable log of all job actions, employee actors, and timestamped events"
          >
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {job.timeline.map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute -left-6 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ea0a0b] ring-4 ring-[#16151c]" />
                  <div className="rounded-xl border border-white/[0.14] bg-[#1d1c26] p-5 text-xs sm:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-white uppercase text-base">
                        {event.action}
                      </span>
                      <span className="text-xs text-[#9e9ea6]">
                        {new Date(event.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="mt-2 text-zinc-300 leading-relaxed">{event.description}</p>
                    <div className="mt-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Staff Actor: <strong className="text-zinc-200">{event.employeeName}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        )}

        {/* MODAL: UPDATE STATUS */}
        {statusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1a1922] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h4 className="font-heading text-xl font-bold uppercase text-white">
                  Update Service Status
                </h4>
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    New Job Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as JobStatus)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  >
                    <option value="CHECKED_IN">CHECKED_IN</option>
                    <option value="INSPECTION">INSPECTION</option>
                    <option value="ESTIMATE_PENDING">ESTIMATE_PENDING</option>
                    <option value="AWAITING_APPROVAL">AWAITING_APPROVAL</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="QUALITY_CHECK">QUALITY_CHECK</option>
                    <option value="READY_FOR_DELIVERY">READY_FOR_DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Audit Note / Description
                  </label>
                  <textarea
                    rows={4}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Provide context for status transition..."
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setStatusModalOpen(false)}
                    className="rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/40"
                  >
                    Save Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RECORD PAYMENT */}
        {paymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1a1922] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-heading text-xl font-bold uppercase text-white">
                    Record Customer Payment
                  </h4>
                  <p className="text-xs text-[#9e9ea6] mt-0.5">
                    Outstanding Balance: ₹{job.balanceDue.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Payment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder={`Max ₹${job.balanceDue}`}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CREDIT_CARD">Credit Card (POS)</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer / NEFT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Transaction Reference # / Receipt ID
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g. UPI/2026/88921"
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/40"
                  >
                    Save & Generate Receipt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD PHOTO */}
        {addPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1a1922] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h4 className="font-heading text-xl font-bold uppercase text-white">
                  Document Service Photo
                </h4>
                <button
                  type="button"
                  onClick={() => setAddPhotoModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddPhoto} className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Stage
                  </label>
                  <select
                    value={photoStage}
                    onChange={(e) => setPhotoStage(e.target.value as PhotoStage)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  >
                    <option value="BEFORE">BEFORE (Check-In Intake)</option>
                    <option value="DURING">DURING (Technician Work In Progress)</option>
                    <option value="AFTER">AFTER (Final Quality Polish)</option>
                    <option value="DELIVERY">DELIVERY (Customer Handover)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Photo Caption & Panel Description
                  </label>
                  <input
                    type="text"
                    required
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="e.g. 9H Ceramic coating cured under IR heat lamp"
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddPhotoModalOpen(false)}
                    className="rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/40"
                  >
                    Save Photo Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: VEHICLE DELIVERY HANDOVER */}
        {deliveryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1a1922] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-heading text-xl font-bold uppercase text-white">
                    Final Vehicle Handover & Sign-Off
                  </h4>
                  <p className="text-xs text-[#9e9ea6] mt-0.5">
                    Complete quality check and delivery confirmation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeliveryModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCompleteDelivery} className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Received By (Customer / Driver Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryReceiver || customer?.fullName || ''}
                    onChange={(e) => setDeliveryReceiver(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Customer Satisfaction Score (1-5 Stars)
                  </label>
                  <div className="mt-2 flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setDeliveryRating(s)}
                        className={cn(
                          'flex-1 rounded-xl border py-3 text-sm font-bold transition-all',
                          deliveryRating === s
                            ? 'border-[#ea0a0b] bg-[#ea0a0b] text-white shadow-lg shadow-red-950/40'
                            : 'border-white/20 bg-[#1d1c26] text-zinc-300 hover:border-white/40'
                        )}
                      >
                        {s} ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Customer Feedback Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={deliveryRemarks}
                    onChange={(e) => setDeliveryRemarks(e.target.value)}
                    placeholder="Customer delighted with paint clarity and zero swirl finish..."
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#ea0a0b] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryModalOpen(false)}
                    className="rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/40"
                  >
                    Confirm Delivery & Close Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD SERVICE LINE */}
        {addServiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1a1922] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h4 className="font-heading text-xl font-bold uppercase text-white">
                  Add Service Line Item
                </h4>
                <button
                  type="button"
                  onClick={() => setAddServiceModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddService} className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Select From Service Catalog
                  </label>
                  <select
                    required
                    value={newServiceId}
                    onChange={(e) => {
                      setNewServiceId(e.target.value)
                      const item = store.services.find((s) => s.id === e.target.value)
                      if (item) setNewServicePrice(item.basePrice)
                    }}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                  >
                    <option value="">Choose service...</option>
                    {store.services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.title} (₹{srv.basePrice.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newServicePrice || ''}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-3 text-sm text-white focus:border-[#ea0a0b] focus:outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddServiceModalOpen(false)}
                    className="rounded-xl border border-white/20 bg-[#242330] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-[#2c2b3a] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newServiceId}
                    className="rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-950/40"
                  >
                    Add Line Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkshopShell>
  )
}
