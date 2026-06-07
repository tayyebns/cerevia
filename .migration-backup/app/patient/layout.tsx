'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { BottomNav } from '@/components/patient/BottomNav'
import { ThemeToggle } from '@/components/ThemeToggle'

export const dynamic = 'force-dynamic'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { createClient } = await import('@/lib/auth/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name)
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/lib/auth/client')
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto pb-24">
        {/* Header with language bar + theme toggle + logout */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {['EN', 'PL', 'UR', 'PA'].map((lang) => (
              <button
                key={lang}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  background: lang === 'EN' ? '#68B8AF' : 'var(--surface-2)',
                  color: lang === 'EN' ? 'white' : 'var(--text-muted)',
                  border: lang === 'EN' ? 'none' : '1px solid var(--border)',
                }}
              >
                {lang}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {!loading && userName && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-opacity-50 transition-colors"
                style={{
                  background: 'rgba(104,184,175,0.1)',
                  color: '#68B8AF',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <ThemeToggle compact />
          </div>
        </div>
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
