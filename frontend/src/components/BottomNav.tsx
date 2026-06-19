import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { House, TrendingUp, Clock, BookOpen, Plus, Play } from 'lucide-react'
import { getActiveWorkout } from '../api/workoutSessions'

const LEFT  = [
  { label: 'Home',     icon: House,      path: '/' },
  { label: 'Progress', icon: TrendingUp, path: '/progress' },
]
const RIGHT = [
  { label: 'History',  icon: Clock,      path: '/history' },
  { label: 'Library',  icon: BookOpen,   path: '/library' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  useLocation() // re-render on every navigation to pick up localStorage changes

  const active = getActiveWorkout()

  const tab = (label: string, Icon: React.ElementType, path: string) => (
    <NavLink
      key={path}
      to={path}
      end={path === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 flex-1 text-[10.5px] font-semibold py-[2px] transition-colors ${
          isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-faint)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={23} strokeWidth={isActive ? 2.2 : 1.9} />
          {label}
        </>
      )}
    </NavLink>
  )

  return (
    <nav
      className="md:hidden relative z-30 shrink-0 flex justify-around items-stretch px-[10px] pt-[9px] pb-[26px] border-t border-[var(--color-border)]"
      style={{ background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(18px) saturate(180%)', WebkitBackdropFilter: 'blur(18px) saturate(180%)' }}
    >
      {LEFT.map(({ label, icon, path }) => tab(label, icon, path))}

      {/* Centre FAB */}
      <div className="flex flex-col items-center gap-1 flex-1 text-[10.5px] font-semibold" style={{ marginTop: -34 }}>
        <button
          onClick={() => active ? navigate(`/workout/${active.id}`, { state: { session: active.session, sessionId: active.id } }) : navigate('/')}
          className="w-[52px] h-[52px] rounded-full bg-[var(--color-accent)] flex items-center justify-center"
          style={{ boxShadow: 'color-mix(in srgb, var(--color-accent) 42%, transparent) 0 8px 20px' }}
          aria-label={active ? 'Resume workout' : 'Start workout'}
        >
          {active
            ? <Play size={22} strokeWidth={2.4} color="#fff" fill="#fff" />
            : <Plus size={26} strokeWidth={2.4} color="#fff" />
          }
        </button>
        <span className={active ? 'text-[var(--color-accent)]' : 'text-[var(--color-faint)]'}>
          {active ? 'Resume' : 'Start'}
        </span>
      </div>

      {RIGHT.map(({ label, icon, path }) => tab(label, icon, path))}
    </nav>
  )
}
