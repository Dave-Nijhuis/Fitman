import { request } from './client'

export interface StrengthPoint {
  date: string
  estimated_1rm: number
}

export interface StrengthData {
  exercise_id: number
  exercise_name: string
  data: StrengthPoint[]
}

export interface VolumePoint {
  week: string
  volume_kg: number
}

export interface PersonalRecord {
  exercise_id: number
  exercise_name: string
  weight: number
  reps: number
  estimated_1rm: number
  date: string
}

export function getStrengthProgression(exerciseId: number): Promise<StrengthData> {
  return request<StrengthData>(`/api/progress/strength?exercise_id=${exerciseId}`)
}

export function getVolume(): Promise<VolumePoint[]> {
  return request<VolumePoint[]>('/api/progress/volume')
}

export function getPRs(): Promise<PersonalRecord[]> {
  return request<PersonalRecord[]>('/api/progress/prs')
}
