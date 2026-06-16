import { request } from './client'

export interface WorkoutSession {
  id: number
  session: string
  started_at: string
  ended_at: string | null
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
