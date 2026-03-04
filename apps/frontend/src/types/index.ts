// Auth types
export interface User {
  id: string
  username: string
  display_name: string | null
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// Trip types
export type TripStatus = 'planned' | 'completed' | 'cancelled'

export interface Destination {
  city: string | null
  country: string | null
  address: string | null
}

export interface Location {
  lat: number
  lon: number
}

export interface TripListItem {
  id: string
  title: string
  destination: Destination | null
  start_date: string | null
  end_date: string | null
  status: TripStatus
  participants_count: number
  created_at: string
}

export interface TripDetail {
  id: string
  title: string
  destination: Destination | null
  description: string | null
  start_date: string | null
  end_date: string | null
  status: TripStatus
  location: Location | null
  participants: string[]
  extra: Record<string, unknown> | null
  created_at: string
  updated_at: string | null
}

export interface TripCreateRequest {
  title: string
  destination?: Destination | null
  description?: string | null
  start_date?: string | null
  end_date?: string | null
  status?: TripStatus
  location?: Location | null
  participants?: string[]
  extra?: Record<string, unknown>
}

export interface TripsListResponse {
  items: TripListItem[]
  total: number
  page: number
  limit: number
}

export interface TripsFilter {
  status?: TripStatus
  destination?: string
  from_date?: string
  to_date?: string
  page?: number
  limit?: number
  sort?: string
}

// Participant types
export interface Participant {
  user_id: string
  username: string
  display_name: string | null
}

export interface ParticipantsResponse {
  trip_id: string
  participants: Participant[]
  updated_at: string | null
}

// Activity types
export interface Activity {
  id: string
  trip_id: string
  title: string
  type: string | null
  start_at: string | null
  end_at: string | null
  notes: string | null
  cost_estimate: number | null
  created_at: string
  updated_at: string | null
}

export interface ActivityCreateRequest {
  title: string
  type?: string | null
  start_at?: string | null
  end_at?: string | null
  notes?: string | null
  cost_estimate?: number | null
}

// Expense types
export interface Expense {
  id: string
  trip_id: string
  category: string
  amount: number
  currency: string
  paid_by: string | null
  shared_with: string[]
  occurred_at: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

export interface ExpenseCreateRequest {
  category: string
  amount: number
  currency: string
  paid_by?: string | null
  shared_with?: string[]
  occurred_at?: string | null
  notes?: string | null
}

export interface ExpenseSummaryCategory {
  category: string
  total: number
}

export interface ExpenseSummary {
  trip_id: string
  currency: string
  total_amount: number
  by_category: ExpenseSummaryCategory[]
}

// Map types
export type MarkerColor = 'red' | 'green'

export interface MapMarker {
  trip_id: string
  title: string
  status: TripStatus
  marker_color: MarkerColor
  lat: number
  lon: number
  destination: Destination | null
}

export interface MapMarkersFilter {
  status?: TripStatus
  from_date?: string
  to_date?: string
}

// Export types
export type ExportJobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export interface ExportJob {
  job_id: string
  trip_id: string
  status: ExportJobStatus
  error: string | null
  file_ready: boolean
  created_at: string
  started_at: string | null
  finished_at: string | null
}

// Error types
export interface APIError {
  detail: {
    code?: string
    message?: string
  } | string
}
