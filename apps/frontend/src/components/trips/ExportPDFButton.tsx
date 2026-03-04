'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { api } from '@/lib/api'
import { ExportJob } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ExportPDFButtonProps {
  tripId: string
  tripTitle: string
}

type ExportState = 'idle' | 'starting' | 'polling' | 'downloading' | 'done' | 'error'

export function ExportPDFButton({ tripId, tripTitle }: ExportPDFButtonProps) {
  const [state, setState] = useState<ExportState>('idle')
  const [job, setJob] = useState<ExportJob | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearPolling()
  }, [clearPolling])

  async function downloadPDF(jobId: string) {
    setState('downloading')
    try {
      const blob = await api.downloadExport(jobId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${tripTitle.toLowerCase().replace(/\s+/g, '-')}-export.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setState('done')
      toast.success('PDF scaricato con successo!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante il download'
      setErrorMsg(msg)
      setState('error')
      toast.error(msg)
    }
  }

  function startPolling(jobId: string) {
    setState('polling')
    intervalRef.current = setInterval(async () => {
      try {
        const updated = await api.getExportJob(jobId)
        setJob(updated)

        if (updated.status === 'succeeded' && updated.file_ready) {
          clearPolling()
          await downloadPDF(jobId)
        } else if (updated.status === 'failed') {
          clearPolling()
          const msg = updated.error || "L'export è fallito. Assicurati che il worker sia attivo."
          setErrorMsg(msg)
          setState('error')
          toast.error(msg)
        }
      } catch (err: unknown) {
        console.error('Polling error:', err)
      }
    }, 1500)
  }

  async function handleExport() {
    setState('starting')
    setErrorMsg(null)
    setJob(null)

    try {
      const newJob = await api.createExportJob(tripId)
      setJob(newJob)
      toast.info('Export avviato, attendere…')
      startPolling(newJob.job_id)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Errore nell'avvio dell'export"
      setErrorMsg(msg)
      setState('error')
      toast.error(msg)
    }
  }

  function handleReset() {
    clearPolling()
    setState('idle')
    setJob(null)
    setErrorMsg(null)
  }

  return (
    <div className="space-y-5">
      {/* Info card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Export PDF</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Esporta tutti i dettagli del viaggio in formato PDF
            </p>
          </div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1.5 mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Richiede il worker backend attivo:{' '}
              <code className="font-mono text-foreground/70 bg-black/20 px-1 rounded">
                python -m src.workers.worker_main
              </code>
            </span>
          </div>
          <p>Se il job rimane in stato &ldquo;queued&rdquo;, il worker non è attivo.</p>
        </div>

        {/* Action button */}
        {state === 'idle' && (
          <Button
            onClick={handleExport}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20"
          >
            <Download className="w-4 h-4" />
            Genera PDF
          </Button>
        )}

        {(state === 'starting' || state === 'polling' || state === 'downloading') && (
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {state === 'starting' ? 'Avvio export…' :
                   state === 'downloading' ? 'Download in corso…' :
                   'Generazione PDF in corso…'}
                </p>
                {job && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Job ID: <span className="font-mono">{job.job_id.slice(0, 12)}…</span>
                  </p>
                )}
              </div>
            </div>

            {/* Status indicator */}
            {job && (
              <StatusIndicator status={job.status} />
            )}
          </div>
        )}

        {state === 'done' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">PDF scaricato!</p>
                <p className="text-xs text-muted-foreground">
                  Il file è stato salvato sul tuo dispositivo.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleReset} className="w-full gap-2">
              <Download className="w-4 h-4" />
              Genera un nuovo PDF
            </Button>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Export fallito</p>
                {errorMsg && (
                  <p className="text-xs text-muted-foreground mt-1">{errorMsg}</p>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleReset} className="w-full gap-2">
              Riprova
            </Button>
          </div>
        )}
      </div>

      {/* Job details */}
      {job && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Dettagli job
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Job ID</span>
              <code className="font-mono text-foreground/80">{job.job_id}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stato</span>
              <StatusBadge status={job.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">File pronto</span>
              <span>{job.file_ready ? 'Sì' : 'No'}</span>
            </div>
            {job.created_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creato</span>
                <span>{new Date(job.created_at).toLocaleTimeString('it-IT')}</span>
              </div>
            )}
            {job.started_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avviato</span>
                <span>{new Date(job.started_at).toLocaleTimeString('it-IT')}</span>
              </div>
            )}
            {job.finished_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finito</span>
                <span>{new Date(job.finished_at).toLocaleTimeString('it-IT')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusIndicator({ status }: { status: string }) {
  const steps = [
    { id: 'queued', label: 'In coda' },
    { id: 'running', label: 'In esecuzione' },
    { id: 'succeeded', label: 'Completato' },
  ]

  const currentIdx = steps.findIndex((s) => s.id === status)

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center gap-2 flex-1">
          <div className="flex flex-col items-center gap-1 flex-1">
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-all duration-300',
                idx < currentIdx
                  ? 'bg-emerald-400/20 border-emerald-400/40 text-emerald-400'
                  : idx === currentIdx
                  ? 'bg-primary/20 border-primary/40 text-primary animate-pulse'
                  : 'bg-secondary/60 border-border text-muted-foreground'
              )}
            >
              {idx < currentIdx ? '✓' : idx + 1}
            </div>
            <span className="text-xs text-muted-foreground text-center leading-tight">
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'h-px flex-1 mb-5 transition-colors duration-300',
                idx < currentIdx ? 'bg-emerald-400/40' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    queued: {
      label: 'In coda',
      icon: Clock,
      className: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    },
    running: {
      label: 'In esecuzione',
      icon: Loader2,
      className: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    },
    succeeded: {
      label: 'Completato',
      icon: CheckCircle2,
      className: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    },
    failed: {
      label: 'Fallito',
      icon: XCircle,
      className: 'text-destructive bg-destructive/10 border-destructive/20',
    },
  }
  const cfg = configs[status] || configs.queued
  const Icon = cfg.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium',
        cfg.className
      )}
    >
      <Icon className={cn('w-3 h-3', status === 'running' && 'animate-spin')} />
      {cfg.label}
    </span>
  )
}
