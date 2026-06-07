import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import type { UserRole } from '@/lib/auth/types'

type GuardArea = 'patient' | 'gp'
type GuardState = 'checking' | 'allowed' | 'redirecting'

function GuardLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: '#68B8AF', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

/**
 * Client-side route guard for the protected dashboards. Mirrors the auth +
 * role-based redirects the original Next.js middleware enforced:
 *  - unauthenticated users hitting /patient* or /gp* are sent to /auth/login
 *  - GP users are kept out of patient routes (redirected to /gp)
 *  - non-GP users are kept out of GP routes (redirected to /patient)
 *
 * Demo mode: when Supabase env vars are absent the app intentionally runs on
 * demo data with no real auth, so the guard allows access rather than trapping
 * the user on a login page that cannot authenticate.
 */
export function AuthGuard({ area, children }: { area: GuardArea; children: React.ReactNode }) {
  const [, setLocation] = useLocation()
  const [state, setState] = useState<GuardState>('checking')

  useEffect(() => {
    let active = true

    const check = async () => {
      const hasSupabase = Boolean(
        import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
      )

      if (!hasSupabase) {
        if (active) setState('allowed')
        return
      }

      try {
        const { createClient } = await import('@/lib/auth/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!active) return

        if (!user) {
          setState('redirecting')
          setLocation('/auth/login')
          return
        }

        const role = (user.user_metadata?.role as UserRole) || 'patient'

        if (area === 'gp' && role !== 'gp') {
          setState('redirecting')
          setLocation('/patient')
          return
        }

        if (area === 'patient' && role === 'gp') {
          setState('redirecting')
          setLocation('/gp')
          return
        }

        setState('allowed')
      } catch (err) {
        console.error('Auth guard check failed:', err)
        if (!active) return
        setState('redirecting')
        setLocation('/auth/login')
      }
    }

    check()
    return () => {
      active = false
    }
  }, [area, setLocation])

  if (state !== 'allowed') {
    return <GuardLoader />
  }

  return <>{children}</>
}
