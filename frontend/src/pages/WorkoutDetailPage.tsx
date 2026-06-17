import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getSessionLogs, type SessionLogEntry, type WorkoutSessionSummary } from '../api/workoutSessions'

function groupByExercise(logs: SessionLogEntry[]): Record<string, SessionLogEntry[]> {
  return logs.reduce((acc, log) => {
    const key = log.exercise_name
    acc[key] = [...(acc[key] ?? []), log]
    return acc
  }, {} as Record<string, SessionLogEntry[]>)
}

export default function WorkoutDetailPage() {
  const { sessionId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const summary = state as WorkoutSessionSummary | null

  const [logs, setLogs] = useState<SessionLogEntry[]>([])

  useEffect(() => {
    if (sessionId) getSessionLogs(Number(sessionId)).then(setLogs)
  }, [sessionId])

  const grouped = groupByExercise(logs)
  const date = summary ? new Date(summary.started_at).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  }) : ''

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 bg-[var(--color-bg)] border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/history')} className="text-[var(--color-muted)]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-lg">{summary?.session}</h1>
          <p className="text-xs text-[var(--color-muted)]">{date}</p>
        </div>
      </header>

      <main className="px-4 pt-4 space-y-4">
        {Object.entries(grouped).map(([name, sets]) => (
          <div key={name} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
            <p className="font-semibold text-[var(--color-text)]">{name}</p>
            <div className="mt-3 space-y-1">
              {sets.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-muted)]">Set {i + 1}</span>
                  <span className="font-mono text-[var(--color-text)]">{s.weight} kg × {s.reps}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
