import { request } from './client'

export interface WorkoutSession {
  id: number
  session: string
  started_at: string
  ended_at: string | null
}

export interface WorkoutSessionSummary extends WorkoutSession {
  set_count: number
  volume_kg: number
}

export interface SessionLogEntry {
  id: number
  exercise_id: number
  exercise_name: string
  weight: number
  reps: number
  logged_at: string
}

export function getHistory(): Promise<WorkoutSessionSummary[]> {
  return request<WorkoutSessionSummary[]>('/api/sessions')
}

export function getSessionLogs(sessionId: number): Promise<SessionLogEntry[]> {
  return request<SessionLogEntry[]>(`/api/sessions/${sessionId}/logs`)
}

export function startSession(session: string): Promise<WorkoutSession> {
  return request<WorkoutSession>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ session }),
  })
}

export function endSession(sessionId: number): Promise<WorkoutSession> {
  return request<WorkoutSession>(`/api/sessions/${sessionId}/end`, {
    method: 'PATCH',
  })
}
