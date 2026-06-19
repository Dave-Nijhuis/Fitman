import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const DEFAULT_REST = 90

interface Props {
  onDismiss: () => void
}

export default function RestTimer({ onDismiss }: Props) {
  const [seconds, setSeconds] = useState(DEFAULT_REST)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(interval)
          onDismiss()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className="sticky bottom-0 w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 pt-4 pb-6 shadow-lg z-20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-widest">Rest</p>
          <p className="text-4xl font-mono font-medium text-[var(--color-text)] mt-1">
            {mins}:{secs.toString().padStart(2, '0')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSeconds(s => s + 30)}
            className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-xl text-[var(--color-muted)] font-medium"
          >
            +30s
          </button>
          <button
            onClick={onDismiss}
            className="p-2 rounded-xl text-[var(--color-muted)] border border-[var(--color-border)]"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="mt-4 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-1000"
          style={{ width: `${(seconds / DEFAULT_REST) * 100}%` }}
        />
      </div>
    </div>
  )
}
