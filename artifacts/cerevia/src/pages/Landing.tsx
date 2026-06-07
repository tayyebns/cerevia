import { Link } from 'wouter'
import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Brain, Stethoscope, Shield, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/Navbar'

const ModelViewer = lazy(() => import('@/components/ModelViewer').then(m => ({ default: m.ModelViewer })))

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar>
        <span className="hidden sm:inline-block text-xs font-semibold px-3 py-1.5 rounded-full border" style={{ background: 'rgba(104,184,175,0.1)', borderColor: '#68B8AF', color: '#4A9990', fontFamily: 'Nunito, sans-serif' }}>
          Cerevia Hackathon Demo
        </span>
        <a href="/auth/login" style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: '#68B8AF', textDecoration: 'none', paddingRight: 4 }}>Sign in</a>
      </Navbar>

      <main className="flex-1 flex items-center px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          <motion.div className="space-y-7" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px, 6vw, 62px)', fontWeight: 300, lineHeight: 1.1, color: 'var(--text)', marginBottom: 16 }}>
                Clarity through{' '}
                <em style={{ fontStyle: 'italic', color: '#68B8AF' }}>treatment.</em>
              </h1>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 460 }}>
                Cerevia assists GPs by summarising months of migraine history in minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ translateY: -3 }} transition={{ duration: 0.2 }}
                  className="flex flex-col items-start gap-3 p-5 rounded-[28px] cursor-pointer"
                  style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow)', minWidth: 200 }}
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)' }}>
                    <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: 'var(--text)', marginBottom: 2 }}>Continue as Patient</div>
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>Track symptoms and medication</div>
                  </div>
                  <div className="flex items-center gap-1" style={{ color: '#68B8AF', fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600 }}>
                    Get started <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </Link>

              <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ translateY: -3 }} transition={{ duration: 0.2 }}
                  className="flex flex-col items-start gap-3 p-5 rounded-[28px] cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #1E433E, #132B28)', border: '1.5px solid #265750', boxShadow: '0 4px 24px rgba(15,22,21,0.28)', minWidth: 200 }}
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(104,184,175,0.2)', border: '1px solid rgba(104,184,175,0.3)' }}>
                    <Stethoscope className="w-5 h-5" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: '#DCEEED', marginBottom: 2 }}>Continue as GP</div>
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA', lineHeight: 1.5 }}>Patient data and AI insights</div>
                  </div>
                  <div className="flex items-center gap-1" style={{ color: '#68B8AF', fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600 }}>
                    Open dashboard <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </Link>
            </div>

            <div className="flex flex-wrap gap-5 pt-1">
              {[
                { icon: Shield, label: 'Data stays on your device' },
                { icon: Brain, label: 'AI consultation summaries' },
                { icon: Stethoscope, label: 'GP-ready health reports' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5" style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)' }}>
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
            className="relative rounded-[28px] overflow-hidden flex items-center justify-center"
            style={{ background: 'linear-gradient(160deg, var(--model-from), var(--model-to))', border: '1px solid rgba(104,184,175,0.18)', boxShadow: '0 8px 40px rgba(15,22,21,0.28)', minHeight: 420 }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 60%, var(--model-glow) 0%, transparent 70%)' }} />
            <Suspense fallback={<div style={{ width: '100%', height: 420, background: 'rgba(104,184,175,0.05)', borderRadius: 28 }} />}>
              <ModelViewer />
            </Suspense>
          </motion.div>
        </div>
      </main>

      <footer className="border-t text-center py-5 px-6 space-y-1" style={{ borderColor: 'var(--border)' }}>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>
          Cerevia organises patient-reported information and does not provide medical advice. Always consult a qualified clinician before making treatment decisions.
        </p>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)' }}>
          Cerevia Hackathon Demo. Built with care for photosensitive users.
        </p>
      </footer>
    </div>
  )
}
