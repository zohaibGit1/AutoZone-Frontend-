'use client'

import React from 'react'
import Link from 'next/link'
import { WorkshopShell } from '@/components/workshop/workshop-shell'
import { PanelCard, StatCard } from '@/components/workshop/ui-primitives'
import { useWorkshopStore } from '@/lib/workshop/workshop-store'
import { CheckCircle2, Mail, Phone, Plus, Shield, UserCheck, Users, Wrench } from 'lucide-react'

export default function AdminEmployeesPage() {
  const store = useWorkshopStore()

  return (
    <WorkshopShell
      title="Staff & Master Technicians Roster"
      subtitle="Employee designations, system permissions, detailing specializations, and active jobs"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Workshop Staff"
            value={store.employees.length}
            subvalue="active certified employees"
            icon={<Users size={18} />}
          />
          <StatCard
            title="Master Detailers & PPF"
            value={store.employees.filter((e) => e.role === 'TECHNICIAN').length}
            subvalue="specialized technicians"
            icon={<Wrench size={18} />}
          />
          <StatCard
            title="Service Advisors & Managers"
            value={
              store.employees.filter(
                (e) => e.role === 'ADMIN' || e.role === 'MANAGER' || e.role === 'EMPLOYEE'
              ).length
            }
            subvalue="customer & floor management"
            icon={<UserCheck size={18} />}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {store.employees.map((emp) => (
            <div
              key={emp.id}
              className="rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 sm:p-7 transition-all hover:border-white/30 hover:bg-[#1a1922] shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ea0a0b]/20 font-heading text-lg font-bold text-[#ea0a0b] border border-[#ea0a0b]/40">
                      {emp.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold uppercase text-white">
                        {emp.fullName}
                      </h3>
                      <span className="text-xs text-[#9e9ea6] font-medium">
                        {emp.designation}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg bg-[#252432] border border-white/15 px-2.5 py-1 font-mono text-[11px] font-bold text-[#ea0a0b]">
                    {emp.role}
                  </span>
                </div>

                <div className="mt-5 space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 text-zinc-200">
                    <Phone size={15} className="text-[#ea0a0b]" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <Mail size={15} className="text-[#ea0a0b]" />
                    <span>{emp.email}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase text-[#9e9ea6] block mb-2 tracking-wider">
                      Specializations & Certifications:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {emp.specialization.map((spec, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-[#201f28] border border-white/15 px-2.5 py-1 text-xs text-zinc-200"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xs sm:text-sm text-[#9e9ea6] font-medium">Current Workload:</span>
                <span className="font-bold text-white font-mono text-sm bg-[#252432] px-3 py-1 rounded-lg border border-white/15 shadow-sm">
                  {emp.activeJobCount} Active Orders
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkshopShell>
  )
}
