'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { TripDetail } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const schema = z
  .object({
    title: z.string().min(3, 'Il titolo deve avere almeno 3 caratteri'),
    description: z.string().optional(),
    status: z.enum(['planned', 'completed', 'cancelled']),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    destination_city: z.string().optional(),
    destination_country: z.string().optional(),
    destination_address: z.string().optional(),
    lat: z.string().optional(),
    lon: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.start_date && values.end_date && values.end_date < values.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end_date'],
        message: 'La data di fine deve essere successiva o uguale alla data di inizio',
      })
    }

    const latRaw = values.lat?.trim() || ''
    const lonRaw = values.lon?.trim() || ''
    const latProvided = latRaw.length > 0
    const lonProvided = lonRaw.length > 0

    if (latProvided !== lonProvided) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lat'],
        message: 'Inserisci sia latitudine che longitudine',
      })
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lon'],
        message: 'Inserisci sia latitudine che longitudine',
      })
      return
    }

    if (latProvided && lonProvided) {
      const lat = Number(latRaw)
      const lon = Number(lonRaw)

      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lat'],
          message: 'Latitudine non valida (range: -90..90)',
        })
      }
      if (Number.isNaN(lon) || lon < -180 || lon > 180) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['lon'],
          message: 'Longitudine non valida (range: -180..180)',
        })
      }
    }
  })

type FormValues = z.infer<typeof schema>

interface TripFormProps {
  mode: 'create' | 'edit'
  trip?: TripDetail
}

export default function TripForm({ mode, trip }: TripFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: trip?.title || '',
      description: trip?.description || '',
      status: trip?.status || 'planned',
      start_date: trip?.start_date || '',
      end_date: trip?.end_date || '',
      destination_city: trip?.destination?.city || '',
      destination_country: trip?.destination?.country || '',
      destination_address: trip?.destination?.address || '',
      lat: trip?.location?.lat?.toString() || '',
      lon: trip?.location?.lon?.toString() || '',
    },
  })

  const statusValue = watch('status')

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const lat = values.lat?.trim() ? Number(values.lat) : null
      const lon = values.lon?.trim() ? Number(values.lon) : null
      const payload = {
        title: values.title,
        description: values.description || null,
        status: values.status,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        destination:
          values.destination_city || values.destination_country || values.destination_address
            ? {
                city: values.destination_city || null,
                country: values.destination_country || null,
                address: values.destination_address || null,
              }
            : null,
        location: lat !== null && lon !== null ? { lat, lon } : null,
      }

      let result: TripDetail
      if (mode === 'create') {
        result = await api.createTrip(payload)
        toast.success('Viaggio creato con successo!')
      } else {
        result = await api.updateTrip(trip!.id, payload)
        toast.success('Viaggio aggiornato!')
      }
      router.push(`/trips/${result.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore nel salvataggio')
    } finally {
      setIsSubmitting(false)
    }
  }

  const backHref = mode === 'edit' ? `/trips/${trip?.id}` : '/trips'

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {mode === 'edit' ? 'Torna al viaggio' : 'Tutti i viaggi'}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-foreground tracking-wide">
          {mode === 'create' ? 'Nuovo viaggio' : 'Modifica viaggio'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === 'create'
            ? 'Inizia a pianificare la tua prossima avventura'
            : 'Aggiorna i dettagli del tuo viaggio'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormSection label="Informazioni principali">
          <div className="space-y-4">
            <FieldWrapper label="Titolo *" error={errors.title?.message}>
              <Input
                {...register('title')}
                placeholder="Es. Weekend a Barcellona"
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </FieldWrapper>

            <FieldWrapper label="Descrizione">
              <Textarea
                {...register('description')}
                placeholder="Aggiungi una descrizione per il viaggio…"
                rows={3}
                className="bg-muted/40 border-border focus-visible:ring-1 resize-none"
              />
            </FieldWrapper>

            <FieldWrapper label="Stato">
              <Select
                value={statusValue}
                onValueChange={(v) => setValue('status', v as 'planned' | 'completed' | 'cancelled')}
              >
                <SelectTrigger className="bg-muted/40 border-border focus:ring-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Pianificato</SelectItem>
                  <SelectItem value="completed">Completato</SelectItem>
                  <SelectItem value="cancelled">Cancellato</SelectItem>
                </SelectContent>
              </Select>
            </FieldWrapper>
          </div>
        </FormSection>

        {/* Dates */}
        <FormSection label="Date">
          <div className="grid grid-cols-2 gap-4">
            <FieldWrapper label="Data inizio">
              <Input
                type="date"
                {...register('start_date')}
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </FieldWrapper>
            <FieldWrapper label="Data fine" error={errors.end_date?.message}>
              <Input
                type="date"
                {...register('end_date')}
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </FieldWrapper>
          </div>
        </FormSection>

        {/* Destination */}
        <FormSection label="Destinazione">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FieldWrapper label="Città">
                <Input
                  {...register('destination_city')}
                  placeholder="Es. Barcellona"
                  className="bg-muted/40 border-border focus-visible:ring-1"
                />
              </FieldWrapper>
              <FieldWrapper label="Paese">
                <Input
                  {...register('destination_country')}
                  placeholder="Es. Spagna"
                  className="bg-muted/40 border-border focus-visible:ring-1"
                />
              </FieldWrapper>
            </div>
            <FieldWrapper label="Indirizzo">
              <Input
                {...register('destination_address')}
                placeholder="Indirizzo specifico (opzionale)"
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </FieldWrapper>
          </div>
        </FormSection>

        {/* GPS */}
        <FormSection label="Coordinate GPS (per la mappa)">
          <div className="grid grid-cols-2 gap-4">
            <FieldWrapper label="Latitudine" error={errors.lat?.message}>
              <Input
                {...register('lat')}
                placeholder="Es. 41.3851"
                type="number"
                step="any"
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </FieldWrapper>
            <FieldWrapper label="Longitudine" error={errors.lon?.message}>
              <Input
                {...register('lon')}
                placeholder="Es. 2.1734"
                type="number"
                step="any"
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </FieldWrapper>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Inserisci le coordinate per visualizzare il viaggio sulla mappa.
          </p>
        </FormSection>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={backHref}>
            <Button variant="outline" type="button">
              Annulla
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mode === 'create' ? 'Crea viaggio' : 'Salva modifiche'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        {label}
      </h3>
      {children}
    </div>
  )
}

function FieldWrapper({
  label,
  children,
  error,
}: {
  label: string
  children: React.ReactNode
  error?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-foreground/80">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
