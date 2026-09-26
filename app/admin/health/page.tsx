'use client'

import React, { useEffect, useState } from 'react'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import {
  Activity,
  CheckCircle2,
  Database,
  Globe,
  RefreshCw,
  Server,
  ShieldCheck,
} from 'lucide-react'
import { API_BASE_URL, healthApi } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function AdminHealthPage() {
  const [healthStatus, setHealthStatus] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING')
  const [lastChecked, setLastChecked] = useState<string>('')
  const [isChecking, setIsChecking] = useState(false)

  const checkHealth = async () => {
    setIsChecking(true)
    try {
      const res = await healthApi.checkHealth()
      setHealthStatus(res.status === 'UP' ? 'UP' : 'DOWN')
    } catch {
      setHealthStatus('DOWN')
    } finally {
      setIsChecking(false)
      setLastChecked(new Date().toLocaleTimeString('en-IN'))
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const BACKEND_APIS = [
    {
      domain: 'Customer Management',
      method: 'POST',
      path: '/api/v1/customers/register-customer',
      description: 'Register customer profile with 10-digit Indian phone validation',
    },
    {
      domain: 'Customer Management',
      method: 'GET',
      path: '/api/v1/customers/history?search={search}',
      description: 'Search customer records, registered fleet, and visit history',
    },
    {
      domain: 'Customer Management',
      method: 'PATCH',
      path: '/api/v1/customers/update-customer/{id}',
      description: 'Update customer contact information and records',
    },
    {
      domain: 'Vehicle Registry',
      method: 'POST',
      path: '/api/v1/vehicle/register-vehicle',
      description: 'Register vehicle under an existing registered customer',
    },
    {
      domain: 'Vehicle Visits / Intake',
      method: 'POST',
      path: '/api/v1/vehicle-visit',
      description: 'Log vehicle check-in visit with current odometer reading',
    },
    {
      domain: 'Complaints',
      method: 'POST',
      path: '/api/v1/complaint/register/complaint',
      description: 'Record customer reported issues against a vehicle visit',
    },
    {
      domain: 'Invoicing & Tax',
      method: 'POST',
      path: '/api/v1/invoices/calculate',
      description: 'Calculate item pricing, discounts, 18% GST tax, and grand total',
    },
    {
      domain: 'Invoicing & Tax',
      method: 'POST',
      path: '/api/v1/invoices',
      description: 'Finalize and create bill linked to vehicle visit',
    },
    {
      domain: 'Invoicing & Tax',
      method: 'PATCH',
      path: '/api/v1/invoices/{id}/payment',
      description: 'Update payment status and method (Cash, UPI, Online, Net Banking)',
    },
    {
      domain: 'Invoicing & Tax',
      method: 'GET',
      path: '/api/v1/invoices/{id}/pdf',
      description: 'Generate and stream official OpenPDF invoice document',
    },
    {
      domain: 'System Actuator',
      method: 'GET',
      path: '/actuator/health',
      description: 'Spring Boot application liveness and readiness probe',
    },
  ]

  return (
    <WorkshopShell
      title="Backend Architecture & Service Health"
      subtitle="Live Spring Boot runtime status, REST API gateway, and verified endpoints"
      actions={
        <button
          type="button"
          onClick={checkHealth}
          disabled={isChecking}
          className="flex items-center gap-2 rounded-xl bg-[#ea0a0b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={15} className={cn(isChecking && 'animate-spin')} />
          <span>Refresh Health Probe</span>
        </button>
      }
    >
      <div className="space-y-8">
        {/* Top Status Metric Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Spring Boot Backend"
            value={healthStatus === 'UP' ? 'ONLINE (UP)' : 'OFFLINE (DOWN)'}
            subvalue={lastChecked ? `Last probe at ${lastChecked}` : 'Checking...'}
            icon={<Server size={18} />}
            highlight={healthStatus === 'UP'}
          />
          <StatCard
            title="API Base Gateway"
            value={API_BASE_URL.replace('http://', '')}
            subvalue="Configured in .env.local"
            icon={<Globe size={18} />}
          />
          <StatCard
            title="Verified Endpoints"
            value={BACKEND_APIS.length}
            subvalue="Active REST contracts"
            icon={<Activity size={18} />}
          />
        </div>

        {/* WORKFLOW RULE BANNER */}
        <div className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <ShieldCheck size={22} className="text-[#ea0a0b]" />
            <div>
              <h3 className="font-heading text-lg font-bold uppercase text-white">
                Strict Backend Workflow Hierarchy
              </h3>
              <p className="text-xs text-[#9e9ea6]">
                Every operation follows the authoritative Spring Boot relational model
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4 lg:grid-cols-7 text-center">
            {[
              { step: '01', title: 'Customer', desc: 'Must exist first' },
              { step: '02', title: 'Vehicle', desc: 'Linked to Customer' },
              { step: '03', title: 'Visit', desc: 'With Odometer' },
              { step: '04', title: 'Complaints', desc: 'Logged on Visit' },
              { step: '05', title: 'Calculate', desc: 'Pre-flight totals' },
              { step: '06', title: 'Invoice', desc: 'Finalized bill' },
              { step: '07', title: 'Payment/PDF', desc: 'Settlement & PDF' },
            ].map((st, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-[#1d1c26] p-4 text-center"
              >
                <span className="font-mono text-[10px] font-bold text-[#ea0a0b] uppercase tracking-widest block mb-1">
                  Step {st.step}
                </span>
                <span className="font-heading text-sm font-bold uppercase text-white block">
                  {st.title}
                </span>
                <span className="text-[11px] text-zinc-400 block mt-1">
                  {st.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* REST API CONTRACTS LEDGER */}
        <PanelCard
          title="Authoritative REST API Registry"
          subtitle="All backend endpoints consumed by the AutoZone Admin Panel"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.12] bg-[#1a1922]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#1e1d28] border-b border-white/[0.12] text-[11px] font-bold uppercase tracking-wider text-[#9e9ea6]">
                  <th className="py-3.5 px-5">Domain</th>
                  <th className="py-3.5 px-5">HTTP Method</th>
                  <th className="py-3.5 px-5">Endpoint Route</th>
                  <th className="py-3.5 px-5">Function & Request Contract</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {BACKEND_APIS.map((api, idx) => (
                  <tr key={idx} className="hover:bg-[#232230] transition-colors">
                    <td className="py-4 px-5 font-semibold text-white">{api.domain}</td>
                    <td className="py-4 px-5">
                      <span
                        className={cn(
                          'rounded-md px-2 py-0.5 font-mono text-[11px] font-bold uppercase',
                          api.method === 'POST' && 'bg-blue-950/80 text-blue-400 border border-blue-500/30',
                          api.method === 'GET' && 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
                          api.method === 'PATCH' && 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                        )}
                      >
                        {api.method}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-zinc-300 font-semibold">{api.path}</td>
                    <td className="py-4 px-5 text-zinc-300">{api.description}</td>
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
