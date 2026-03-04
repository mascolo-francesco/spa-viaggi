'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { TripDetail } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Users,
  FileText,
  Activity,
  DollarSign,
  Download,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDate, statusConfig } from '@/lib/trip-utils'
import { ParticipantsPanel } from '@/components/trips/ParticipantsPanel'
import { ActivitiesPanel } from '@/components/trips/ActivitiesPanel'
import { ExpensesPanel } from '@/components/trips/ExpensesPanel'
import { ExportPDFButton } from '@/components/trips/ExportPDFButton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type Tab = 'info' | 'participants' | 'activities' | 'expenses'

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'info', label: 'Info', icon: FileText },
  { id: 'participants', label: 'Partecipanti', icon: Users },
  { id: 'activities', label: 'Attività', icon: Activity },
  { id: 'expenses', label: 'Spese', icon: DollarSign },
]

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTrip = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.getTrip(id)
      setTrip(data)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore nel caricamento')
      router.replace('/trips')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchTrip()
  }, [fetchTrip])

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await api.deleteTrip(id)
      toast.success('Viaggio eliminato')
      router.replace('/trips')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore eliminazione')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!trip) return null

  const cfg = statusConfig[trip.status]
  const StatusIcon = cfg.icon
  const destinationStr = [trip.destination?.city, trip.destination?.country]
    .filter(Boolean).join(', ') || null

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        href="/trips"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Tutti i viaggi
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-3 mb-2">
            <Badge
              variant="secondary"
              className={cn('text-xs font-medium px-2 py-0.5 rounded-full border gap-1', cfg.className)}
            >
              <StatusIcon className="w-3 h-3" strokeWidth={2} />
              {cfg.label}
            </Badge>
          </div>
          <h1 className="font-display text-3xl font-light text-foreground tracking-wide leading-tight">
            {trip.title}
          </h1>
          {destinationStr && (
            <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary/70" strokeWidth={1.5} />
              <span className="text-sm">{destinationStr}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Export PDF — Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Esporta PDF</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  Esporta PDF
                </SheetTitle>
              </SheetHeader>
              <ExportPDFButton tripId={id} tripTitle={trip.title} />
            </SheetContent>
          </Sheet>

          <Link href={`/trips/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2 h-8">
              <Edit className="w-3.5 h-3.5" />
              Modifica
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Elimina</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Eliminare questo viaggio?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione è irreversibile. Verranno eliminati anche tutti i partecipanti,
                  le attività e le spese associate.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Elimina definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {tabs.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={cn(
              'flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === tabId
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'info' && <InfoTab trip={trip} />}
        {activeTab === 'participants' && <ParticipantsPanel tripId={id} />}
        {activeTab === 'activities' && <ActivitiesPanel tripId={id} />}
        {activeTab === 'expenses' && <ExpensesPanel tripId={id} />}
      </div>
    </div>
  )
}

function InfoTab({ trip }: { trip: TripDetail }) {
  const dateStr = formatDate(trip.start_date, trip.end_date)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-4">
        {trip.description && (
          <InfoBlock label="Descrizione">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {trip.description}
            </p>
          </InfoBlock>
        )}

        <InfoBlock label="Date">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3.5 h-3.5 text-primary/70" strokeWidth={1.5} />
            <span>{dateStr}</span>
          </div>
        </InfoBlock>

        {trip.destination && (
          <InfoBlock label="Destinazione">
            <div className="space-y-1 text-sm">
              {trip.destination.city && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-16 shrink-0">Città</span>
                  <span>{trip.destination.city}</span>
                </div>
              )}
              {trip.destination.country && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-16 shrink-0">Paese</span>
                  <span>{trip.destination.country}</span>
                </div>
              )}
              {trip.destination.address && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-16 shrink-0">Indirizzo</span>
                  <span>{trip.destination.address}</span>
                </div>
              )}
            </div>
          </InfoBlock>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {trip.location && (
          <InfoBlock label="Posizione">
            <a
              href={`https://www.openstreetmap.org/?mlat=${trip.location.lat}&mlon=${trip.location.lon}&zoom=12`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              Apri su mappa
              <ExternalLink className="w-3 h-3" />
            </a>
          </InfoBlock>
        )}

        <InfoBlock label="Partecipanti">
          <p className="text-sm">
            {trip.participants.length > 0
              ? `${trip.participants.length} partecipant${trip.participants.length !== 1 ? 'i' : 'e'}`
              : 'Nessun partecipante'}
          </p>
        </InfoBlock>

        <InfoBlock label="Informazioni">
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <span className="w-24 shrink-0">Creato il</span>
              <span>{new Date(trip.created_at).toLocaleString('it-IT')}</span>
            </div>
            {trip.updated_at && (
              <div className="flex gap-2">
                <span className="w-24 shrink-0">Modificato il</span>
                <span>{new Date(trip.updated_at).toLocaleString('it-IT')}</span>
              </div>
            )}
          </div>
        </InfoBlock>
      </div>
    </div>
  )
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {label}
      </h4>
      {children}
    </div>
  )
}
