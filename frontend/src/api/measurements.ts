import { request } from './client'

export interface Measurement {
  id: number
  recorded_at: string
  weight_kg: number | null
  body_fat_pct: number | null
  height_cm: number | null
  bone_mass_kg: number | null
  notes: string | null
}

export interface MeasurementIn {
  recorded_at?: string
  weight_kg?: number | null
  body_fat_pct?: number | null
  height_cm?: number | null
  bone_mass_kg?: number | null
  notes?: string | null
}

export function getMeasurements(): Promise<Measurement[]> {
  return request<Measurement[]>('/api/measurements')
}

export function logMeasurement(data: MeasurementIn): Promise<Measurement> {
  return request<Measurement>('/api/measurements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function deleteMeasurement(id: number): Promise<void> {
  return request<void>(`/api/measurements/${id}`, { method: 'DELETE' })
}
