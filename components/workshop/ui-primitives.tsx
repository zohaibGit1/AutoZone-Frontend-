'use client'

import React from 'react'
import {
  ApprovalStatus,
  DamageSeverity,
  DamageType,
  JobPriority,
  JobStatus,
  PaymentStatus,
} from '@/lib/workshop/types'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Flame,
  ShieldAlert,
  Sparkles,
  Wrench,
} from 'lucide-react'

// Status Badge — High contrast, crisp borders & backgrounds
export function JobStatusBadge({
  status,
  className,
  size = 'md',
}: {
  status: JobStatus
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const configs: Record<
    JobStatus,
    { label: string; bg: string; text: string; border: string; icon?: React.ReactNode }
  > = {
    NEW: {
      label: 'New Intake',
      bg: 'bg-zinc-800/95',
      text: 'text-zinc-200',
      border: 'border-zinc-600/80',
    },
    CHECKED_IN: {
      label: 'Checked In',
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-500/60',
      icon: <Clock size={size === 'sm' ? 11 : 13} className="shrink-0" />,
    },
    INSPECTION: {
      label: 'Inspection In Progress',
      bg: 'bg-orange-950/70',
      text: 'text-orange-300',
      border: 'border-orange-500/60',
      icon: <AlertCircle size={size === 'sm' ? 11 : 13} className="shrink-0" />,
    },
    ESTIMATE_PENDING: {
      label: 'Estimate Pending',
      bg: 'bg-yellow-950/70',
      text: 'text-yellow-300',
      border: 'border-yellow-500/60',
    },
    AWAITING_APPROVAL: {
      label: 'Awaiting Customer Signoff',
      bg: 'bg-red-950/70',
      text: 'text-red-300',
      border: 'border-red-500/60',
      icon: <ShieldAlert size={size === 'sm' ? 11 : 13} className="shrink-0" />,
    },
    APPROVED: {
      label: 'Approved by Client',
      bg: 'bg-blue-950/70',
      text: 'text-blue-300',
      border: 'border-blue-500/60',
      icon: <CheckCircle2 size={size === 'sm' ? 11 : 13} className="shrink-0" />,
    },
    SCHEDULED: {
      label: 'Bay Scheduled',
      bg: 'bg-indigo-950/70',
      text: 'text-indigo-300',
      border: 'border-indigo-500/60',
    },
    IN_PROGRESS: {
      label: 'Work In Progress',
      bg: 'bg-cyan-950/70',
      text: 'text-cyan-300',
      border: 'border-cyan-500/60',
      icon: <Wrench size={size === 'sm' ? 11 : 13} className="shrink-0 animate-spin-slow" />,
    },
    QUALITY_CHECK: {
      label: 'Quality Check Stage',
      bg: 'bg-purple-950/70',
      text: 'text-purple-300',
      border: 'border-purple-500/60',
      icon: <Sparkles size={size === 'sm' ? 11 : 13} className="shrink-0" />,
    },
    READY_FOR_DELIVERY: {
      label: 'Ready For Delivery',
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-300',
      border: 'border-emerald-500/60',
      icon: <CheckCircle2 size={size === 'sm' ? 11 : 13} className="shrink-0" />,
    },
    DELIVERED: {
      label: 'Delivered to Client',
      bg: 'bg-teal-950/70',
      text: 'text-teal-300',
      border: 'border-teal-500/60',
    },
    COMPLETED: {
      label: 'Order Settled & Closed',
      bg: 'bg-zinc-800/95',
      text: 'text-zinc-200',
      border: 'border-zinc-600/80',
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-red-950/60',
      text: 'text-red-400',
      border: 'border-red-700/60',
    },
  }

  const cfg = configs[status] || configs.NEW

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border shrink-0',
        size === 'sm' && 'px-2.5 py-0.5 text-[10px]',
        size === 'md' && 'px-3 py-1 text-xs',
        size === 'lg' && 'px-3.5 py-1.5 text-sm',
        cfg.bg,
        cfg.text,
        cfg.border,
        className
      )}
    >
      {cfg.icon}
      <span>{cfg.label}</span>
    </span>
  )
}

// Priority Badge
export function PriorityBadge({ priority }: { priority: JobPriority }) {
  const map: Record<
    JobPriority,
    { label: string; bg: string; text: string; border: string; icon?: React.ReactNode }
  > = {
    LOW: {
      label: 'Low Priority',
      bg: 'bg-zinc-800/90',
      text: 'text-zinc-300',
      border: 'border-zinc-700',
    },
    NORMAL: {
      label: 'Normal',
      bg: 'bg-blue-950/60',
      text: 'text-blue-300',
      border: 'border-blue-500/50',
    },
    HIGH: {
      label: 'High Priority',
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-500/60',
    },
    URGENT: {
      label: 'Urgent / VIP',
      bg: 'bg-red-950/80',
      text: 'text-red-300',
      border: 'border-red-500/70',
      icon: <Flame size={13} className="shrink-0 text-[#ea0a0b]" />,
    },
  }
  const item = map[priority] || map.NORMAL
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border',
        item.bg,
        item.text,
        item.border
      )}
    >
      {item.icon}
      {item.label}
    </span>
  )
}

