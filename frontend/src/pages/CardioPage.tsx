import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import {
  getActivities, getCardioHistory, logCardio, deleteCardio,
  type CardioEntry,
} from '../api/cardio'

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function formatDistance(metres: number): string {
  return metres >= 1000
    ? `${(metres / 1000).toFixed(2)} km`
    : `${metres} m`
}

export default function CardioPage() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<string[]>([])
  const [history, setHistory] = useState<CardioEntry[]>([])

  const [activity, setActivity] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [durationSec, setDurationSec] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getActivities().then(data => {
      setActivities(data)
      setActivity(data[0] ?? '')
    })
    getCardioHistory().then(setHistory)
  }, [])

  async function handleLog() {
    if (!activity) return
    setSaving(true)
    try {
      const distance_m = distanceKm ? parseFloat(distanceKm) * 1000 : null
      const mins = parseInt(durationMin || '0', 10)
      const secs = parseInt(durationSec || '0', 10)
      const duration_s = mins > 0 || secs > 0 ? mins * 60 + secs : null

      const entry = await logCardio({
        activity,
        distance_m,
        duration_s,
        notes: notes || null,
      })
      setHistory(prev => [entry, ...prev])
      setDistanceKm('')
      setDurationMin('')
      setDurationSec('')
      setNotes('')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    await deleteCardio(id)
    setHistory(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="px-4 pt-12 pb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[var(--color-muted)]">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Log Cardio</h1>
      </header>

      <main className="px-4 space-y-6">

        {/* Log form */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 space-y-4">

          {/* Activity selector */}
          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1.5 block">Activity</label>
            <div className="flex flex-wrap gap-2">
              {activities.map(a => (
                <button
                  key={a}
                  onClick={() => setActivity(a)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activity === a
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-muted)]'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Distance */}
          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1.5 block">Distance (km) — optional</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="5.0"
              value={distanceKm}
              onChange={e => setDistanceKm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1.5 block">Duration — optional</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                placeholder="30"
                value={durationMin}
                onChange={e => setDurationMin(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-muted)]">min</span>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={durationSec}
                onChange={e => setDurationSec(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-muted)]">sec</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-[var(--color-muted)] mb-1.5 block">Notes — optional</label>
            <input
              type="text"
              placeholder="Felt strong today…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <button
            onClick={handleLog}
            disabled={saving || !activity}
            className="w-full py-3 bg-[var(--color-accent)] text-white font-semibold rounded-xl disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Log session'}
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">History</h2>
            <div className="space-y-2">
              {history.map(entry => (
                <div
                  key={entry.id}
                  className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{entry.activity}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      {[
                        entry.distance_m != null && formatDistance(entry.distance_m),
                        entry.duration_s != null && formatDuration(entry.duration_s),
                        entry.notes,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-muted)]">
                      {entry.logged_at.slice(0, 10)}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-[var(--color-muted)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
