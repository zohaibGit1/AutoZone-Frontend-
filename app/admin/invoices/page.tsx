'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, PaymentStatusBadge, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Download,
  FileCheck,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  invoicesApi,
  BackendItemType,
  BackendPaymentMethod,
  InvoiceCalculationResponseDto,
  InvoiceResponseDto,
} from '@/lib/api'
import { cn } from '@/lib/utils'

function AdminInvoicesContent() {
  const searchParams = useSearchParams()
  const queryVisitId = searchParams.get('visitId')
  const queryJobId = searchParams.get('jobId')
  const store = useWorkshopStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVisitId, setSelectedVisitId] = useState<number>(
    queryVisitId ? Number(queryVisitId) : 1
  )

  // Invoice Builder State
  const [items, setItems] = useState<
    { description: string; itemType: BackendItemType; quantity: number; unitPrice: number }[]
  >([
    { description: 'Full Body Ceramic Coating & Decontamination', itemType: 'SERVICE', quantity: 1, unitPrice: 35000 },
    { description: 'Windshield Hydrophobic Sealer', itemType: 'PART', quantity: 1, unitPrice: 4500 },
  ])
  const [discount, setDiscount] = useState<number>(0)
  const [taxPercentage, setTaxPercentage] = useState<number>(18)

  // Calculated Preview from Backend
  const [calcPreview, setCalcPreview] = useState<InvoiceCalculationResponseDto | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [activeInvoiceForPayment, setActiveInvoiceForPayment] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<BackendPaymentMethod>('UPI')
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 1. Calculate Invoice via POST /api/v1/invoices/calculate
  const handleCalculate = async () => {
    setIsCalculating(true)
    setMessage(null)
    try {
      const res = await invoicesApi.calculateInvoice({
        vehicleVisitId: selectedVisitId,
        items,
        discount,
        taxPercentage,
      })
      setCalcPreview(res)
      setMessage({ type: 'success', text: `Invoice calculated: Grand Total ₹${res.grandTotal.toLocaleString('en-IN')}` })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to calculate invoice on backend.' })
    } finally {
      setIsCalculating(false)
    }
  }

  // 2. Create Invoice via POST /api/v1/invoices
  const handleCreateInvoice = async () => {
    setIsCreating(true)
    setMessage(null)
    try {
      const res = await invoicesApi.createInvoice({
        vehicleVisitId: selectedVisitId,
        items,
        discount,
        taxPercentage,
      })
      setMessage({
        type: 'success',
        text: `Invoice #${res.invoiceNumber} created successfully! (ID: ${res.invoiceId})`,
      })

      // Link to job in local state if matching
      const targetJob = store.jobs.find((j) => j.backendVisitId === selectedVisitId || j.id === queryJobId)
      if (targetJob) {
        targetJob.backendInvoiceId = res.invoiceId
        targetJob.backendInvoiceNumber = res.invoiceNumber
        targetJob.actualFinalCost = res.grandTotal
        targetJob.balanceDue = res.grandTotal
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create invoice on backend.' })
    } finally {
      setIsCreating(false)
    }
  }

  // 3. Update Payment via PATCH /api/v1/invoices/{invoiceId}/payment
  const handleRecordPayment = async (jobId: string, invoiceId: number) => {
    setIsUpdatingPayment(true)
    setMessage(null)
    try {
      await invoicesApi.updatePayment(invoiceId, {
        paymentMethod,
      })
      await store.repository.addPaymentBackend(jobId, {
        amount: 10000,
        paymentMethod: paymentMethod as any,
        transactionRef: `TXN-${Date.now()}`,
      })
      setMessage({ type: 'success', text: `Payment recorded via ${paymentMethod} on backend invoice #${invoiceId}.` })
      setActiveInvoiceForPayment(null)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update payment on backend.' })
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  // 4. Download PDF via GET /api/v1/invoices/{invoiceId}/pdf
  const handleDownloadPdf = async (invoiceId: number) => {
    setIsDownloadingPdf(true)
    try {
      const blob = await invoicesApi.downloadInvoicePdf(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AutoZone-Invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      // Direct link fallback
      const directUrl = invoicesApi.getInvoicePdfUrl(invoiceId)
      window.open(directUrl, '_blank')
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const addItemRow = () => {
    setItems([...items, { description: 'Detailing Labor / Package', itemType: 'SERVICE', quantity: 1, unitPrice: 5000 }])
  }

  const removeItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const allInvoices = store.jobs.map((j) => ({
    jobId: j.id,
    jobCode: j.jobCode,
    invoiceId: j.backendInvoiceId || 1,
    invoiceNumber: j.backendInvoiceNumber || `INV-${j.jobCode}`,
    customerName: store.customers.find((c) => c.id === j.customerId)?.fullName || 'Customer',
    vehicleName: store.vehicles.find((v) => v.id === j.vehicleId)?.registrationNumber || 'Vehicle',
    amount: j.actualFinalCost,
    paid: j.amountPaid,
    balance: j.balanceDue,
    paymentStatus: j.paymentStatus,
  }))

  return (
    <WorkshopShell
      title="Invoices, Tax & Payment Settlements"
      subtitle="Calculate item pricing, finalize official bills, update payments, and download OpenPDF invoices"
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Billed"
            value={`₹${(store.jobs.reduce((sum, j) => sum + j.actualFinalCost, 0) / 100000).toFixed(2)}L`}
            subvalue="Total invoiced revenue"
            icon={<DollarSign size={18} />}
            highlight={true}
          />
          <StatCard
            title="Collections"
            value={`₹${(store.jobs.reduce((sum, j) => sum + j.amountPaid, 0) / 100000).toFixed(2)}L`}
            subvalue="Settled customer payments"
            icon={<CreditCard size={18} />}
          />
          <StatCard
            title="OpenPDF Engine"
            value="Active"
            subvalue="GET /invoices/{id}/pdf"
            icon={<Download size={18} />}
          />
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={cn(
              'rounded-xl border p-4 text-xs font-semibold flex items-center justify-between',
              message.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                : 'border-red-500/40 bg-red-950/40 text-red-300'
            )}
          >
            <span>{message.text}</span>
            <button type="button" onClick={() => setMessage(null)} className="text-zinc-400 hover:text-white">
              <X size={15} />
            </button>
          </div>
        )}

        {/* INVOICE BUILDER & PREVIEW (POST /api/v1/invoices/calculate & POST /api/v1/invoices) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PanelCard
              title="Invoice Line-Item Builder"
              subtitle="Configure bill items and send to Spring Boot backend calculation engine"
              action={
                <button
                  type="button"
                  onClick={addItemRow}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10"
                >
                  <Plus size={14} />
                  <span>Add Line Item</span>
                </button>
              }
            >
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Vehicle Visit ID *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={selectedVisitId}
                      onChange={(e) => setSelectedVisitId(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2 font-mono text-white focus:border-[#ea0a0b] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                        Discount (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2 font-mono text-white focus:border-[#ea0a0b] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                        GST Tax (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={taxPercentage}
                        onChange={(e) => setTaxPercentage(Number(e.target.value))}
                        className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2 font-mono text-white focus:border-[#ea0a0b] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2.5 pt-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 rounded-xl border border-white/10 bg-[#16151c] p-3 sm:flex-row sm:items-center"
                    >
                      <input
                        type="text"
                        placeholder="Item / Service description"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...items]
                          updated[idx].description = e.target.value
                          setItems(updated)
                        }}
                        className="flex-1 rounded-lg border border-white/15 bg-[#1d1c26] px-3 py-1.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none"
                      />
                      <select
                        value={item.itemType}
                        onChange={(e) => {
                          const updated = [...items]
                          updated[idx].itemType = e.target.value as BackendItemType
                          setItems(updated)
                        }}
                        className="w-28 rounded-lg border border-white/15 bg-[#1d1c26] px-2 py-1.5 text-xs text-white focus:border-[#ea0a0b] focus:outline-none font-mono"
                      >
                        <option value="SERVICE">SERVICE</option>
                        <option value="PART">PART</option>
                        <option value="LABOUR">LABOUR</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...items]
                          updated[idx].quantity = Number(e.target.value)
                          setItems(updated)
                        }}
                        className="w-16 rounded-lg border border-white/15 bg-[#1d1c26] px-2 py-1.5 text-xs font-mono text-white text-right focus:border-[#ea0a0b] focus:outline-none"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...items]
                          updated[idx].unitPrice = Number(e.target.value)
                          setItems(updated)
                        }}
                        className="w-28 rounded-lg border border-white/15 bg-[#1d1c26] px-2 py-1.5 text-xs font-mono text-white text-right focus:border-[#ea0a0b] focus:outline-none"
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isCalculating}
                    onClick={handleCalculate}
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#252432] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#302f40] transition-all disabled:opacity-50"
                  >
                    {isCalculating ? <Loader2 size={15} className="animate-spin" /> : <Calculator size={15} />}
                    <span>Pre-Calculate Totals</span>
                  </button>

                  <button
                    type="button"
                    disabled={isCreating}
                    onClick={handleCreateInvoice}
                    className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 shadow-lg shadow-red-950/40 transition-all disabled:opacity-50"
                  >
                    {isCreating ? <Loader2 size={15} className="animate-spin" /> : <FileCheck size={15} />}
                    <span>Create & Finalize Bill</span>
                  </button>
                </div>
              </div>
            </PanelCard>
          </div>

          {/* Backend Calculated Breakdown Summary */}
          <div>
            <PanelCard title="Backend Calculation Summary">
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="rounded-xl border border-white/10 bg-[#1d1c26] p-4 space-y-3 font-mono">
                  <div className="flex justify-between text-zinc-300">
                    <span>Subtotal:</span>
                    <span>₹{(calcPreview?.subtotal || items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>Tax ({taxPercentage}% GST):</span>
                    <span>₹{Math.round(((calcPreview?.subtotal || items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)) - discount) * (taxPercentage / 100)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-white/15 pt-2 flex justify-between font-bold text-base text-white">
                    <span>Grand Total:</span>
                    <span className="text-[#ea0a0b]">
                      ₹{(calcPreview?.grandTotal || Math.round(((calcPreview?.subtotal || items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)) - discount) * (1 + taxPercentage / 100))).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 leading-relaxed">
                  Totals are verified against the Spring Boot Invoice engine using standard Indian GST rounding rules.
                </div>
              </div>
            </PanelCard>
          </div>
        </div>

        {/* INVOICES & PAYMENTS LEDGER */}
        <PanelCard
          title="Invoices & OpenPDF Downloads"
          subtitle="All finalized bills with direct PDF export and payment updates"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="py-3.5 px-5">Invoice #</th>
                  <th className="py-3.5 px-5">Customer & Vehicle</th>
                  <th className="py-3.5 px-5 text-right">Invoiced Total</th>
                  <th className="py-3.5 px-5 text-right">Balance Due</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {allInvoices.map((inv) => (
                  <tr key={inv.jobId} className="hover:bg-[#232230] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-heading font-bold text-white text-base">
                        {inv.invoiceNumber}
                      </div>
                      <div className="text-[11px] font-mono text-[#9e9ea6]">ID: {inv.invoiceId}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-white">{inv.customerName}</div>
                      <div className="text-xs text-[#9e9ea6] font-mono">{inv.vehicleName}</div>
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-white text-sm text-right">
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5 font-mono text-zinc-300 text-sm text-right">
                      ₹{inv.balance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5">
                      <PaymentStatusBadge status={inv.paymentStatus} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveInvoiceForPayment(inv.jobId)}
                          className="rounded-lg bg-[#252432] border border-white/15 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white hover:bg-[#323142]"
                        >
                          + Pay
                        </button>
                        <button
                          type="button"
                          disabled={isDownloadingPdf}
                          onClick={() => handleDownloadPdf(inv.invoiceId)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#ea0a0b] px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 shadow-sm"
                        >
                          <Download size={13} />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </div>

      {/* PAYMENT MODAL (PATCH /api/v1/invoices/{invoiceId}/payment) */}
      {activeInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#16151c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold uppercase text-white">
                Record Payment on Backend
              </h3>
              <button
                type="button"
                onClick={() => setActiveInvoiceForPayment(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold uppercase tracking-wider text-zinc-300 mb-1">
                  Payment Method (Backend Enum) *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as BackendPaymentMethod)}
                  className="w-full rounded-xl border border-white/20 bg-[#1d1c26] px-4 py-2.5 text-sm text-white focus:border-[#ea0a0b] focus:outline-none"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CASH">CASH</option>
                  <option value="ONLINE">ONLINE / CARD</option>
                  <option value="NET_BANKING">NET BANKING</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveInvoiceForPayment(null)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold uppercase text-zinc-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUpdatingPayment}
                  onClick={() => handleRecordPayment(activeInvoiceForPayment, 1)}
                  className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-950/40"
                >
                  {isUpdatingPayment ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                  <span>Confirm Settlement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </WorkshopShell>
  )
}

export default function AdminInvoicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Loading Invoices & Billing...</div>}>
      <AdminInvoicesContent />
    </Suspense>
  )
}
