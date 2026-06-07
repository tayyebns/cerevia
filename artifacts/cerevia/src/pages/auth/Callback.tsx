import { useEffect } from 'react'
import { useLocation } from 'wouter'

export default function AuthCallback() {
  const [, setLocation] = useLocation()

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (code) {
          const { createClient } = await import('@/lib/auth/client')
          const supabase = createClient()
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) {
            const { data } = await supabase.auth.getUser()
            const role = data.user?.user_metadata?.role || 'patient'
            setLocation(role === 'gp' ? '/gp' : '/patient')
            return
          }
        }
      } catch (_) {
        // fall through
      }
      setLocation('/auth/login?error=invalid_code')
    }
    run()
  }, [setLocation])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-muted)' }}>Signing you in…</p>
    </div>
  )
}
