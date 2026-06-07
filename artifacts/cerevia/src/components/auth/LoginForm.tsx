import { useState } from 'react'
import { useLocation } from 'wouter'

export const LoginForm = () => {
  const [, setLocation] = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { createClient } = await import('@/lib/auth/client')
      const supabase = createClient()
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

      if (loginError) {
        setError(loginError.message)
        return
      }

      if (data.user?.user_metadata?.role === 'gp') {
        setLocation('/gp')
      } else {
        setLocation('/patient')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontFamily: 'Nunito, sans-serif',
    fontSize: 14,
    color: 'var(--text)',
    background: 'var(--surface)',
    boxSizing: 'border-box',
    outline: 'none',
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-8">
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, color: 'var(--text)', marginBottom: 8 }}>
          Welcome back
        </h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-muted)' }}>
          Sign in to access your Cerevia dashboard
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
        </div>

        <div>
          <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
        </div>

        {error && (
          <div style={{ padding: 10, borderRadius: 8, background: 'rgba(220,100,100,0.1)', border: '1px solid rgba(220,100,100,0.3)', fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#dc6464' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', borderRadius: 24, background: loading ? '#6b8b89' : '#68B8AF', border: 'none', color: 'white', fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <a href="/auth/signup" style={{ color: '#68B8AF', textDecoration: 'none', fontWeight: 600 }}>Sign up</a>
        </span>
      </div>
    </div>
  )
}
