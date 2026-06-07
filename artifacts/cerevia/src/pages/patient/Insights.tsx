import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Sparkles, Send, TrendingDown, TrendingUp, Minus, GitMerge, Activity } from 'lucide-react'
import { useDemoData } from '@/lib/demo/store'
import { generateTriggerProfile, getOutcomeSnapshot, answerAskCerevia, getWearableSummary, ASK_SUGGESTIONS } from '@/lib/demo/insights'
import { WearableCard } from '@/components/patient/WearableCard'
import type { AssociationStrength } from '@/lib/demo/types'

function strengthColor(s: AssociationStrength): string {
  switch (s) {
    case 'Very strong': return '#C0526A'
    case 'Strong': return '#E8A85A'
    case 'Moderate': return '#68B8AF'
    case 'Weak': return '#8AA8A6'
    case 'Unclear': return '#A9C4C1'
  }
}

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}
      className="rounded-[24px] border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 4px 24px rgba(15,22,21,0.06)' }}>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      {children}
    </motion.div>
  )
}

export default function Insights() {
  const { checkins, migraines, wearable } = useDemoData()
  const profile = useMemo(() => generateTriggerProfile(checkins, migraines), [checkins, migraines])
  const snap = useMemo(() => getOutcomeSnapshot(migraines), [migraines])
  const wearableSummary = useMemo(() => getWearableSummary(wearable), [wearable])

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)

  function ask(q: string) {
    const query = q.trim()
    if (!query) return
    setAnswer(answerAskCerevia(query, checkins, migraines))
    setQuestion(query)
  }

  // Migraine-days trend across recent windows (oldest → newest)
  const trend = useMemo(() => {
    const now = new Date()
    const dayDiff = (d: string) => Math.round((now.getTime() - new Date(d).getTime()) / 86400000)
    return [
      { label: '60–90d', count: migraines.filter((m) => dayDiff(m.date) > 60 && dayDiff(m.date) <= 90).length },
      { label: '30–60d', count: migraines.filter((m) => dayDiff(m.date) > 30 && dayDiff(m.date) <= 60).length },
      { label: '7–30d', count: migraines.filter((m) => dayDiff(m.date) > 7 && dayDiff(m.date) <= 30).length },
      { label: 'This wk', count: migraines.filter((m) => dayDiff(m.date) <= 7).length },
    ]
  }, [migraines])

  const DirIcon = snap.direction === 'improving' ? TrendingDown : snap.direction === 'worsening' ? TrendingUp : Minus
  const dirColor = snap.direction === 'improving' ? '#4A7A50' : snap.direction === 'worsening' ? '#C0526A' : '#8AA8A6'

  return (
    <div className="px-5 py-4 space-y-4">
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 2 }}>Trigger Intelligence</h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>Your personal migraine patterns, based on your logs.</p>
      </div>

      {/* Personal Trigger Profile + Confidence */}
      <Section title="Personal trigger profile" delay={0.02}>
        <div className="space-y-3.5">
          {profile.all.map((t) => (
            <div key={t.key}>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{t.label}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full" style={{ background: `${strengthColor(t.strength)}22`, color: strengthColor(t.strength), fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700 }}>{t.strength}</span>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text)', width: 38, textAlign: 'right' }}>{t.confidence}%</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'var(--bg)' }}>
                <motion.div className="h-2 rounded-full" style={{ background: strengthColor(t.strength) }}
                  initial={{ width: 0 }} animate={{ width: `${t.confidence}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)', marginTop: 12, lineHeight: 1.5 }}>
          These reflect patterns in your logged data - they are not medical certainty.
        </p>
      </Section>

      {/* Simulated Apple Watch - supports trigger intelligence */}
      <WearableCard summary={wearableSummary} delay={0.04} />

      {/* Pattern Explanation */}
      <Section title="What this means" delay={0.06}>
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(104,184,175,0.16)' }}>
            <Activity className="w-4.5 h-4.5" strokeWidth={1.5} style={{ color: '#68B8AF', width: 18, height: 18 }} />
          </div>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, color: 'var(--text)', lineHeight: 1.55 }}>{profile.primary.explanation}</p>
        </div>
      </Section>

      {/* What Has Changed */}
      {profile.whatChanged && (
        <Section title="What has changed" delay={0.1}>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, color: 'var(--text)', lineHeight: 1.55 }}>{profile.whatChanged}</p>
        </Section>
      )}

      {/* Trigger Combinations */}
      {profile.combination && (
        <Section title="Trigger combinations" delay={0.12}>
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(192,82,106,0.14)' }}>
              <GitMerge className="w-4.5 h-4.5" strokeWidth={1.5} style={{ color: '#C0526A', width: 18, height: 18 }} />
            </div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, color: 'var(--text)', lineHeight: 1.55 }}>{profile.combination}</p>
          </div>
        </Section>
      )}

      {/* Migraine Outcome Trend */}
      <Section title="Migraine outcome trend" delay={0.14}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)' }}>Migraine days per period</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${dirColor}1A`, color: dirColor, fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700 }}>
            <DirIcon className="w-3 h-3" strokeWidth={2} /> {snap.direction}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8AA8A6', fontFamily: 'Nunito, sans-serif' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#8AA8A6', fontFamily: 'Nunito, sans-serif' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 12, fontFamily: 'Nunito, sans-serif', background: 'var(--surface)' }} cursor={{ fill: 'rgba(104,184,175,0.08)' }} />
            <Bar dataKey="count" name="Migraine days" radius={[6, 6, 0, 0]}>
              {trend.map((_, i) => <Cell key={i} fill={i === trend.length - 1 ? '#72AA79' : '#68B8AF'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Ask Cerevia */}
      <Section title="Ask Cerevia" delay={0.16}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" strokeWidth={2} style={{ color: '#68B8AF' }} />
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)' }}>Ask about your own logged data</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {ASK_SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{ fontFamily: 'Nunito, sans-serif', background: 'var(--bg)', color: 'var(--text-subtle)', border: '1px solid var(--border)', cursor: 'pointer' }}>{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') ask(question) }}
            placeholder="Type a question…" className="flex-1 px-4 py-2.5 text-sm rounded-full border"
            style={{ fontFamily: 'Nunito, sans-serif', borderColor: 'var(--border)', outline: 'none', color: 'var(--text)', background: 'var(--bg)' }} />
          <button onClick={() => ask(question)} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)', border: 'none', cursor: 'pointer' }}>
            <Send className="w-4 h-4 text-white" strokeWidth={2} />
          </button>
        </div>
        {answer && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-[16px] p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text)', lineHeight: 1.55 }}>{answer}</p>
          </motion.div>
        )}
      </Section>

      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center', lineHeight: 1.5, padding: '0 8px' }}>
        Cerevia organises self-reported data to surface personal patterns. It does not diagnose or provide medical advice.
      </p>
    </div>
  )
}
