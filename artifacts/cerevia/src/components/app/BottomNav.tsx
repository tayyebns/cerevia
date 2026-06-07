import { useLocation } from 'wouter'

const TABS = [
  { path: '/app',          icon: '◈', label: 'Today' },
  { path: '/app/patterns', icon: '⌁', label: 'Patterns' },
  { path: '/app/baseline', icon: '∿', label: 'Baseline' },
  { path: '/app/note',     icon: '⊡', label: 'My Note' },
  { path: '/app/sources',  icon: '◎', label: 'Sources' },
]

export default function BottomNav() {
  const [location, navigate] = useLocation()

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const active = tab.path === '/app'
          ? location === '/app' || location === '/app/'
          : location.startsWith(tab.path)
        return (
          <button
            key={tab.path}
            className={`bottom-nav-item ${active ? 'bottom-nav-active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
