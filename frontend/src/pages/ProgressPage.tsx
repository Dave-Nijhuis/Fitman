import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { Plus, Trash2 } from 'lucide-react'
import {
  getStrengthProgression, getVolume, getPRs, getConsistency, getBalance,
  type StrengthData, type VolumePoint, type PersonalRecord,
  type ConsistencyWeek, type MuscleBalance,
} from '../api/progress'
import {
  getMeasurements, logMeasurement, deleteMeasurement,
  type Measurement,
} from '../api/measurements'
import BottomNav from '../components/BottomNav'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function ProgressPage() {
  const [prs, setPRs] = useState<PersonalRecord[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null)
  const [strengthData, setStrengthData] = useState<StrengthData | null>(null)
  const [volume, setVolume] = useState<VolumePoint[]>([])
  const [consistency, setConsistency] = useState<ConsistencyWeek[]>([])
  const [balance, setBalance] = useState<MuscleBalance[]>([])

  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [showLogForm, setShowLogForm] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [fatInput, setFatInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getPRs().then(data => {
      setPRs(data)
      if (data.length > 0) setSelectedExerciseId(data[0].exercise_id)
    })
    getVolume().then(setVolume)
    getConsistency().then(setConsistency)
    getBalance().then(setBalance)
    getMeasurements().then(setMeasurements)
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

  const weightChartData = [...measurements]
    .reverse()
    .filter(m => m.weight_kg !== null)
    .map(m => ({ date: m.recorded_at.slice(0, 10), weight_kg: m.weight_kg }))

  async function handleLogMeasurement() {
    if (!weightInput && !fatInput) return
    setSaving(true)
    try {
      const created = await logMeasurement({
        weight_kg: weightInput ? parseFloat(weightInput) : null,
        body_fat_pct: fatInput ? parseFloat(fatInput) : null,
        notes: notesInput || null,
      })
      setMeasurements(prev => [created, ...prev])
      setWeightInput('')
      setFatInput('')
      setNotesInput('')
      setShowLogForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    await deleteMeasurement(id)
    setMeasurements(prev => prev.filter(m => m.id !== id))
  }

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

        {/* Body Weight */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[var(--color-text)]">Body Weight</h2>
            <button
              onClick={() => setShowLogForm(v => !v)}
              className="flex items-center gap-1 text-sm font-medium text-[var(--color-accent)]"
            >
              <Plus size={16} />
              Log
            </button>
          </div>

          {showLogForm && (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 mb-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-[var(--color-muted)] mb-1 block">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="75.0"
                    value={weightInput}
                    onChange={e => setWeightInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[var(--color-muted)] mb-1 block">Body fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="18.0"
                    value={fatInput}
                    onChange={e => setFatInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={notesInput}
                onChange={e => setNotesInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleLogMeasurement}
                  disabled={saving || (!weightInput && !fatInput)}
                  className="flex-1 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium disabled:opacity-40"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setShowLogForm(false)}
                  className="flex-1 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-muted)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {weightChartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} unit=" kg" domain={['auto', 'auto']} />
                <Tooltip formatter={((v: number) => [`${v} kg`, 'Weight']) as any} />
                <Line type="monotone" dataKey="weight_kg" stroke="#ff5a36" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : weightChartData.length === 1 ? (
            <p className="text-sm text-[var(--color-muted)]">Need at least 2 entries to show a trend.</p>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">No data yet — tap Log to add your first entry.</p>
          )}

          {measurements.length > 0 && (
            <div className="mt-4 space-y-2">
              {measurements.slice(0, 5).map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-4 py-2.5"
                >
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {m.weight_kg != null ? `${m.weight_kg} kg` : '—'}
                    </span>
                    {m.body_fat_pct != null && (
                      <span className="text-xs text-[var(--color-muted)] ml-2">{m.body_fat_pct}% fat</span>
                    )}
                    {m.notes && (
                      <span className="text-xs text-[var(--color-muted)] ml-2">{m.notes}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-muted)]">{m.recorded_at.slice(0, 10)}</span>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-[var(--color-muted)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
              <div className="flex gap-1 mb-1 pl-8">
                {DAY_LABELS.map((label, i) => (
                  <div key={i} className="w-4 text-center text-[9px] text-[var(--color-muted)]">
                    {label}
                  </div>
                ))}
              </div>
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
                          day.trained ? 'bg-[#ff5a36]' : 'bg-[var(--color-border)]'
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
