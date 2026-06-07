import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { LogOut } from 'lucide-react'
import { BottomNav } from '@/components/patient/BottomNav'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CereviaChat } from '@/components/CereviaChat'
import { LanguagePicker } from '@/components/LanguagePicker'
import { PatientAuthContext } from '@/lib/patient/PatientContext'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation()
  const [userName, setUserName] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const hasSupabase = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  )

  useEffect(() => {
    if (!hasSupabase) { setLoading(false); return }
    const init = async () => {
      try {
        const { createClient } = await import('@/lib/auth/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const full = user.user_metadata?.full_name ?? null
          setUserName(full)
          setFirstName(full ? full.split(' ')[0] : null)
          setUserId(user.id)

          const { ensurePatientRecord } = await import('@/lib/supabase/db')
          const patient = await ensurePatientRecord(user.id)
          if (patient) setPatientId(patient.id)
        }
      } catch (err) {
        console.error('PatientLayout init error:', err)
      }
      setLoading(false)
    }
    init()
  }, [hasSupabase])

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/lib/auth/client')
      const supabase = createClient()
      await supabase.auth.signOut()
      setLocation('/auth/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <PatientAuthContext.Provider value={{ userName, firstName, patientId, userId, hasSupabase }}>
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="max-w-lg mx-auto pb-24">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <LanguagePicker compact />
            <div className="flex items-center gap-3">
              {!loading && userName && (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full transition-colors"
                  style={{ background: 'rgba(104,184,175,0.1)', color: '#68B8AF', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
        <CereviaChat role="patient" />
      </div>
    </PatientAuthContext.Provider>
  )
}
