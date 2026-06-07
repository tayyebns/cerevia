import { useMemo, useState } from 'react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'
import { Activity, BookText, Mic, FileText, TrendingDown, TrendingUp, Target, Minus, Sparkles, Loader2 } from 'lucide-react'
import { useDemoData, loadDemoData } from '@/lib/demo/store'
import {
  generateTriggerProfile,
  generateTriggerCoach,
  getTodayExposure,
  getOutcomeSnapshot,
  getProgress,
  getWearableSummary,
} from '@/lib/demo/insights'
import { WearableCard } from '@/components/patient/WearableCard'
import { usePatientAuth } from '@/lib/patient/PatientContext'
import type { RiskLevel } from '@/lib/demo/types'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function riskColor(level: RiskLevel): { bg: string; fg: string } {
  switch (level) {
    case 'Good': return { bg: 'rgba(114,170,121,0.16)', fg: '#4A7A50' }
    case 'Moderate': return { bg: 'rgba(232,168,90,0.16)', fg: '#B07030' }
    case 'Rising': return { bg: 'rgba(232,168,90,0.16)', fg: '#B07030' }
    case 'Needs attention': return { bg: 'rgba(232,168,90,0.20)', fg: '#B07030' }
    case 'High risk': return { bg: 'rgba(192,82,106,0.16)', fg: '#C0526A' }
  }
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.05 },
})

const QUICK = [
  { href: '/patient/triggers', icon: Activity, label: 'Trigger Check-In', color: '#68B8AF' },
  { href: '/patient/log', icon: BookText, label: 'Log Migraine', color: '#C0526A' },
  { href: '/patient/capture', icon: Mic, label: 'Voice Note', color: '#72AA79' },
  { href: '/patient/care', icon: FileText, label: 'GP Summary', color: '#6B7CC4' },
]

