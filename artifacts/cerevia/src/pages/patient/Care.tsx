import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Bell, FileText, Check, Copy, Moon, Brain, Utensils, Droplets, MonitorSmartphone, Pill, CheckCircle2 } from 'lucide-react'
import { useDemoData, toggleReminder } from '@/lib/demo/store'
import { generateTriggerProfile, generateTriggerCoach, getTriggerGoals, generateGPSummary } from '@/lib/demo/insights'
import type { TriggerReminder } from '@/lib/demo/types'
import { usePatientAuth } from '@/lib/patient/PatientContext'

type Tab = 'coach' | 'reminders' | 'gp'

const reminderIcon: Record<TriggerReminder['type'], typeof Moon> = {
  sleep: Moon, checkin: Bell, meals: Utensils, hydration: Droplets, screen: MonitorSmartphone, medication: Pill, stress: Brain,
}

const goalStatusColor = { met: { bg: 'rgba(114,170,121,0.16)', fg: '#4A7A50' }, on_track: { bg: 'rgba(104,184,175,0.16)', fg: '#4A9990' }, behind: { bg: 'rgba(232,168,90,0.18)', fg: '#B07030' } }
const goalStatusLabel = { met: 'On target', on_track: 'On track', behind: 'Needs focus' }

export default function Care() {
  const { checkins, migraines, reminders } = useDemoData()
  const { firstName } = usePatientAuth()
  const [tab, setTab] = useState<Tab>('coach')
  const [copied, setCopied] = useState(false)

  const profile = useMemo(() => generateTriggerProfile(checkins, migraines), [checkins, migraines])
  const coach = useMemo(() => generateTriggerCoach(profile, checkins), [profile, checkins])
  const goals = useMemo(() => getTriggerGoals(profile, checkins), [profile, checkins])
  const gp = useMemo(() => generateGPSummary(checkins, migraines), [checkins, migraines])

  function copySummary() {
    navigator.clipboard?.writeText(gp.text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const TABS: { key: Tab; label: string; icon: typeof Target }[] = [
    { key: 'coach', label: 'Coach', icon: Target },
    { key: 'reminders', label: 'Reminders', icon: Bell },
    { key: 'gp', label: 'GP Summary', icon: FileText },
  ]

  return (
    <div className="px-5 py-4 space-y-5">
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 2 }}>Care</h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>Turn your patterns into action and clinical conversations.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-[16px]" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[12px] transition-colors"
            style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700, background: tab === key ? 'var(--surface)' : 'transparent', color: tab === key ? '#68B8AF' : 'var(--text-subtle)', boxShadow: tab === key ? '0 2px 8px rgba(15,22,21,0.08)' : 'none', border: 'none', cursor: 'pointer' }}>
            <Icon className="w-4 h-4" strokeWidth={tab === key ? 2 : 1.5} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'coach' && (
          <motion.div key="coach" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
            <div className="rounded-[24px] p-5" style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)', boxShadow: '0 8px 28px rgba(104,184,175,0.35)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="w-4 h-4 text-white" strokeWidth={2} />
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>This week's focus · {coach.triggerLabel}</span>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: 'white', lineHeight: 1.2, marginBottom: 6 }}>{coach.target}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{coach.action}</div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{coach.progressLabel}</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }}>
                  <motion.div className="h-2 rounded-full" style={{ background: 'white' }} initial={{ width: 0 }} animate={{ width: `${(coach.progressDone / coach.progressTotal) * 100}%` }} transition={{ duration: 0.7 }} />
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Why this focus</div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>{coach.why}</p>
            </div>

            <div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Your trigger goals</div>
              <div className="space-y-3">
                {goals.map((g) => {
                  const c = goalStatusColor[g.status]
                  return (
                    <div key={g.triggerKey} className="rounded-[18px] border p-4 flex items-center justify-between" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                      <div>
                        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{g.goalType}</div>
                        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-subtle)' }}>Target {g.targetValue} · {g.currentValue}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.fg, fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700 }}>{goalStatusLabel[g.status]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'reminders' && (
          <motion.div key="reminders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-3">
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)', lineHeight: 1.5 }}>
              Reminders are tied to your trigger-management goals, not just medication times.
            </p>
            {reminders.map((r) => {
              const Icon = reminderIcon[r.type]
              return (
                <div key={r.id} className="rounded-[18px] border p-4 flex items-center gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: r.active ? 'rgba(104,184,175,0.16)' : 'var(--bg)' }}>
                    <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color: r.active ? '#68B8AF' : 'var(--text-subtle)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{r.title}</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#68B8AF' }}>{r.time}</span>
                    </div>
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-subtle)', lineHeight: 1.4 }}>{r.rationale}</div>
                  </div>
                  <button onClick={() => toggleReminder(r.id)} aria-label="toggle reminder"
                    className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors" style={{ background: r.active ? '#68B8AF' : 'var(--border)', border: 'none', cursor: 'pointer' }}>
                    <motion.span className="absolute top-0.5 w-5 h-5 rounded-full bg-white" animate={{ left: r.active ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                  </button>
                </div>
              )
            })}
          </motion.div>
        )}

        {tab === 'gp' && (
          <motion.div key="gp" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
            <div className="rounded-[24px] border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 4px 24px rgba(15,22,21,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  GP summary · {new Date(gp.rangeStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}–{new Date(gp.rangeEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
                <button onClick={copySummary} className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  {copied ? <Check className="w-3.5 h-3.5" style={{ color: '#4A7A50' }} /> : <Copy className="w-3.5 h-3.5" style={{ color: 'var(--text-subtle)' }} />}
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: copied ? '#4A7A50' : 'var(--text-subtle)' }}>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{gp.text}</p>
            </div>

            <div className="rounded-[20px] border p-5 space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>At a glance</div>
              <div className="grid grid-cols-2 gap-2.5">
                <Stat label="Migraine days (60d)" value={String(gp.structured.migraineDays)} />
                <Stat label="Avg severity" value={`${gp.structured.avgSeverity}/10`} />
              </div>
              <div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Top associated triggers</div>
                <div className="flex flex-wrap gap-2">
                  {gp.structured.topTriggers.map((t) => (
                    <span key={t.label} className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(104,184,175,0.14)', color: '#4A9990', fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700 }}>{t.label} · {t.confidence}%</span>
                  ))}
                </div>
              </div>
              <Row label="Medication" value={gp.structured.medication} />
              <Row label="Quality of life" value={gp.structured.qualityOfLife} />
              <Row label="Main concern" value={gp.structured.mainConcern} />
              <div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Suggested discussion areas</div>
                <div className="space-y-1.5">
                  {gp.structured.discussionAreas.map((d) => (
                    <div key={d} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#68B8AF' }} strokeWidth={2} />
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[16px] p-4" style={{ background: 'rgba(107,124,196,0.10)', border: '1px solid rgba(107,124,196,0.2)' }}>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>
                This summary organises {firstName ? `${firstName}'s` : 'your'} self-reported data to support a conversation with a clinician. It is not a diagnosis and does not replace professional medical assessment.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 700, color: '#68B8AF' }}>{value}</div>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)' }}>{label}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)', lineHeight: 1.45 }}>{value}</div>
    </div>
  )
}
