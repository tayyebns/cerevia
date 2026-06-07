'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, Mic, Bell } from 'lucide-react'

const navItems = [
  { href: '/patient', label: 'Home', icon: Home },
  { href: '/patient/daily-care', label: 'Daily Care', icon: CalendarDays },
  { href: '/patient/capture', label: 'Capture', icon: Mic },
  { href: '/patient/reminders', label: 'Reminders', icon: Bell },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/patient' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 min-w-[60px] min-h-[44px] justify-center rounded-xl"
              style={{ textDecoration: 'none' }}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={active ? 2 : 1.5}
                style={{ color: active ? '#68B8AF' : 'var(--text-subtle)' }}
              />
              <span
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: 11,
                  fontWeight: active ? 700 : 400,
                  color: active ? '#68B8AF' : 'var(--text-subtle)',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
