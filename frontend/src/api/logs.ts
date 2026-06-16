import { request } from './client'

export interface LogEntry {
  id: number
  exercise_id: number
  session_id: number
  weight: number
  reps: number
  logged_at: string
}

export function logSet(exercise_id: number, session_id: number, weight: number, reps: number): Promise<LogEntry> {
  return request<LogEntry>('/api/logs', {
    method: 'POST',
    body: JSON.stringify({ exercise_id, session_id, weight, reps }),
  })
}

export function getLastSet(exerciseId: number): Promise<LogEntry | null> {
  return request<LogEntry | null>(`/api/logs/last/${exerciseId}`)
}
