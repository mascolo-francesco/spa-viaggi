'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { MapMarker, TripStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Loader2, MapPin, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'
import { statusConfig } from '@/lib/trip-utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function MapPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<TripStatus | 'all'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null)

  const fetchMarkers = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.getMapMarkers({
        status: filterStatus === 'all' ? undefined : filterStatus,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      })
      setMarkers(data)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore caricamento mappa')
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus, fromDate, toDate])

  useEffect(() => {
    fetchMarkers()
  }, [fetchMarkers])

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return
    if (leafletMapRef.current) return // Already initialized

    let mounted = true
    let L: typeof import('leaflet') | null = null

    async function initMap() {
      try {
        L = (await import('leaflet')).default

        if (!mounted || !mapRef.current) return

        // Distruggi istanza residua se il container è già stato inizializzato
        // (può succedere con React StrictMode che monta/smonta/rimonta)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((mapRef.current as any)._leaflet_id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(mapRef.current as any)._leaflet_id = null
        }

        const map = L.map(mapRef.current).setView([41.9, 12.5], 5)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          className: 'leaflet-dark-tiles',
        }).addTo(map)

        leafletMapRef.current = { map, L, markers: [] }
      } catch (err) {
        console.error('Leaflet init error:', err)
      }
    }

    initMap()

    return () => {
      mounted = false
      if (leafletMapRef.current?.map) {
        leafletMapRef.current.map.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  // Update markers when data changes
  useEffect(() => {
    const mapCtx = leafletMapRef.current
    if (!mapCtx || !mapCtx.L || !mapCtx.map) return

    const { map, L } = mapCtx

    // Remove old markers
    mapCtx.markers.forEach((m: { remove: () => void }) => m.remove())
    mapCtx.markers = []

    markers.forEach((marker) => {
      const color = marker.marker_color === 'green' ? '#22C55E' : '#EF4444'
      const statusLabel = statusConfig[marker.status]?.label || marker.status

      const icon = L.divIcon({
        html: `<div style="
          width: 36px;
          height: 36px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid rgba(255,255,255,0.3);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        "></div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
      })

      const destinationStr = [
        marker.destination?.city,
        marker.destination?.country,
      ].filter(Boolean).join(', ')

      const popup = L.popup({
        className: 'trip-popup',
        maxWidth: 220,
      }).setContent(`
        <div style="font-family: system-ui, sans-serif; padding: 4px;">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">${marker.title}</div>
          ${destinationStr ? `<div style="font-size: 11px; opacity: 0.6; margin-bottom: 4px;">📍 ${destinationStr}</div>` : ''}
          <div style="font-size: 11px; color: ${color};">● ${statusLabel}</div>
          <a href="/trips/${marker.trip_id}" style="display: inline-block; margin-top: 8px; font-size: 11px; color: ${color}; text-decoration: none; border: 1px solid ${color}55; padding: 3px 8px; border-radius: 4px;">
            Vedi dettaglio →
          </a>
        </div>
      `)

      const leafletMarker = L.marker([marker.lat, marker.lon], { icon })
        .addTo(map)
        .bindPopup(popup)

      mapCtx.markers.push(leafletMarker)
    })

    // Fit bounds if we have markers
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lon]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
    }
  }, [markers])

  function clearFilters() {
    setFilterStatus('all')
    setFromDate('')
    setToDate('')
  }

  const hasFilters = filterStatus !== 'all' || fromDate || toDate

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-2xl font-light text-foreground tracking-wide">
              Mappa dei viaggi
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? 'Caricamento…' : `${markers.length} viaggi con coordinate`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMarkers}
            disabled={isLoading}
            className="gap-2 h-8"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Aggiorna
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as TripStatus | 'all')}
          >
            <SelectTrigger className="h-8 bg-muted/40 border-border focus:ring-1 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli stati</SelectItem>
              <SelectItem value="planned">Pianificati</SelectItem>
              <SelectItem value="completed">Completati</SelectItem>
              <SelectItem value="cancelled">Cancellati</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground shrink-0">Dal</span>
            <Input
              type="date"
              aria-label="Dal"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-8 bg-muted/40 border-border focus-visible:ring-1 text-xs w-32"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground shrink-0">Al</span>
            <Input
              type="date"
              aria-label="Al"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-8 bg-muted/40 border-border focus-visible:ring-1 text-xs w-32"
            />
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <X className="w-3 h-3" />
              Rimuovi filtri
            </Button>
          )}
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ background: 'var(--background)' }}
        />

        {/* No markers with GPS */}
        {!isLoading && markers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-card border border-border rounded-2xl p-6 text-center max-w-xs pointer-events-auto">
              <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" strokeWidth={1} />
              <h3 className="text-sm font-medium text-foreground mb-1">Nessun marker</h3>
              <p className="text-xs text-muted-foreground mb-4">
                I viaggi devono avere le coordinate GPS per apparire sulla mappa.
                Modifica un viaggio e aggiungi latitudine e longitudine.
              </p>
              <Link href="/trips">
                <Button size="sm" variant="outline" className="gap-2">
                  Vai ai viaggi
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 pointer-events-none" style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 flex items-center gap-3">
            <LegendItem color="text-green-500" label="Pianificato" />
            <LegendItem color="text-red-500" label="Completato / Cancellato" />
          </div>
        </div>
      )}

      <style>{`
        .leaflet-popup-content-wrapper {
          background: var(--card) !important;
          border: 1px solid var(--border) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 12px 16px !important;
          color: var(--foreground) !important;
        }
        .leaflet-popup-tip {
          background: var(--card) !important;
        }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.85) !important;
          color: rgba(0,0,0,0.4) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: rgba(0,0,0,0.55) !important;
        }
        .leaflet-bar a {
          background-color: var(--card) !important;
          color: var(--foreground) !important;
          border-color: var(--border) !important;
        }
        .leaflet-bar a:hover {
          background-color: var(--accent) !important;
        }
      `}</style>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className={cn('w-2 h-2 rounded-full', color.replace('text-', 'bg-'))} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}
