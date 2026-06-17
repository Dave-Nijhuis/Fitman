import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getHistory, type WorkoutSessionSummary } from '../api/workoutSessions'
import BottomNav from '../components/BottomNav'

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString('en-GB', { weekday: 'long' })
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatDuration(started: string, ended: string): string {
  const mins = Math.round((new Date(ended).getTime() - new Date(started).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}min`
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<WorkoutSessionSummary[]>([])

  useEffect(() => {
    getHistory().then(setHistory)
  }, [])

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-[var(--color-muted)] mt-1">{history.length} workouts logged</p>
      </header>

      <main className="px-4 space-y-3">
        {history.length === 0 && (
          <p className="text-[var(--color-muted)] text-center pt-12">No workouts yet. Go lift something.</p>
        )}
        {history.map(w => (
          <button
            key={w.id}
            onClick={() => navigate(`/history/${w.id}`, { state: w })}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex items-center justify-between text-left"
          >
            <div>
              <p className="font-semibold text-[var(--color-text)]">{w.session}</p>
              <p className="text-sm text-[var(--color-muted)] mt-0.5">
                {formatDate(w.started_at)}
                {w.ended_at && ` · ${formatDuration(w.started_at, w.ended_at)}`}
              </p>
              <div className="flex gap-3 mt-2 text-xs text-[var(--color-muted)]">
                <span>{w.set_count} sets</span>
                <span>{w.volume_kg.toLocaleString()} kg</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-[var(--color-muted)] shrink-0" />
          </button>
        ))}
      </main>

      <BottomNav />
    </div>
  )
}
