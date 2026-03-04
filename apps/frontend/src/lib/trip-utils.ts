import { Clock, CheckCircle, XCircle, type LucideIcon } from 'lucide-react'
import { TripStatus } from '@/types'

export const statusConfig: Record<
  TripStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  planned: {
    label: 'Pianificato',
    icon: Clock,
    className: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  completed: {
    label: 'Completato',
    icon: CheckCircle,
    className: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  cancelled: {
    label: 'Cancellato',
    icon: XCircle,
    className: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
}

export function formatDate(start?: string | null, end?: string | null): string {
  if (!start && !end) return 'Date non specificate'

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit' })

  if (start && end) {
    const s = new Date(start)
    const e = new Date(end)
    if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
      return `${s.getDate()}–${fmt(end)}`
    }
    return `${fmt(start)} – ${fmt(end)}`
  }
  if (start) return `Dal ${fmt(start)}`
  if (end) return `Fino al ${fmt(end)}`
  return 'Date non specificate'
}

export function formatDatetime(dt?: string | null): string {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}
