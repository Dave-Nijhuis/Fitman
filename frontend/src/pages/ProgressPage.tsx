import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import {
  getStrengthProgression, getVolume, getPRs,
  type StrengthData, type VolumePoint, type PersonalRecord,
} from '../api/progress'
import BottomNav from '../components/BottomNav'

export default function ProgressPage() {
  const [prs, setPRs] = useState<PersonalRecord[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null)
  const [strengthData, setStrengthData] = useState<StrengthData | null>(null)
  const [volume, setVolume] = useState<VolumePoint[]>([])

  useEffect(() => {
    getPRs().then(data => {
      setPRs(data)
      if (data.length > 0) setSelectedExerciseId(data[0].exercise_id)
    })
    getVolume().then(setVolume)
  }, [])

  useEffect(() => {
    if (selectedExerciseId !== null) {
      getStrengthProgression(selectedExerciseId).then(setStrengthData)
    }
  }, [selectedExerciseId])

  const volumeChartData = volume.map(v => ({
    ...v,
    week: v.week.split('-W')[1] ? `W${v.week.split('-W')[1]}` : v.week,
  }))

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
      </header>

      <main className="px-4 space-y-8">

        {/* Strength */}
        <section>
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Strength</h2>
          {prs.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No data yet — log some workouts first.</p>
          ) : (
            <>
              <select
                value={selectedExerciseId ?? ''}
                onChange={e => setSelectedExerciseId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                {prs.map(pr => (
                  <option key={pr.exercise_id} value={pr.exercise_id}>
                    {pr.exercise_name}
                  </option>
                ))}
              </select>

              {strengthData && strengthData.data.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={strengthData.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} unit=" kg" />
                    <Tooltip formatter={(v: number) => [`${v} kg`, 'Est. 1RM']} />
                    <Line type="monotone" dataKey="estimated_1rm" stroke="#ff5a36" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-[var(--color-muted)]">Need at least 2 sessions to show a trend.</p>
              )}
            </>
          )}
        </section>

        {/* Volume */}
        <section>
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Weekly Volume</h2>
          {volumeChartData.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No data yet — log some workouts first.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={volumeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit=" kg" />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} kg`, 'Volume']} />
                <Bar dataKey="volume_kg" fill="#ff5a36" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

      </main>

      <BottomNav />
    </div>
  )
}
