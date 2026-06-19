import { NavLink, useNavigate } from 'react-router-dom'
import { House, TrendingUp, Clock, BookOpen, Plus } from 'lucide-react'

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
      <div className="flex flex-col items-center flex-1" style={{ marginTop: -34 }}>
        <button
          onClick={() => navigate('/')}
          className="w-[52px] h-[52px] rounded-full bg-[var(--color-accent)] flex items-center justify-center"
          style={{ boxShadow: 'color-mix(in srgb, var(--color-accent) 42%, transparent) 0 8px 20px' }}
          aria-label="Start workout"
        >
          <Plus size={26} strokeWidth={2.4} color="#fff" />
        </button>
      </div>

      {RIGHT.map(({ label, icon, path }) => tab(label, icon, path))}
    </nav>
  )
}
