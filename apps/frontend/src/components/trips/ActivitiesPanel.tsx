'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { Activity, ActivityCreateRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Trash2,
  Edit,
  Activity as ActivityIcon,
  Loader2,
  Clock,
  DollarSign,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDatetime, formatCurrency } from '@/lib/trip-utils'

interface ActivitiesPanelProps {
  tripId: string
}

const emptyForm: ActivityCreateRequest = {
  title: '',
  type: null,
  start_at: null,
  end_at: null,
  notes: null,
  cost_estimate: null,
}

export function ActivitiesPanel({ tripId }: ActivitiesPanelProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [formData, setFormData] = useState<ActivityCreateRequest>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.getActivities(tripId)
      setActivities(data)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore caricamento attività')
    } finally {
      setIsLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  function openCreate() {
    setEditingActivity(null)
    setFormData(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(activity: Activity) {
    setEditingActivity(activity)
    setFormData({
      title: activity.title,
      type: activity.type,
      start_at: activity.start_at,
      end_at: activity.end_at,
      notes: activity.notes,
      cost_estimate: activity.cost_estimate,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.title.trim() || formData.title.trim().length < 2) {
      toast.error('Il titolo deve avere almeno 2 caratteri')
      return
    }
    setIsSaving(true)
    try {
      if (editingActivity) {
        await api.updateActivity(tripId, editingActivity.id, formData)
        toast.success('Attività aggiornata')
      } else {
        await api.createActivity(tripId, formData)
        toast.success('Attività creata')
      }
      setDialogOpen(false)
      fetchActivities()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore salvataggio')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(activityId: string) {
    setDeletingId(activityId)
    try {
      await api.deleteActivity(tripId, activityId)
      setActivities((prev) => prev.filter((a) => a.id !== activityId))
      toast.success('Attività eliminata')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore eliminazione')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Attività</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activities.length} attività
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          Aggiungi
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-56" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-7 w-7 rounded-md" />
                  <Skeleton className="h-7 w-7 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center py-12 text-center">
          <ActivityIcon className="w-8 h-8 text-muted-foreground/40 mb-2" strokeWidth={1} />
          <p className="text-sm text-muted-foreground mb-3">Nessuna attività ancora</p>
          <Button
            variant="outline"
            size="sm"
            onClick={openCreate}
            className="gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Aggiungi la prima attività
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-border/60 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h4 className="font-medium text-sm text-foreground">{activity.title}</h4>
                    {activity.type && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary/60 rounded-full px-2 py-0.5">
                        <Tag className="w-2.5 h-2.5" />
                        {activity.type}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {(activity.start_at || activity.end_at) && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {activity.start_at ? formatDatetime(activity.start_at) : '—'}
                          {activity.end_at && ` → ${formatDatetime(activity.end_at)}`}
                        </span>
                      </div>
                    )}
                    {activity.cost_estimate !== null && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{formatCurrency(activity.cost_estimate)}</span>
                      </div>
                    )}
                  </div>
                  {activity.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {activity.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(activity)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(activity.id)}
                    disabled={deletingId === activity.id}
                  >
                    {deletingId === activity.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? 'Modifica attività' : 'Nuova attività'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Titolo *</Label>
              <Input
                placeholder="Es. Visita al Sagrada Família"
                value={formData.title}
                onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Tipo</Label>
              <Select
                value={formData.type || ''}
                onValueChange={(v) => setFormData((d) => ({ ...d, type: v || null }))}
              >
                <SelectTrigger className="bg-muted/40 border-border focus:ring-1">
                  <SelectValue placeholder="Seleziona un tipo…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visita">Visita</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="spostamento">Spostamento</SelectItem>
                  <SelectItem value="alloggio">Alloggio</SelectItem>
                  <SelectItem value="cibo">Cibo & Ristorante</SelectItem>
                  <SelectItem value="tempo libero">Tempo libero</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Inizio</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_at?.slice(0, 16) || ''}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, start_at: e.target.value ? `${e.target.value}:00` : null }))
                  }
                  className="bg-muted/40 border-border focus-visible:ring-1 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Fine</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_at?.slice(0, 16) || ''}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, end_at: e.target.value ? `${e.target.value}:00` : null }))
                  }
                  className="bg-muted/40 border-border focus-visible:ring-1 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Costo stimato (€)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.cost_estimate ?? ''}
                onChange={(e) =>
                  setFormData((d) => ({
                    ...d,
                    cost_estimate: e.target.value ? parseFloat(e.target.value) : null,
                  }))
                }
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Note</Label>
              <Textarea
                placeholder="Note aggiuntive…"
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData((d) => ({ ...d, notes: e.target.value || null }))}
                className="bg-muted/40 border-border focus-visible:ring-1 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingActivity ? 'Aggiorna' : 'Crea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
