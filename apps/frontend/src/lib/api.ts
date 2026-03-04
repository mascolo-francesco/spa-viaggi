import {
  AuthResponse,
  TripDetail,
  TripsListResponse,
  TripsFilter,
  ParticipantsResponse,
  Activity,
  ActivityCreateRequest,
  Expense,
  ExpenseCreateRequest,
  ExpenseSummary,
  MapMarker,
  MapMarkersFilter,
  ExportJob,
  TripCreateRequest,
  APIError,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

class APIClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    authenticated = true
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (authenticated) {
      const token = getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorData: APIError | null = null
      try {
        errorData = await response.json()
      } catch {
        // ignore parse errors
      }

      const message =
        errorData?.detail
          ? typeof errorData.detail === 'string'
            ? errorData.detail
            : errorData.detail.message || errorData.detail.code || 'Errore sconosciuto'
          : `HTTP ${response.status}`

      throw new APIClientError(message, response.status, errorData)
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  private async downloadBlob(path: string): Promise<Blob> {
    const token = getToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${path}`, { headers })

    if (!response.ok) {
      let errorData: APIError | null = null
      try {
        errorData = await response.json()
      } catch {
        // ignore
      }
      const message =
        errorData?.detail
          ? typeof errorData.detail === 'string'
            ? errorData.detail
            : errorData.detail.message || errorData.detail.code || 'Errore'
          : `HTTP ${response.status}`
      throw new APIClientError(message, response.status, errorData)
    }

    return response.blob()
  }

  // Auth
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      let errorData: APIError | null = null
      try {
        errorData = await response.json()
      } catch { /* ignore */ }
      const message =
        errorData?.detail
          ? typeof errorData.detail === 'string'
            ? errorData.detail
            : errorData.detail.message || errorData.detail.code || 'Credenziali non valide'
          : `HTTP ${response.status}`
      throw new APIClientError(message, response.status, errorData)
    }

    return response.json()
  }

  // Health
  async health(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/api/v1/health/live', {}, false)
  }

  // Trips
  async getTrips(filter?: TripsFilter): Promise<TripsListResponse> {
    const params = new URLSearchParams()
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const qs = params.toString() ? `?${params.toString()}` : ''
    return this.request<TripsListResponse>(`/api/v1/trips${qs}`)
  }

  async getTrip(tripId: string): Promise<TripDetail> {
    return this.request<TripDetail>(`/api/v1/trips/${tripId}`)
  }

  async createTrip(data: TripCreateRequest): Promise<TripDetail> {
    return this.request<TripDetail>('/api/v1/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTrip(tripId: string, data: Partial<TripCreateRequest>): Promise<TripDetail> {
    return this.request<TripDetail>(`/api/v1/trips/${tripId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteTrip(tripId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/trips/${tripId}`, {
      method: 'DELETE',
    })
  }

  // Participants
  async getParticipants(tripId: string): Promise<ParticipantsResponse> {
    return this.request<ParticipantsResponse>(`/api/v1/trips/${tripId}/participants`)
  }

  async setParticipants(tripId: string, userIds: string[]): Promise<ParticipantsResponse> {
    return this.request<ParticipantsResponse>(`/api/v1/trips/${tripId}/participants`, {
      method: 'PUT',
      body: JSON.stringify({ user_ids: userIds }),
    })
  }

  async addParticipant(tripId: string, userId: string): Promise<ParticipantsResponse> {
    return this.request<ParticipantsResponse>(`/api/v1/trips/${tripId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    })
  }

  async removeParticipant(tripId: string, userId: string): Promise<void> {
    return this.request<void>(`/api/v1/trips/${tripId}/participants/${userId}`, {
      method: 'DELETE',
    })
  }

  // Activities
  async getActivities(tripId: string): Promise<Activity[]> {
    return this.request<Activity[]>(`/api/v1/trips/${tripId}/activities`)
  }

  async createActivity(tripId: string, data: ActivityCreateRequest): Promise<Activity> {
    return this.request<Activity>(`/api/v1/trips/${tripId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateActivity(
    tripId: string,
    activityId: string,
    data: Partial<ActivityCreateRequest>
  ): Promise<Activity> {
    return this.request<Activity>(`/api/v1/trips/${tripId}/activities/${activityId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteActivity(tripId: string, activityId: string): Promise<void> {
    return this.request<void>(`/api/v1/trips/${tripId}/activities/${activityId}`, {
      method: 'DELETE',
    })
  }

  // Expenses
  async getExpenses(tripId: string): Promise<Expense[]> {
    return this.request<Expense[]>(`/api/v1/trips/${tripId}/expenses`)
  }

  async createExpense(tripId: string, data: ExpenseCreateRequest): Promise<Expense> {
    return this.request<Expense>(`/api/v1/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateExpense(
    tripId: string,
    expenseId: string,
    data: Partial<ExpenseCreateRequest>
  ): Promise<Expense> {
    return this.request<Expense>(`/api/v1/trips/${tripId}/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteExpense(tripId: string, expenseId: string): Promise<void> {
    return this.request<void>(`/api/v1/trips/${tripId}/expenses/${expenseId}`, {
      method: 'DELETE',
    })
  }

  async getExpenseSummary(tripId: string): Promise<ExpenseSummary> {
    return this.request<ExpenseSummary>(`/api/v1/trips/${tripId}/expenses/summary`)
  }

  // Map
  async getMapMarkers(filter?: MapMarkersFilter): Promise<MapMarker[]> {
    const params = new URLSearchParams()
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const qs = params.toString() ? `?${params.toString()}` : ''
    return this.request<MapMarker[]>(`/api/v1/trips/map/markers${qs}`)
  }

  // Export
  async createExportJob(tripId: string): Promise<ExportJob> {
    return this.request<ExportJob>(`/api/v1/trips/${tripId}/exports/pdf`, {
      method: 'POST',
    })
  }

  async getExportJob(jobId: string): Promise<ExportJob> {
    return this.request<ExportJob>(`/api/v1/exports/${jobId}`)
  }

  async downloadExport(jobId: string): Promise<Blob> {
    return this.downloadBlob(`/api/v1/exports/${jobId}/download`)
  }
}

export class APIClientError extends Error {
  status: number
  data: APIError | null

  constructor(message: string, status: number, data: APIError | null = null) {
    super(message)
    this.name = 'APIClientError'
    this.status = status
    this.data = data
  }
}

export const api = new APIClient(BASE_URL)