function EmptyHome({ firstName, onLoadDemo, loading }: { firstName: string | null; onLoadDemo: () => void; loading: boolean }) {
  return (
    <div className="px-5 py-4 space-y-5">
      <motion.div {...fadeUp(0)}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 2 }}>
          {greeting()}{firstName ? `, ${firstName}` : ''}
        </h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>
          Welcome to Cerevia. Start tracking to build your personal migraine profile.
        </p>
      </motion.div>

      {/* Load Demo Data CTA */}
      <motion.div {...fadeUp(1)}
        className="rounded-[28px] p-6"
        style={{ background: 'linear-gradient(135deg, #1E433E, #265750)', border: '1px solid #2E5E57', boxShadow: '0 8px 28px rgba(15,22,21,0.2)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#8ABFBA', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Explore with sample data
          </span>
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: '#DCEEED', lineHeight: 1.3, marginBottom: 6 }}>
          See how Cerevia works with a demo patient profile
        </p>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA', marginBottom: 20, lineHeight: 1.5 }}>
          Loads 75 days of realistic migraine history, trigger patterns, and insights. No data is sent anywhere — it's local only.
        </p>
        <button
          onClick={onLoadDemo}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-[999px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          style={{ background: '#68B8AF', color: 'white', fontFamily: 'Nunito, sans-serif', fontSize: 14, border: 'none', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 16px rgba(104,184,175,0.35)' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" strokeWidth={2} />}
          {loading ? 'Loading…' : 'Load Demo Data'}
        </button>
      </motion.div>

      {/* Quick actions always visible */}
      <motion.div {...fadeUp(2)}>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Or start tracking now
        </p>
        <div className="grid grid-cols-2 gap-3">
          {QUICK.map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div className="rounded-[20px] border p-4 flex items-center gap-3 min-h-[64px] transition-all duration-200 hover:shadow-md active:scale-95"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 2px 12px rgba(15,22,21,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}1F` }}>
                  <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color }} />
                </div>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center', lineHeight: 1.5, padding: '0 8px' }}>
        Cerevia does not diagnose, prescribe or provide medical advice. It helps organise self-reported migraine and trigger data to support personal management and clinical conversations. If symptoms are severe, sudden or unusual, seek urgent medical advice.
      </p>
    </div>
  )
}

export default function PatientHome() {
  const { firstName } = usePatientAuth()
  const { checkins, migraines, wearable, demoLoaded } = useDemoData()
  const [demoLoading, setDemoLoading] = useState(false)

  const isEmpty = migraines.length === 0 && checkins.length === 0

  const profile = useMemo(() => generateTriggerProfile(checkins, migraines), [checkins, migraines])
  const coach = useMemo(() => generateTriggerCoach(profile, checkins), [profile, checkins])
  const exposure = useMemo(() => getTodayExposure(checkins), [checkins])
  const snap = useMemo(() => getOutcomeSnapshot(migraines), [migraines])
  const progress = useMemo(() => getProgress(profile.primary.key, checkins), [profile, checkins])
  const wearableSummary = useMemo(() => getWearableSummary(wearable), [wearable])

  const DirIcon = snap.direction === 'improving' ? TrendingDown : snap.direction === 'worsening' ? TrendingUp : Minus
  const dirColor = snap.direction === 'improving' ? '#4A7A50' : snap.direction === 'worsening' ? '#C0526A' : '#8AA8A6'

  function handleLoadDemo() {
    setDemoLoading(true)
    setTimeout(() => { loadDemoData(); setDemoLoading(false) }, 300)
  }

  if (isEmpty) {
    return <EmptyHome firstName={firstName} onLoadDemo={handleLoadDemo} loading={demoLoading} />
  }

  return (
    <div className="px-5 py-4 space-y-5">
      <motion.div {...fadeUp(0)}>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 2 }}>
              {greeting()}{firstName ? `, ${firstName}` : ''}
            </h1>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>
              What to focus on today to reduce migraine risk.
            </p>
          </div>
          {demoLoaded && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(232,168,90,0.15)', color: '#B07030', fontFamily: 'Nunito, sans-serif', border: '1px solid rgba(232,168,90,0.25)', whiteSpace: 'nowrap' }}>
              Demo data
            </span>
          )}
        </div>
      </motion.div>

      {/* Today's Trigger Profile */}
      <motion.div {...fadeUp(1)}
        className="rounded-[28px] border p-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 4px 24px rgba(15,22,21,0.08)' }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Today's trigger profile
        </div>
        {exposure.length > 0 ? (
          <div className="space-y-2.5">
            {exposure.map((e) => {
              const c = riskColor(e.level)
              return (
                <div key={e.key} className="flex items-center justify-between">
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{e.label}</span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-subtle)' }}>{e.detail}</span>
                    <span className="px-2.5 py-0.5 rounded-full" style={{ background: c.bg, color: c.fg, fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700 }}>{e.level}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)' }}>
            Complete a <Link href="/patient/triggers" style={{ color: '#68B8AF', textDecoration: 'none', fontWeight: 700 }}>trigger check-in</Link> to see today's profile.
          </p>
        )}
      </motion.div>

      {/* Simulated Apple Watch */}
      <WearableCard summary={wearableSummary} delay={0.1} showNarrative={false} />

      {/* Primary Focus */}
      <motion.div {...fadeUp(2)}
        className="rounded-[24px] p-5"
        style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)', boxShadow: '0 8px 28px rgba(104,184,175,0.35)' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <Target className="w-4 h-4 text-white" strokeWidth={2} />
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Today's focus
          </span>
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: 'white', lineHeight: 1.2, marginBottom: 6 }}>
          {coach.target}
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
          {coach.action}
        </div>
      </motion.div>

      {/* Personal Trigger Summary */}
      <motion.div {...fadeUp(3)}
        className="rounded-[22px] border p-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          Your personal trigger pattern
        </div>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, color: 'var(--text)', lineHeight: 1.5 }}>
          Your strongest trigger pattern is <strong style={{ color: '#68B8AF' }}>{profile.primary.label.toLowerCase()}</strong>
          {profile.secondary[0] && <> followed by <strong style={{ color: '#68B8AF' }}>{profile.secondary[0].label.toLowerCase()}</strong></>}.
        </p>
        <Link href="/patient/insights" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700, color: '#68B8AF' }}>See full trigger intelligence →</span>
        </Link>
      </motion.div>

      {/* Migraine Outcome Snapshot */}
      <motion.div {...fadeUp(4)}
        className="rounded-[22px] border p-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Migraine snapshot · last 30 days
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${dirColor}1A`, color: dirColor, fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700 }}>
            <DirIcon className="w-3 h-3" strokeWidth={2} /> {snap.direction}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: String(snap.migraineDaysThisPeriod), l: 'Migraine days' },
            { v: `${snap.avgSeverity}/10`, l: 'Avg severity' },
            { v: String(snap.daysDisrupted), l: 'Days disrupted' },
          ].map((s) => (
            <div key={s.l} className="rounded-[16px] p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 700, color: '#68B8AF' }}>{s.v}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-subtle)', marginTop: 10 }}>
          {snap.changePct === 0
            ? 'No change vs the previous 30 days.'
            : `${snap.changePct > 0 ? '+' : ''}${snap.changePct}% vs the previous 30 days (${snap.migraineDaysPrevPeriod} days).`}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fadeUp(5)} className="grid grid-cols-2 gap-3">
        {QUICK.map(({ href, icon: Icon, label, color }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div className="rounded-[20px] border p-4 flex items-center gap-3 min-h-[64px] transition-all duration-200 hover:shadow-md active:scale-95"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 2px 12px rgba(15,22,21,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}1F` }}>
                <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color }} />
              </div>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Trigger Management Progress */}
      <motion.div {...fadeUp(6)}
        className="rounded-[22px] border p-5 flex items-center gap-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(114,170,121,0.16)' }}>
          <TrendingDown className="w-6 h-6" strokeWidth={1.5} style={{ color: '#4A7A50' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
            Trigger management progress
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
            {progress.label}
          </div>
        </div>
      </motion.div>

      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center', lineHeight: 1.5, padding: '0 8px' }}>
        Cerevia does not diagnose, prescribe or provide medical advice. It helps organise self-reported migraine and trigger data to support personal management and clinical conversations. If symptoms are severe, sudden or unusual, seek urgent medical advice.
      </p>
    </div>
  )
}
