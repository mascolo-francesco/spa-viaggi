import { TripStatus } from '@/types'

export const statusConfig: Record<
  TripStatus,
  { label: string; dot: string; className: string }
> = {
  planned: {
    label: 'Pianificato',
    dot: '◆',
    className: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  completed: {
    label: 'Completato',
    dot: '●',
    className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  cancelled: {
    label: 'Cancellato',
    dot: '✕',
    className: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
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
