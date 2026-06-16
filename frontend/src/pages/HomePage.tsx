import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { getSessions } from '../api/exercises'
import { startSession } from '../api/workoutSessions'
import BottomNav from '../components/BottomNav'

const SESSION_META: Record<string, { focus: string }> = {
  'Push A': { focus: 'Chest · Shoulders · Triceps' },
  'Pull A': { focus: 'Back · Biceps · Rear Delts' },
  'Legs A': { focus: 'Quads · Glutes · Hamstrings' },
}

export default function HomePage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<string[]>([])
  const [starting, setStarting] = useState<string | null>(null)

  useEffect(() => {
    getSessions().then(setSessions)
  }, [])

  async function handleStart(session: string) {
    setStarting(session)
    try {
      const workout = await startSession(session)
      navigate(`/workout/${workout.id}`, { state: { session, sessionId: workout.id } })
    } finally {
      setStarting(null)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Fit<span className="text-[var(--color-accent)]">man</span>
        </h1>
        <p className="text-[var(--color-muted)] mt-1">Choose a session to start</p>
      </header>

      <main className="px-4 space-y-3">
        {sessions.map(session => (
          <div
            key={session}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] bg-opacity-10 flex items-center justify-center">
                <Dumbbell size={18} className="text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)]">{session}</p>
                <p className="text-sm text-[var(--color-muted)]">
                  {SESSION_META[session]?.focus}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleStart(session)}
              disabled={starting !== null}
              className="px-4 py-2 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl disabled:opacity-50"
            >
              {starting === session ? '…' : 'Start'}
            </button>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  )
}