// Payment Status Badge
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; style: string }> = {
    UNPAID: { label: 'Unpaid Balance', style: 'bg-red-950/70 text-red-300 border-red-500/60' },
    PARTIALLY_PAID: {
      label: 'Partially Paid',
      style: 'bg-amber-950/70 text-amber-300 border-amber-500/60',
    },
    PAID: { label: 'Paid in Full', style: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60' },
    REFUNDED: { label: 'Refunded', style: 'bg-purple-950/70 text-purple-300 border-purple-500/60' },
  }
  const item = map[status] || map.UNPAID
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border',
        item.style
      )}
    >
      {item.label}
    </span>
  )
}

// Approval Badge
export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const map: Record<ApprovalStatus, { label: string; style: string }> = {
    DRAFT: { label: 'Draft Estimate', style: 'bg-zinc-800/90 text-zinc-300 border-zinc-700' },
    SENT: { label: 'Estimate Sent', style: 'bg-yellow-950/60 text-yellow-300 border-yellow-500/60' },
    AWAITING_APPROVAL: {
      label: 'Awaiting Customer Signoff',
      style: 'bg-amber-950/70 text-amber-300 border-amber-500/60',
    },
    APPROVED: { label: 'Approved by Client', style: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60' },
    PARTIALLY_APPROVED: {
      label: 'Partially Approved',
      style: 'bg-blue-950/70 text-blue-300 border-blue-500/60',
    },
    REJECTED: { label: 'Rejected', style: 'bg-red-950/70 text-red-300 border-red-500/60' },
  }
  const item = map[status] || map.DRAFT
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border',
        item.style
      )}
    >
      {item.label}
    </span>
  )
}

// Damage Severity Badge
export function DamageSeverityBadge({
  severity,
  damageType,
}: {
  severity: DamageSeverity
  damageType: DamageType
}) {
  const severityColors: Record<DamageSeverity, string> = {
    MINOR: 'bg-blue-950/70 text-blue-300 border-blue-500/60',
    MODERATE: 'bg-amber-950/70 text-amber-300 border-amber-500/60',
    SEVERE: 'bg-red-950/70 text-red-300 border-red-500/60',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-lg border',
        severityColors[severity] || severityColors.MINOR
      )}
    >
      <span className="font-bold">{damageType.replace(/_/g, ' ')}</span>
      <span className="opacity-50">•</span>
      <span className="font-mono">{severity}</span>
    </span>
  )
}

// Spacious, High-Contrast Stat Metric Card
export function StatCard({
  title,
  value,
  subvalue,
  icon,
  trend,
  className,
  highlight = false,
}: {
  title: string
  value: string | number
  subvalue?: string
  icon?: React.ReactNode
  trend?: { text: string; positive?: boolean }
  className?: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 sm:p-7 shadow-xl transition-all',
        highlight
          ? 'border-[#ea0a0b]/60 bg-gradient-to-br from-[#1f1a24] via-[#16151c] to-[#2a1218] shadow-red-950/30'
          : 'border-white/[0.14] bg-[#16151c] hover:border-white/30 hover:bg-[#1a1922]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9e9ea6]">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
              highlight
                ? 'border-[#ea0a0b]/50 bg-[#ea0a0b]/25 text-[#ea0a0b]'
                : 'border-white/15 bg-[#201f28] text-zinc-200'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {value}
        </div>
        {subvalue && (
          <div className="mt-1.5 text-xs text-[#9e9ea6] font-medium leading-normal">
            {subvalue}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 border-t border-white/10 pt-3 flex items-center gap-1.5 text-xs font-semibold">
          <span className={trend.positive ? 'text-emerald-400' : 'text-amber-400'}>
            {trend.text}
          </span>
        </div>
      )}
    </div>
  )
}

// High-Contrast Panel Card Container
export function PanelCard({
  title,
  subtitle,
  children,
  action,
  className,
}: {
  title?: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.14] bg-[#16151c] p-6 sm:p-7 shadow-xl',
        className
      )}
    >
      {(title || action) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            {title && (
              <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-[#9e9ea6] leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex flex-wrap items-center gap-3">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

// Empty State Helper
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#16151c] px-8 py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#201f28] text-[#9e9ea6] border border-white/15">
          {icon}
        </div>
      )}
      <h4 className="font-heading text-lg font-bold uppercase tracking-wide text-white">
        {title}
      </h4>
      {description && (
        <p className="mt-1.5 max-w-md text-xs text-[#9e9ea6] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
