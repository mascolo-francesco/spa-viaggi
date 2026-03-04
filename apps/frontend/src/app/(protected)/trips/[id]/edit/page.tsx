'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { TripDetail } from '@/types'
import TripForm from '@/components/trips/TripForm'
import { Loader2 } from 'lucide-react'

export default function EditTripPage() {
  const { id } = useParams<{ id: string }>()
  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.getTrip(id).then(setTrip).finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!trip) return null
  return <TripForm mode="edit" trip={trip} />
}
