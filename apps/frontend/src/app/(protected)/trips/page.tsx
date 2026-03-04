'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { TripListItem, TripsFilter } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  Plane,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate, statusConfig } from '@/lib/trip-utils'

const LIMIT = 12

export default function TripsPage() {
  const [trips, setTrips] = useState<TripListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [filters, setFilters] = useState<TripsFilter>({
    status: undefined,
    destination: '',
    from_date: '',
    to_date: '',
  })

  const fetchTrips = useCallback(async (f: TripsFilter, p: number) => {
    setIsLoading(true)
    try {
      const res = await api.getTrips({ ...f, page: p, limit: LIMIT })
      setTrips(res.items)
      setTotal(res.total)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore nel caricamento dei viaggi')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrips(filters, page)
  }, [filters, page, fetchTrips])

  function handleFilterChange(key: keyof TripsFilter, value: string | undefined) {
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  function clearFilters() {
    setPage(1)
    setFilters({ status: undefined, destination: '', from_date: '', to_date: '' })
  }

  const totalPages = Math.ceil(total / LIMIT)
  const hasActiveFilters = !!(filters.status || filters.destination || filters.from_date || filters.to_date)

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-foreground tracking-wide">
            I tuoi viaggi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total > 0 ? `${total} viaggio${total !== 1 ? 'i' : ''}` : 'Nessun viaggio ancora'}
          </p>
        </div>
        <Link href="/trips/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 rounded-lg">
            <Plus className="w-4 h-4" />
            Nuovo viaggio
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search destination */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Destinazione…"
              value={filters.destination || ''}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
              className="pl-9 h-9 bg-muted/40 border-border focus-visible:ring-1 text-sm"
            />
          </div>

          {/* Status */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(v) => handleFilterChange('status', v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="h-9 bg-muted/40 border-border focus:ring-1 text-sm">
              <SelectValue placeholder="Stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="planned">Pianificato</SelectItem>
              <SelectItem value="completed">Completato</SelectItem>
              <SelectItem value="cancelled">Cancellato</SelectItem>
            </SelectContent>
          </Select>

          {/* From date */}
          <Input
            type="date"
            placeholder="Da data"
            value={filters.from_date || ''}
            onChange={(e) => handleFilterChange('from_date', e.target.value)}
            className="h-9 bg-muted/40 border-border focus-visible:ring-1 text-sm"
          />

          {/* To date */}
          <Input
            type="date"
            placeholder="A data"
            value={filters.to_date || ''}
            onChange={(e) => handleFilterChange('to_date', e.target.value)}
            className="h-9 bg-muted/40 border-border focus-visible:ring-1 text-sm"
          />
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-7"
            >
              <X className="w-3 h-3" />
              Rimuovi filtri
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : trips.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Pagina {page} di {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Precedente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 gap-1"
                >
                  Successiva
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TripCard({ trip }: { trip: TripListItem }) {
  const cfg = statusConfig[trip.status]
  const destinationStr = [trip.destination?.city, trip.destination?.country]
    .filter(Boolean).join(', ') || 'Destinazione non specificata'

  return (
    <Link href={`/trips/${trip.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 h-full">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant="secondary"
            className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', cfg.className)}
          >
            <span className="mr-1.5">{cfg.dot}</span>
            {cfg.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(trip.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-medium text-foreground text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {trip.title}
        </h3>

        {/* Destination */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/60" strokeWidth={1.5} />
          <span className="truncate">{destinationStr}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(trip.start_date, trip.end_date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            <span>{trip.participants_count} partecipant{trip.participants_count !== 1 ? 'i' : 'e'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
        <Plane className="w-7 h-7 text-primary/60" strokeWidth={1.5} />
      </div>
      <h3 className="font-medium text-foreground mb-1">
        {hasFilters ? 'Nessun risultato trovato' : 'Nessun viaggio ancora'}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {hasFilters
          ? 'Prova a modificare i filtri di ricerca'
          : 'Crea il tuo primo viaggio per iniziare a pianificare'}
      </p>
      {!hasFilters && (
        <Link href="/trips/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            Crea il primo viaggio
          </Button>
        </Link>
      )}
    </div>
  )
}
