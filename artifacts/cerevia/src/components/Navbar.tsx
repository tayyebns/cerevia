import { Link } from 'wouter'
import { Brain } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

/**
 * Shared, persistent top navigation used across the public-facing routes
 * (Landing, auth). Centralises the Cerevia wordmark (Cormorant Garamond +
 * teal #68B8AF) and the light/dark pill toggle so theme switching is
 * consistent everywhere. Pass page-specific actions via `children` — they are
 * rendered to the left of the toggle.
 */
export function Navbar({ children }: { children?: React.ReactNode }) {
  return (
    <header
      className="sticky top-0 z-40 border-b transition-colors duration-300"
      style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)' }}
          >
            <Brain className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 22,
              fontWeight: 400,
              color: '#68B8AF',
              letterSpacing: 0.4,
            }}
          >
            Cerevia
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
