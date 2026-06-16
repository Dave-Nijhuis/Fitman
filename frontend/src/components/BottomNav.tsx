import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Clock, TrendingUp, BookOpen } from 'lucide-react'

const tabs = [
  { label: 'Home',     icon: Home,        path: '/' },
  { label: 'History',  icon: Clock,       path: '/history' },
  { label: 'Progress', icon: TrendingUp,  path: '/progress' },
  { label: 'Library',  icon: BookOpen,    path: '/library' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex">
      {tabs.map(({ label, icon: Icon, path }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              active ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
