import { request } from './client'

export interface Exercise {
  id: number
  name: string
  muscles: string | null
  session: string
  position: number
  type: string
  equip: string
}

export function getSessions(): Promise<string[]> {
  return request<string[]>('/api/exercises/sessions')
}

export function getExercises(session: string): Promise<Exercise[]> {
  return request<Exercise[]>(`/api/exercises?session=${encodeURIComponent(session)}`)
}

export function getAllExercises(session?: string, search?: string): Promise<Exercise[]> {
  const params = new URLSearchParams()
  if (session) params.set('session', session)
  if (search) params.set('search', search)
  const qs = params.toString()
  return request<Exercise[]>(`/api/exercises${qs ? `?${qs}` : ''}`)
}
