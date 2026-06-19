import { request } from './client'

export interface HomeStats {
  streak: number
  week_workouts: number
  week_volume: number
  week_minutes: number
  prev_week_volume: number
}

export function getHomeStats(): Promise<HomeStats> {
  return request<HomeStats>('/api/stats/home')
}
