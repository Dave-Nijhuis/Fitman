import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import {
  getStrengthProgression, getVolume, getPRs, getConsistency, getBalance,
  type StrengthData, type VolumePoint, type PersonalRecord,
  type ConsistencyWeek, type MuscleBalance,
} from '../api/progress'
import BottomNav from '../components/BottomNav'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function ProgressPage() {
  const [prs, setPRs] = useState<PersonalRecord[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null)
  const [strengthData, setStrengthData] = useState<StrengthData | null>(null)
  const [volume, setVolume] = useState<VolumePoint[]>([])
  const [consistency, setConsistency] = useState<ConsistencyWeek[]>([])
  const [balance, setBalance] = useState<MuscleBalance[]>([])

  useEffect(() => {
    getPRs().then(data => {
      setPRs(data)
      if (data.length > 0) setSelectedExerciseId(data[0].exercise_id)
    })
    getVolume().then(setVolume)
    getConsistency().then(setConsistency)
    getBalance().then(setBalance)
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

  const totalTrainedDays = consistency.reduce(
    (sum, w) => sum + w.days.filter(d => d.trained).length,
    0,
  )

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
                    <Tooltip formatter={((v: number) => [`${v} kg`, 'Est. 1RM']) as any} />
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
                <Tooltip formatter={((v: number) => [`${v.toLocaleString()} kg`, 'Volume']) as any} />
                <Bar dataKey="volume_kg" fill="#ff5a36" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Consistency */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-base font-semibold text-[var(--color-text)]">Consistency</h2>
            {consistency.length > 0 && (
              <span className="text-sm text-[var(--color-muted)]">
                {totalTrainedDays} day{totalTrainedDays !== 1 ? 's' : ''} in 17 weeks
              </span>
            )}
          </div>
          {consistency.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No data yet — log some workouts first.</p>
          ) : (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4">
              {/* Day labels (Mon–Sun) */}
              <div className="flex gap-1 mb-1 pl-8">
                {DAY_LABELS.map((label, i) => (
                  <div key={i} className="w-4 text-center text-[9px] text-[var(--color-muted)]">
                    {label}
                  </div>
                ))}
              </div>
              {/* Grid: each row = one week */}
              <div className="space-y-1">
                {consistency.map(week => (
                  <div key={week.week} className="flex items-center gap-1">
                    <span className="w-7 text-[9px] text-[var(--color-muted)] text-right pr-1">
                      {week.week.split('-W')[1] ? `W${week.week.split('-W')[1]}` : ''}
                    </span>
                    {week.days.map(day => (
                      <div
                        key={day.date}
                        title={day.date}
                        className={`w-4 h-4 rounded-sm ${
                          day.trained
                            ? 'bg-[#ff5a36]'
                            : 'bg-[var(--color-border)]'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Muscle Balance */}
        <section>
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Muscle Balance</h2>
          {balance.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No data yet — log some workouts first.</p>
          ) : (
            <ResponsiveContainer width="100%" height={balance.length * 36 + 16}>
              <BarChart data={balance} layout="vertical" margin={{ left: 80, right: 40, top: 4, bottom: 4 }}>
                <XAxis type="number" unit="%" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <YAxis type="category" dataKey="muscle" tick={{ fontSize: 11 }} width={76} />
                <Tooltip formatter={((v: number) => [`${v}%`, 'Volume share']) as any} />
                <Bar dataKey="percentage" fill="#ff5a36" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Personal Records */}
        <section>
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">Personal Records</h2>
          {prs.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No data yet — log some workouts first.</p>
          ) : (
            <div className="space-y-2">
              {prs.map(pr => (
                <div
                  key={pr.exercise_id}
                  className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{pr.exercise_name}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{pr.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {pr.weight} kg × {pr.reps}
                    </p>
                    <p className="text-xs text-[var(--color-accent)]">
                      ~{pr.estimated_1rm} kg 1RM
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <BottomNav />
    </div>
  )
}
