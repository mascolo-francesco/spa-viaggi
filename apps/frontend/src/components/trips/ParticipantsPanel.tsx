'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { Participant } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Trash2,
  Users,
  Loader2,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'

interface ParticipantsPanelProps {
  tripId: string
}

export function ParticipantsPanel({ tripId }: ParticipantsPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newUserId, setNewUserId] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchParticipants = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await api.getParticipants(tripId)
      setParticipants(res.participants)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore caricamento partecipanti')
    } finally {
      setIsLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    fetchParticipants()
  }, [fetchParticipants])

  async function handleAdd() {
    const uid = newUserId.trim()
    if (!uid) {
      toast.error('Inserisci un ID utente')
      return
    }
    if (participants.some((p) => p.user_id === uid || p.username === uid)) {
      toast.error('Partecipante già presente')
      return
    }
    setIsAdding(true)
    try {
      await api.addParticipant(tripId, uid)
      setNewUserId('')
      toast.success('Partecipante aggiunto')
      fetchParticipants()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore aggiunta partecipante')
    } finally {
      setIsAdding(false)
    }
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId)
    try {
      await api.removeParticipant(tripId, userId)
      setParticipants((prev) => prev.filter((p) => p.user_id !== userId))
      toast.success('Partecipante rimosso')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Errore rimozione partecipante')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add participant */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Aggiungi partecipante
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="ID utente (es. franco, luca, marta)"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="bg-muted/40 border-border focus-visible:ring-1 flex-1"
          />
          <Button
            onClick={handleAdd}
            disabled={isAdding || !newUserId.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shrink-0"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Aggiungi
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Usa lo username o l&apos;ID utente. Credenziali seed: franco, luca, marta.
        </p>
      </div>

      {/* Participants list */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Partecipanti
          </h3>
          <span className="text-xs text-muted-foreground">{participants.length}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : participants.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Users className="w-8 h-8 text-muted-foreground/40 mb-2" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">Nessun partecipante ancora</p>
          </div>
        ) : (
          <div className="space-y-2">
            {participants.map((p) => {
              const initials = (p.display_name || p.username)
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <div
                  key={p.user_id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/40 transition-colors group"
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {p.display_name || p.username}
                    </p>
                    {p.display_name && (
                      <p className="text-xs text-muted-foreground">@{p.username}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemove(p.user_id)}
                    disabled={removingId === p.user_id}
                  >
                    {removingId === p.user_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
