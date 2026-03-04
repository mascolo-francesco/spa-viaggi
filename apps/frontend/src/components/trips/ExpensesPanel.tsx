'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { Expense, ExpenseCreateRequest, ExpenseSummary } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  Receipt,
  Loader2,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDatetime } from '@/lib/trip-utils'
import { cn } from '@/lib/utils'

interface ExpensesPanelProps {
  tripId: string
}

const emptyForm: ExpenseCreateRequest = {
  category: '',
  amount: 0,
  currency: 'EUR',
  paid_by: null,
  shared_with: [],
  occurred_at: null,
  notes: null,
}

const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-orange-400/15 text-orange-300 border-orange-400/25',
  transport: 'bg-blue-400/15 text-blue-300 border-blue-400/25',
  accommodation: 'bg-violet-400/15 text-violet-300 border-violet-400/25',
  entertainment: 'bg-pink-400/15 text-pink-300 border-pink-400/25',
  shopping: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/25',
  health: 'bg-green-400/15 text-green-300 border-green-400/25',
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category.toLowerCase()] || 'bg-secondary text-muted-foreground border-border'
}

export function ExpensesPanel({ tripId }: ExpensesPanelProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState<ExpenseCreateRequest>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sharedWithInput, setSharedWithInput] = useState('')

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    try {
      const [expensesData, summaryData] = await Promise.all([
        api.getExpenses(tripId),
        api.getExpenseSummary(tripId),
      ])
      setExpenses(expensesData)
      setSummary(summaryData)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore caricamento spese')
    } finally {
      setIsLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  function openCreate() {
    setEditingExpense(null)
    setFormData(emptyForm)
    setSharedWithInput('')
    setDialogOpen(true)
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense)
    setFormData({
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency,
      paid_by: expense.paid_by,
      shared_with: expense.shared_with,
      occurred_at: expense.occurred_at,
      notes: expense.notes,
    })
    setSharedWithInput(expense.shared_with.join(', '))
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.category.trim() || formData.category.trim().length < 2) {
      toast.error('La categoria deve avere almeno 2 caratteri')
      return
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.error("L'importo deve essere maggiore di 0")
      return
    }
    if (!formData.currency || formData.currency.length !== 3) {
      toast.error('La valuta deve essere un codice di 3 lettere (es. EUR)')
      return
    }

    const shared = sharedWithInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const payload = { ...formData, shared_with: shared }

    setIsSaving(true)
    try {
      if (editingExpense) {
        await api.updateExpense(tripId, editingExpense.id, payload)
        toast.success('Spesa aggiornata')
      } else {
        await api.createExpense(tripId, payload)
        toast.success('Spesa creata')
      }
      setDialogOpen(false)
      fetchAll()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore salvataggio')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(expenseId: string) {
    setDeletingId(expenseId)
    try {
      await api.deleteExpense(tripId, expenseId)
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId))
      const newSummary = await api.getExpenseSummary(tripId)
      setSummary(newSummary)
      toast.success('Spesa eliminata')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore eliminazione')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Summary card */}
      {summary && summary.total_amount > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Riepilogo spese
            </h3>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Totale</span>
            <span className="text-2xl font-display font-light text-foreground">
              {formatCurrency(summary.total_amount, summary.currency)}
            </span>
          </div>

          {summary.by_category.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Per categoria</span>
              </div>
              <div className="space-y-2">
                {summary.by_category
                  .sort((a, b) => b.total - a.total)
                  .map(({ category, total }) => {
                    const pct = summary.total_amount > 0 ? (total / summary.total_amount) * 100 : 0
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground/80 capitalize">{category}</span>
                          <span className="text-muted-foreground">
                            {formatCurrency(total, summary.currency)} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Spese</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{expenses.length} elementi</p>
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

      {/* Expenses list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center py-12 text-center">
          <Receipt className="w-8 h-8 text-muted-foreground/40 mb-2" strokeWidth={1} />
          <p className="text-sm text-muted-foreground mb-3">Nessuna spesa ancora</p>
          <Button variant="outline" size="sm" onClick={openCreate} className="gap-2">
            <Plus className="w-3.5 h-3.5" />
            Aggiungi la prima spesa
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-border/60 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full border capitalize',
                        getCategoryColor(expense.category)
                      )}
                    >
                      {expense.category}
                    </Badge>
                    {expense.occurred_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatDatetime(expense.occurred_at)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-display text-lg text-foreground">
                      {formatCurrency(expense.amount, expense.currency)}
                    </span>
                    {expense.paid_by && (
                      <span className="text-xs text-muted-foreground">
                        pagato da <span className="text-foreground/80">{expense.paid_by}</span>
                      </span>
                    )}
                  </div>

                  {expense.shared_with.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Diviso con: {expense.shared_with.join(', ')}
                    </p>
                  )}

                  {expense.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {expense.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(expense)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                  >
                    {deletingId === expense.id ? (
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
              {editingExpense ? 'Modifica spesa' : 'Nuova spesa'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Categoria *</Label>
                <Input
                  placeholder="Es. food, transport…"
                  value={formData.category}
                  onChange={(e) => setFormData((d) => ({ ...d, category: e.target.value }))}
                  className="bg-muted/40 border-border focus-visible:ring-1"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Valuta</Label>
                <Input
                  placeholder="EUR"
                  maxLength={3}
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((d) => ({ ...d, currency: e.target.value.toUpperCase() }))
                  }
                  className="bg-muted/40 border-border focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Importo *</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, amount: parseFloat(e.target.value) || 0 }))
                }
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Pagato da</Label>
              <Input
                placeholder="Username di chi ha pagato"
                value={formData.paid_by || ''}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, paid_by: e.target.value || null }))
                }
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Diviso con (separati da virgola)</Label>
              <Input
                placeholder="Es. franco, luca"
                value={sharedWithInput}
                onChange={(e) => setSharedWithInput(e.target.value)}
                className="bg-muted/40 border-border focus-visible:ring-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Data occorrenza</Label>
              <Input
                type="datetime-local"
                value={formData.occurred_at?.slice(0, 16) || ''}
                onChange={(e) =>
                  setFormData((d) => ({
                    ...d,
                    occurred_at: e.target.value ? `${e.target.value}:00` : null,
                  }))
                }
                className="bg-muted/40 border-border focus-visible:ring-1 text-xs"
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
              {editingExpense ? 'Aggiorna' : 'Crea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
