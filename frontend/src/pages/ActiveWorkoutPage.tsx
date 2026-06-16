import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { getExercises, type Exercise } from '../api/exercises'
import { getLastSet, logSet, type LogEntry } from '../api/logs'
import { endSession } from '../api/workoutSessions'

interface Inputs {
  weight: string
  reps: string
}

export default function ActiveWorkoutPage() {
  const { sessionId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const session: string = state?.session ?? ''
  const id = Number(sessionId)

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [lastSets, setLastSets] = useState<Record<number, LogEntry | null>>({})
  const [sessionLogs, setSessionLogs] = useState<Record<number, LogEntry[]>>({})
  const [inputs, setInputs] = useState<Record<number, Inputs>>({})
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    if (!session) { navigate('/'); return }
    getExercises(session).then(exs => {
      setExercises(exs)
      setInputs(Object.fromEntries(exs.map(e => [e.id, { weight: '', reps: '' }])))
      Promise.all(exs.map(e => getLastSet(e.id))).then(results => {
        setLastSets(Object.fromEntries(exs.map((e, i) => [e.id, results[i]])))
      })
    })
  }, [session])

  function setInput(exerciseId: number, field: keyof Inputs, value: string) {
    setInputs(prev => ({ ...prev, [exerciseId]: { ...prev[exerciseId], [field]: value } }))
  }

  async function handleLog(exerciseId: number) {
    const { weight, reps } = inputs[exerciseId] ?? {}
    if (!weight || !reps) return
    const entry = await logSet(exerciseId, id, Number(weight), Number(reps))
    setSessionLogs(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] ?? []), entry],
    }))
  }

  async function handleFinish() {
    setFinishing(true)
    try {
      await endSession(id)
      navigate('/')
    } finally {
      setFinishing(false)
    }
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 bg-[var(--color-bg)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">{session}</h1>
          <p className="text-xs text-[var(--color-muted)]">{exercises.length} exercises</p>
        </div>
        <button
          onClick={handleFinish}
          disabled={finishing}
          className="px-4 py-2 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl disabled:opacity-50"
        >
          {finishing ? '…' : 'Finish'}
        </button>
      </header>

      <main className="px-4 pt-4 space-y-4">
        {exercises.map(exercise => {
          const prev = lastSets[exercise.id]
          const logged = sessionLogs[exercise.id] ?? []
          const { weight, reps } = inputs[exercise.id] ?? { weight: '', reps: '' }

          return (
            <div key={exercise.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
              <p className="font-semibold text-[var(--color-text)]">{exercise.name}</p>
              {exercise.muscles && (
                <p className="text-xs text-[var(--color-muted)] mt-0.5">{exercise.muscles}</p>
              )}

              <p className="text-sm text-[var(--color-muted)] mt-3">
                PREV: {prev ? `${prev.weight} kg × ${prev.reps}` : '—'}
              </p>

              <div className="flex gap-2 mt-3">
                <div className="flex-1">
                  <label className="text-xs text-[var(--color-muted)]">Weight (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={weight}
                    onChange={e => setInput(exercise.id, 'weight', e.target.value)}
                    placeholder={prev ? String(prev.weight) : '0'}
                    className="w-full mt-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-mono"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[var(--color-muted)]">Reps</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={reps}
                    onChange={e => setInput(exercise.id, 'reps', e.target.value)}
                    placeholder={prev ? String(prev.reps) : '0'}
                    className="w-full mt-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-mono"
                  />
                </div>
              </div>

              <button
                onClick={() => handleLog(exercise.id)}
                disabled={!weight || !reps}
                className="mt-3 w-full py-2 border border-[var(--color-accent)] text-[var(--color-accent)] font-semibold text-sm rounded-xl disabled:opacity-40"
              >
                Log Set
              </button>

              {logged.length > 0 && (
                <div className="mt-3 space-y-1">
                  {logged.map((entry, i) => (
                    <div key={entry.id} className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                      <CheckCircle2 size={14} className="text-[var(--color-accent)] shrink-0" />
                      Set {i + 1}: {entry.weight} kg × {entry.reps}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </main>
    </div>
  )
}
