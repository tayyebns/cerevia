import { Brain } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(12px)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
          {/* Logo */}
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)' }}
            >
              <Brain className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 300,
                color: 'var(--text)',
                letterSpacing: 0.4,
              }}
            >
              Cerevia
            </span>
          </a>

          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t text-center py-5 px-6 space-y-1"
        style={{ borderColor: 'var(--border)' }}
      >
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>
          Cerevia organises patient-reported information and does not provide medical advice.
        </p>
      </footer>
    </div>
  )
}
