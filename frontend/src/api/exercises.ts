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
