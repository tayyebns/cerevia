import { useEffect, useState } from 'react'
import { useLocation, Link } from 'wouter'
import { Brain, ArrowLeft, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CereviaChat } from '@/components/CereviaChat'
import { LanguagePicker } from '@/components/LanguagePicker'

export default function GPLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation()
  const [gpName, setGpName] = useState<string>('Dr. GP')
  const [practice] = useState<string>('Medical Practice')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getGPInfo = async () => {
      try {
        const { createClient } = await import('@/lib/auth/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata?.full_name) {
          setGpName(user.user_metadata.full_name)
        }
      } catch (err) {
        console.error('Failed to fetch GP info:', err)
      }
      setLoading(false)
    }
    getGPInfo()
  }, [])

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
    <div className="min-h-screen" style={{ background: '#0F1A19' }}>
      <header className="border-b sticky top-0 z-40" style={{ background: 'rgba(19,43,40,0.95)', backdropFilter: 'blur(12px)', borderColor: '#2E5E57' }}>
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-sm" style={{ fontFamily: 'Nunito, sans-serif', color: '#8ABFBA', textDecoration: 'none' }}>
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back
            </Link>
            <div className="w-px h-4" style={{ background: '#2E5E57' }} />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)' }}>
                <Brain className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#68B8AF', letterSpacing: 0.5 }}>Cerevia</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(104,184,175,0.15)', color: '#68B8AF', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
                GP Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguagePicker />
            <div className="w-px h-5" style={{ background: '#2E5E57' }} />
            <ThemeToggle />
            <div className="w-px h-5" style={{ background: '#2E5E57' }} />
            <button onClick={handleLogout} style={{ background: 'rgba(104,184,175,0.1)', color: '#68B8AF', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, borderRadius: 8 }} title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#265750', color: '#68B8AF', fontFamily: 'Nunito, sans-serif' }}>
              {!loading && gpName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: '#DCEEED' }}>{!loading ? gpName : 'Loading...'}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#8ABFBA' }}>{practice}</div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      <CereviaChat role="gp" />
    </div>
  )
}
