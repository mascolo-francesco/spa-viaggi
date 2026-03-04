'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Compass, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      toast.error('Inserisci username e password')
      return
    }
    setIsLoading(true)
    try {
      await login(username.trim(), password)
      router.replace('/trips')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Credenziali non valide'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/2 blur-3xl" />
      </div>

      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 mb-4">
            <Compass className="w-7 h-7 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-light tracking-wide text-foreground">
            GruppoViaggi
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Organizza i tuoi viaggi di gruppo
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-foreground">Accedi</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Inserisci le tue credenziali per continuare
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground/80">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="es. franco"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                disabled={isLoading}
                className="bg-secondary/50 border-border focus:border-primary/50 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
                className="bg-secondary/50 border-border focus:border-primary/50 h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg transition-all duration-200 shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accesso in corso…
                </>
              ) : (
                'Accedi'
              )}
            </Button>
          </form>

          {/* Test credentials hint */}
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">Credenziali di test</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { u: 'franco', p: 'franco123' },
                { u: 'luca', p: 'luca123' },
                { u: 'marta', p: 'marta123' },
              ].map(({ u }) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => { setUsername(u); setPassword(`${u}123`) }}
                  className="text-xs text-primary/70 hover:text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-md px-2 py-1.5 transition-colors"
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 text-primary/60" />
          <span>Esplora il mondo, pianifica la tua avventura</span>
        </div>
      </div>
    </div>
  )
}
