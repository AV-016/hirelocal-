const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  signup: (data: SignupData) =>
    apiRequest<{ message: string }>('/auth/signup', {
      method: 'POST',
      body: data,
    }),
}

// Workers API
export const workersApi = {
  search: (pincode: string, skill: string) =>
    apiRequest<Worker[]>(`/workers/search?pincode=${pincode}&skill=${skill}`),

  getById: (id: string) => apiRequest<Worker>(`/workers/${id}`),
}

// Reviews API
export const reviewsApi = {
  getByWorkerId: (workerId: string) =>
    apiRequest<Review[]>(`/reviews/worker/${workerId}`),

  submit: (data: { booking_id: string; rating: number; comment: string }) =>
    apiRequest<{ message: string }>('/reviews/submit', {
      method: 'POST',
      body: data,
    }),
}

// Bookings API
export const bookingsApi = {
  create: (data: CreateBookingData) =>
    apiRequest<{ 
      message: string; 
      booking_id: string;
      worker_phone: string;
      worker_name: string;
    }>('/bookings/create', {
      method: 'POST',
      body: data,
    }),

  getMy: () => apiRequest<Booking[]>('/bookings/my'),

  confirm: (id: string) =>
    apiRequest<{ message: string }>(`/bookings/${id}/confirm`, { method: 'PATCH' }),

  cancel: (id: string) =>
    apiRequest<{ message: string }>(`/bookings/${id}/cancel`, { method: 'PATCH' }),

  complete: (id: string) =>
    apiRequest<{ message: string }>(`/bookings/${id}/complete`, { method: 'PATCH' }),
}

// Location API (Proxy)
export const locationApi = {
  search: (q: string) => apiRequest<any[]>(`/location/search?q=${encodeURIComponent(q)}`),
  reverse: (lat: number, lon: number) => apiRequest<any>(`/location/reverse?lat=${lat}&lon=${lon}`),
}

// Types
export interface User {
  id: string
  name: string
  email: string
  phone: string
  pincode: string
  role: 'customer' | 'worker'
  skill?: string
  experience?: number
  hourly_rate?: number
  bio?: string
  verified?: boolean
  avg_rating?: number
}

export interface Worker {
  id: string
  name: string
  skill: string
  experience: number
  hourly_rate: number
  bio: string
  verified: boolean
  avg_rating: number
  pincode: string
}

export interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  customer_name: string
}

export interface Booking {
  id: string
  worker_id: string
  worker_name: string
  customer_id: string
  customer_name: string
  skill_required: string
  description: string
  scheduled_date: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  has_review?: boolean
  total_amount?: number
  created_at: string
}

export interface SignupData {
  name: string
  email: string
  password: string
  phone: string
  pincode: string
  role: 'customer' | 'worker'
  skill?: string
  experience?: number
  hourly_rate?: number
  bio?: string
}

export interface CreateBookingData {
  worker_id: string
  skill_required: string
  description: string
  scheduled_date: string
}
