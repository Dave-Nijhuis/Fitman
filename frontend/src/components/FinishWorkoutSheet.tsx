import type { Exercise } from '../api/exercises'
import type { LogEntry } from '../api/logs'

interface Props {
  session: string
  exercises: Exercise[]
  sessionLogs: Record<number, LogEntry[]>
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

export default function FinishWorkoutSheet({ session, exercises, sessionLogs, onConfirm, onCancel, loading }: Props) {
  const allLogs = Object.values(sessionLogs).flat()
  const totalSets = allLogs.length
  const totalVolume = allLogs.reduce((sum, l) => sum + l.weight * l.reps, 0)
  const exercisesWorked = exercises.filter(e => (sessionLogs[e.id]?.length ?? 0) > 0).length

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="w-full bg-[var(--color-surface)] rounded-t-3xl px-5 pt-6 pb-10">
        <div className="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mb-6" />

        <h2 className="text-xl font-bold text-[var(--color-text)]">Finish {session}?</h2>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-[var(--color-bg)] rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-[var(--color-text)]">{exercisesWorked}</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">Exercises</p>
          </div>
          <div className="bg-[var(--color-bg)] rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-[var(--color-text)]">{totalSets}</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">Sets</p>
          </div>
          <div className="bg-[var(--color-bg)] rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-[var(--color-text)]">{totalVolume.toLocaleString()}</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">kg volume</p>
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="mt-5 w-full py-3 bg-[var(--color-accent)] text-white font-semibold rounded-2xl disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save & Finish'}
        </button>
        <button
          onClick={onCancel}
          className="mt-3 w-full py-3 text-[var(--color-muted)] font-medium"
        >
          Keep going
        </button>
      </div>
    </div>
  )
}
