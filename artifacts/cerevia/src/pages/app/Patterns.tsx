import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAstraStore } from '@/lib/demo/store'
import type { PatternEvent, DailyReading, UserBaseline } from '@/lib/demo/types'

const ease = [0.22, 1, 0.36, 1] as const
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease, delay },
})

function dayQuality(r: DailyReading, bl: UserBaseline): 'good' | 'off' | 'rough' {
  const bad = [
    r.hrv          < (bl.hrv?.low          ?? 0),
    r.restingHR    > (bl.restingHR?.high   ?? 999),
    r.sleepDuration < (bl.sleepDuration?.low ?? 0),
  ].filter(Boolean).length
  if (bad >= 2) return 'rough'
  if (bad === 1) return 'off'
  return 'good'
}

const DOT = {
  good:  { color: '#16a34a', label: 'Good' },
  off:   { color: '#d97706', label: 'Off' },
  rough: { color: '#dc2626', label: 'Rough' },
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function fmtAgo(iso: string): string {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.round(days / 7)
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  return fmtShort(iso)
}

const SEV_COLOR = { low: '#16a34a', moderate: '#d97706', high: '#dc2626' }

function PatternCard({ p, index }: { p: PatternEvent; index: number }) {
  const [open, setOpen] = useState(p.isActive)

  const dateLabel = p.isActive
    ? `Started ${fmtAgo(p.startDate)} · still active`
    : `${fmtShort(p.startDate)}${p.endDate ? ` – ${fmtShort(p.endDate)}` : ''} · ${p.durationDays} days`

  return (
    <motion.div
      {...fadeUp(0.05 * index)}
      style={{
        background: p.isActive ? 'rgba(234,88,12,0.06)' : 'var(--card-bg)',
        border: `1px solid ${p.isActive ? 'rgba(234,88,12,0.22)' : 'var(--border-color)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 10,
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: SEV_COLOR[p.severity], flexShrink: 0 }} />
          {p.isActive && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#ea580c',
              background: 'rgba(234,88,12,0.12)', borderRadius: 99, padding: '2px 8px', letterSpacing: '0.05em',
            }}>HAPPENING NOW</span>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {open ? '∧' : '∨'}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 400, color: 'var(--text)', lineHeight: 1.35, marginBottom: 4 }}>
          {p.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{dateLabel}</div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 14px' }}>
                {p.summary}
              </p>
              <div style={{
                background: 'var(--bg)',
                borderRadius: 12,
                padding: '12px 14px',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.05em', marginBottom: 5 }}>
                  WHAT TO DO
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                  {p.suggestedAction}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Patterns() {
  const { patterns, readings, baseline } = useAstraStore()

  const sorted = [...patterns].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  const active = sorted.find(p => p.isActive)

  const dots = readings.map(r => ({ date: r.date, q: dayQuality(r, baseline) }))
  const weeks: typeof dots[number][][] = []
  for (let i = 0; i < dots.length; i += 7) weeks.push(dots.slice(i, i + 7))

  const roughCount = dots.filter(d => d.q === 'rough').length
  const goodCount  = dots.filter(d => d.q === 'good').length

  return (
    <div style={{ padding: '20px 16px 100px', maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <motion.div {...fadeUp(0)} style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, color: 'var(--text)', margin: '0 0 4px' }}>
          Your last 90 days
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Ahmad · Apple Watch</p>
      </motion.div>

      {/* Active alert */}
      {active && (
        <motion.div {...fadeUp(0.05)} style={{
          background: 'rgba(234,88,12,0.07)',
          border: '1px solid rgba(234,88,12,0.22)',
          borderRadius: 16,
          padding: 18,
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#ea580c', flexShrink: 0,
              animation: 'badge-pulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', letterSpacing: '0.05em' }}>
              ASTRA NOTICED SOMETHING
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.35 }}>
            {active.title}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.65 }}>
            {active.summary}
          </p>
          <div style={{ background: 'rgba(234,88,12,0.1)', borderRadius: 10, padding: '10px 14px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ea580c' }}>What to do → </span>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>{active.suggestedAction}</span>
          </div>
        </motion.div>
      )}

      {/* Week timeline */}
      <motion.div {...fadeUp(0.1)} style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
      }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, color: 'var(--text)', marginBottom: 2 }}>
            90 days, week by week
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {goodCount} good days · {roughCount} rough days
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          {(['good', 'off', 'rough'] as const).map(q => (
            <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: DOT[q].color, display: 'inline-block', opacity: 0.8 }} />
              {DOT[q].label}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {weeks.map((week, wi) => {
            const weekStart = week[0]?.date
            const weekEnd   = week[week.length - 1]?.date
            const label = weekStart
              ? new Date(weekStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
              : ''
            // find any pattern that overlaps this week
            const event = sorted.find(p =>
              weekStart && weekEnd &&
              p.startDate <= weekEnd &&
              (p.endDate ? p.endDate >= weekStart : true)
            )
            const hasRough = week.some(d => d.q === 'rough')
            return (
              <div key={wi}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    width: 44, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {label}
                  </span>
                  <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                    {week.map((d, di) => (
                      <div
                        key={di}
                        title={`${d.date} · ${DOT[d.q].label}`}
                        style={{
                          flex: 1, height: 18, borderRadius: 4,
                          background: DOT[d.q].color,
                          opacity: d.q === 'good' ? 0.4 : d.q === 'off' ? 0.65 : 0.85,
                        }}
                      />
                    ))}
                  </div>
                </div>
                {event && hasRough && (
                  <div style={{
                    marginLeft: 52, marginTop: 4, marginBottom: 2,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{
                      width: 1, height: 28, background: 'var(--border-color)',
                      display: 'inline-block', flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 11, color: event.isActive ? '#ea580c' : 'var(--text-muted)',
                      lineHeight: 1.4,
                    }}>
                      {event.title}
                      {event.isActive && <span style={{
                        marginLeft: 6, fontSize: 10, fontWeight: 600,
                        color: '#ea580c', background: 'rgba(234,88,12,0.1)',
                        padding: '1px 6px', borderRadius: 99,
                      }}>now</span>}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Pattern cards */}
      <motion.div {...fadeUp(0.15)}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 12 }}>
          WHAT ASTRA NOTICED
        </div>
        {sorted.map((p, i) => <PatternCard key={p.id} p={p} index={i} />)}
      </motion.div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.45, textAlign: 'center', lineHeight: 1.5, marginTop: 16 }}>
        Based on Ahmad's personal baseline. For awareness only - not a diagnosis or medical advice.
      </p>

    </div>
  )
}
