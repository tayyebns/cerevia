'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth/client'
import { UserRole } from '@/lib/auth/types'

export const SignupForm = () => {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('patient')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      })

      if (signupError) {
        setError(signupError.message)
        return
      }

      if (data.user) {
        // Redirect based on role
        if (role === 'gp') {
          router.push('/gp')
        } else {
          router.push('/patient')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-8">
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 400,
            color: 'var(--text)',
            marginBottom: 8,
          }}
        >
          Create your account
        </h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-muted)' }}>
          Sign up to get started with Cerevia
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5">
        {/* Full Name */}
        <div>
          <label
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              display: 'block',
              marginBottom: 6,
            }}
          >
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Dr. Jane Smith"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-s, 8px)',
              border: '1px solid var(--border)',
              fontFamily: 'Nunito, sans-serif',
              fontSize: 14,
              color: 'var(--text)',
              background: 'var(--surface)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              display: 'block',
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-s, 8px)',
              border: '1px solid var(--border)',
              fontFamily: 'Nunito, sans-serif',
              fontSize: 14,
              color: 'var(--text)',
              background: 'var(--surface)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Password */}
        <div>
          <label
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              display: 'block',
              marginBottom: 6,
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-s, 8px)',
              border: '1px solid var(--border)',
              fontFamily: 'Nunito, sans-serif',
              fontSize: 14,
              color: 'var(--text)',
              background: 'var(--surface)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            I am signing up as a:
          </label>
          <div className="flex gap-3">
            {(['patient', 'gp'] as const).map((r) => (
              <label
                key={r}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-s, 8px)',
                  border: `1.5px solid ${role === r ? '#68B8AF' : 'var(--border)'}`,
                  background: role === r ? 'rgba(104,184,175,0.1)' : 'var(--surface)',
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: role === r ? '#68B8AF' : 'var(--text-muted)',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  style={{ marginRight: 6, cursor: 'pointer' }}
                />
                {r === 'patient' ? 'Patient' : 'GP'}
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: 10,
              borderRadius: 'var(--radius-s, 8px)',
              background: 'rgba(220,100,100,0.1)',
              border: '1px solid rgba(220,100,100,0.3)',
              fontFamily: 'Nunito, sans-serif',
              fontSize: 13,
              color: '#dc6464',
            }}
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-pill, 24px)',
            background: loading ? '#6b8b89' : '#68B8AF',
            border: 'none',
            color: 'white',
            fontFamily: 'Nunito, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#4a9990'
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#68B8AF'
          }}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      {/* Login link */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <a
            href="/auth/login"
            style={{
              color: '#68B8AF',
              textDecoration: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign in
          </a>
        </span>
      </div>
    </div>
  )
}
