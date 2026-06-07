import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ResponsiveContainer, ComposedChart,
  Area, Line, Bar,
  XAxis, YAxis, Tooltip, ReferenceArea,
  CartesianGrid, LineChart,
} from 'recharts'
import { useAstraStore } from '@/lib/demo/store'
import { countRecurrences, PATTERN_LABELS } from '@/lib/demo/patterns'
import { aqiLabel, aqiColor, humidityLabel, humidityColor } from '@/lib/demo/env'
import type { PatternEvent, DailyReading, EnvironmentalReading } from '@/lib/demo/types'

const ease = [0.22, 1, 0.36, 1] as const
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease, delay },
})

const WINDOWS = [
  { start: 82, end: 77, label: 'A', color: 'rgba(245,158,11,0.10)' },
  { start: 55, end: 49, label: 'B', color: 'rgba(239,68,68,0.10)'  },
  { start: 22, end: 17, label: 'C', color: 'rgba(245,158,11,0.10)' },
  { start: 4,  end: 0,  label: 'D', color: 'rgba(239,68,68,0.13)'  },
]

const SEVERITY_COLOR = { low: '#22c55e', moderate: '#f59e0b', high: '#ef4444' }
const SEVERITY_BG    = { low: '#dcfce7', moderate: '#fef3c7', high: '#fee2e2' }
const SEVERITY_LABEL = { low: 'Mild', moderate: 'Worth watching', high: 'Needs attention' }

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
function fmtFull(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

function buildChartData(
  readings: DailyReading[],
  env: EnvironmentalReading[],
  days: number,
) {
  const slice = readings.slice(Math.max(0, readings.length - days))
  return slice.map((r) => {
    const e = env.find((x) => x.date === r.date)
    return {
      ...r,
      aqi:      e?.aqi      ?? 40,
      humidity: e?.humidity ?? 50,
      label:    fmt(r.date),
    }
  })
}

function windowDates(readings: DailyReading[], start: number, end: number) {
  const n = readings.length
  const s = readings[Math.max(0, n - 1 - start)]?.date
  const e = readings[Math.min(n - 1, n - 1 - end)]?.date
  return { s, e }
}

function Spark({ data, color = '#6b5ce7', height = 32 }: { data: number[]; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data.map((v) => ({ v }))} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function HealthTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="pt-tooltip">
      <div className="pt-tooltip-date">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="pt-tooltip-row">
          <span className="pt-tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}</span>
          <strong>
            {p.value}
            {p.dataKey === 'sleepDuration' ? 'h' : p.dataKey === 'hrv' ? ' ms' : p.dataKey === 'restingHR' ? ' bpm' : ''}
          </strong>
        </div>
      ))}
    </div>
  )
}

function EnvTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="pt-tooltip">
      <div className="pt-tooltip-date">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="pt-tooltip-row">
          <span className="pt-tooltip-dot" style={{ background: p.color ?? p.fill }} />
          <span>{p.name}</span>
          <strong>{p.value}{p.dataKey === 'humidity' ? '%' : ''}</strong>
        </div>
      ))}
    </div>
  )
}

function PatternCard({ pattern, allPatterns }: { pattern: PatternEvent; allPatterns: PatternEvent[] }) {
  const [open, setOpen] = useState(pattern.isActive)
  const prior = pattern.recurrenceOf ? allPatterns.find((p) => p.id === pattern.recurrenceOf) : null
  countRecurrences(pattern, allPatterns) // kept for side-effects / future use

  return (
    <motion.div
      className={`pt-pattern-card${pattern.isActive ? ' pt-pattern-active' : ''}`}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
    >
      <button className="pt-pattern-header" onClick={() => setOpen((o) => !o)}>
        <div className="pt-pattern-top-row">
          <span className="pt-sev-dot" style={{ background: SEVERITY_COLOR[pattern.severity] }} />
          <span className="pt-pattern-type">{PATTERN_LABELS[pattern.patternType]}</span>
          <span className="pt-sev-pill" style={{ background: SEVERITY_BG[pattern.severity], color: SEVERITY_COLOR[pattern.severity] }}>
            {SEVERITY_LABEL[pattern.severity]}
          </span>
          {pattern.isActive && <span className="pt-active-chip">Active now</span>}
        </div>
        <div className="pt-pattern-meta">
          <span className="pt-pattern-dates">
            {fmtFull(pattern.startDate)}{pattern.endDate ? ` — ${fmtFull(pattern.endDate)}` : ' — Present'}
          </span>
          <span className="pt-pattern-dur">{pattern.durationDays} days</span>
          <span className="pt-expand-icon">{open ? '∧' : '∨'}</span>
        </div>
        <p className="pt-pattern-title">{pattern.title}</p>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-pattern-body">
              <p className="pt-pattern-summary">{pattern.summary}</p>

              {prior && (
                <div className="pt-recurrence-note">
                  ↻ Same trigger as your episode on {fmtFull(prior.startDate)} — Astra recognised it early this time
                </div>
              )}

              <div className="pt-signals-wrap">
                <div className="pt-signals-label">What changed in your body</div>
                <div className="pt-signals-grid">
                  {pattern.supportingSignals.map((s) => (
                    <div key={s.label} className={`pt-sig-pill pt-sig-${s.direction}`}>
                      <span className="pt-sig-arrow">{s.direction === 'up' ? '↑' : s.direction === 'down' ? '↓' : '↕'}</span>
                      <span className="pt-sig-name">{s.label}</span>
                      <strong>{s.change}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-action-block">
                <div className="pt-action-label">What to do</div>
                <p className="pt-action-text">{pattern.suggestedAction}</p>
              </div>

              <div className="pt-confidence-row">
                <div className="pt-conf-track">
                  <div className="pt-conf-fill" style={{ width: `${pattern.confidence}%` }} />
                </div>
                <span className="pt-conf-label">Pattern confidence: {pattern.confidence}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Patterns() {
  const { patterns, readings, env, baseline } = useAstraStore()
  const [range, setRange] = useState<30 | 90>(90)
  const [aqiOpen, setAqiOpen] = useState(false)
  const [humOpen, setHumOpen] = useState(false)

  const chartData = useMemo(() => buildChartData(readings, env, range), [readings, env, range])

  const sorted   = [...patterns].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  const active   = sorted.filter((p) => p.isActive)
  const resolved = sorted.filter((p) => !p.isActive)

  const totalOutside = useMemo(() => {
    if (!baseline.hrv?.mean) return 0
    return readings.filter((r) => r.hrv < baseline.hrv.low || r.restingHR > baseline.restingHR.high).length
  }, [readings, baseline])

  const todayEnv = env[env.length - 1]
  const last14   = env.slice(-14)

  const last7 = readings.slice(-7)
  const avg7  = (k: keyof DailyReading) =>
    Math.round((last7.reduce((s, r) => s + (r[k] as number), 0) / Math.max(last7.length, 1)) * 10) / 10
  const spark30 = (k: keyof DailyReading) => readings.slice(-30).map((r) => r[k] as number)

  const tiles = [
    { key: 'sleepDuration' as const, label: 'Sleep', unit: 'h',    color: '#6b5ce7', desc: 'Hours of sleep per night',       bl: baseline.sleepDuration, higherIsBad: false, lowerIsBad: true  },
    { key: 'hrv'           as const, label: 'Heart rate variability (HRV)', unit: ' ms',  color: '#22c55e', desc: 'Higher = more recovered',       bl: baseline.hrv,          higherIsBad: false, lowerIsBad: true  },
    { key: 'restingHR'     as const, label: 'Resting heart rate',  unit: ' bpm', color: '#f59e0b', desc: 'Lower is usually better',      bl: baseline.restingHR,    higherIsBad: true,  lowerIsBad: false },
    { key: 'steps'         as const, label: 'Daily steps',         unit: '',     color: '#3b82f6', desc: 'Steps walked each day',         bl: baseline.steps,        higherIsBad: false, lowerIsBad: true  },
  ]

  const xInterval = Math.floor(chartData.length / (range === 90 ? 8 : 4))

  const refWindows = WINDOWS.map((w) => ({
    ...w,
    ...windowDates(readings, w.start, w.end),
  })).filter((w) => w.start <= range)

  const firstEvt = patterns.find((p) => p.id === 'evt_001')

  return (
    <div className="pt-root">

      <motion.div className="pt-header" {...fadeUp(0)}>
        <h1 className="pt-title">90-day overview</h1>
        <p className="pt-subtitle">Ahmad · Apple Watch · {range} days</p>
      </motion.div>

      {/* Hero summary */}
      <motion.div className="pt-hero-card" {...fadeUp(0.05)}>
        <div className="pt-hero-left">
          <span className="pt-hero-big-num">{patterns.length}</span>
          <span className="pt-hero-big-label">patterns in 90 days</span>
        </div>
        <div className="pt-hero-divider" />
        <div className="pt-hero-right">
          <div className="pt-hero-stat">
            <span className="pt-hero-stat-val">{totalOutside}</span>
            <span className="pt-hero-stat-lbl">days outside your usual range</span>
          </div>
          <div className="pt-hero-stat">
            <span className="pt-hero-stat-val">{active.length}</span>
            <span className="pt-hero-stat-lbl">currently active</span>
          </div>
          <div className="pt-hero-stat">
            <span className="pt-hero-stat-val">2×</span>
            <span className="pt-hero-stat-lbl">same trigger repeated</span>
          </div>
        </div>
        {firstEvt && (
          <div className="pt-hero-insight">
            💡 The same combination of high pollen and falling pressure that caused your strain in {fmtFull(firstEvt.startDate)} has appeared again — Astra caught it before it peaked this time.
          </div>
        )}
      </motion.div>

      {/* Active alert */}
      {active.map((p) => (
        <motion.div key={p.id} className="pt-active-alert" {...fadeUp(0.1)}>
          <div className="pt-active-top">
            <span className="pt-active-pulse" />
            <span className="pt-active-label">Active right now · {p.durationDays} days in</span>
          </div>
          <div className="pt-active-title">{p.title}</div>
          <p className="pt-active-summary">{p.summary}</p>
          <div className="pt-active-action">
            <span style={{ marginRight: 8, opacity: 0.7 }}>→</span>
            {p.suggestedAction}
          </div>
        </motion.div>
      ))}

      {/* Charts */}
      <motion.div className="pt-charts-card" {...fadeUp(0.15)}>
        <div className="pt-charts-top">
          <div>
            <div className="pt-charts-title">Body signals over time</div>
            <div className="pt-charts-sub">Shaded areas show when Astra detected a pattern</div>
          </div>
          <div className="pt-range-btns">
            <button className={`pt-range-btn${range === 30 ? ' pt-range-active' : ''}`} onClick={() => setRange(30)}>30d</button>
            <button className={`pt-range-btn${range === 90 ? ' pt-range-active' : ''}`} onClick={() => setRange(90)}>90d</button>
          </div>
        </div>

        <div className="pt-legend">
          <span className="pt-leg"><span className="pt-leg-swatch" style={{ background: '#6b5ce7', opacity: 0.7 }} />Sleep (hrs)</span>
          <span className="pt-leg"><span className="pt-leg-swatch" style={{ background: '#22c55e' }} />HRV (ms) — higher is better</span>
          <span className="pt-leg"><span className="pt-leg-swatch" style={{ background: '#f59e0b' }} />Resting HR (bpm) — lower is better</span>
        </div>

        <ResponsiveContainer width="100%" height={190}>
          <ComposedChart data={chartData} syncId="astra" margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.4} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={xInterval} tickLine={false} axisLine={false} />
            <YAxis yAxisId="sl" hide domain={[3, 10.5]} />
            <YAxis yAxisId="hv" hide domain={[10, 85]}  />
            <YAxis yAxisId="hr" hide domain={[44, 95]}  />
            <Tooltip content={<HealthTip />} />
            {refWindows.map((w) =>
              w.s && w.e ? <ReferenceArea key={w.label} yAxisId="hv" x1={fmt(w.s)} x2={fmt(w.e)} fill={w.color} ifOverflow="extendDomain" /> : null
            )}
            <Area yAxisId="sl" type="monotone" dataKey="sleepDuration" name="Sleep"       stroke="#6b5ce7" fill="#6b5ce7" fillOpacity={0.15} strokeWidth={1.5} dot={false} />
            <Line yAxisId="hv" type="monotone" dataKey="hrv"           name="HRV"         stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line yAxisId="hr" type="monotone" dataKey="restingHR"     name="Resting HR"  stroke="#f59e0b" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="pt-legend" style={{ marginTop: 12 }}>
          <span className="pt-leg"><span className="pt-leg-swatch" style={{ background: '#f97316' }} />Air Quality Index — bars</span>
          <span className="pt-leg"><span className="pt-leg-swatch" style={{ background: '#3b82f6' }} />Humidity (%) — line</span>
        </div>

        <ResponsiveContainer width="100%" height={120}>
          <ComposedChart data={chartData} syncId="astra" margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.4} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={xInterval} tickLine={false} axisLine={false} />
            <YAxis yAxisId="aq" hide domain={[0, 220]} />
            <YAxis yAxisId="hu" hide domain={[20, 105]} />
            <Tooltip content={<EnvTip />} />
            {refWindows.map((w) =>
              w.s && w.e ? <ReferenceArea key={w.label} yAxisId="aq" x1={fmt(w.s)} x2={fmt(w.e)} fill={w.color} ifOverflow="extendDomain" /> : null
            )}
            <Bar  yAxisId="aq" dataKey="aqi"      name="Air Quality Index" fill="#f97316" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
            <Line yAxisId="hu" dataKey="humidity"  name="Humidity"         stroke="#3b82f6" strokeWidth={2}   dot={false} />
          </ComposedChart>
        </ResponsiveContainer>

        <p className="pt-chart-note">Hover any point on the chart to see exact numbers. Shaded zones = Astra detected a pattern.</p>
      </motion.div>

      {/* Air quality + humidity cards */}
      <motion.div className="pt-env-row" {...fadeUp(0.2)}>
        <div className="pt-env-card">
          <div className="pt-env-card-top">
            <span className="pt-env-icon">🌫</span>
            <span className="pt-env-card-name">Air quality today</span>
          </div>
          {todayEnv && (
            <>
              <div className="pt-env-big" style={{ color: aqiColor(todayEnv.aqi) }}>
                {todayEnv.aqi} <span className="pt-env-unit">AQI</span>
              </div>
              <div className="pt-env-status-label" style={{ color: aqiColor(todayEnv.aqi) }}>
                {aqiLabel(todayEnv.aqi)}
              </div>
              <div className="pt-env-spark-wrap">
                <Spark data={last14.map((e) => e.aqi)} color={aqiColor(todayEnv.aqi)} />
              </div>
              <div className="pt-env-spark-lbl">Last 14 days</div>
              <button className="pt-env-why-btn" onClick={() => setAqiOpen((o) => !o)}>
                Why this matters for Ahmad {aqiOpen ? '∧' : '∨'}
              </button>
              <AnimatePresence>
                {aqiOpen && (
                  <motion.p className="pt-env-why" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
                    Ahmad has mild asthma. When air quality falls below Acceptable, breathing requires more effort and your body diverts energy away from recovery — which is why you can feel drained even on rest days.
                  </motion.p>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        <div className="pt-env-card">
          <div className="pt-env-card-top">
            <span className="pt-env-icon">💧</span>
            <span className="pt-env-card-name">Humidity today</span>
          </div>
          {todayEnv && (
            <>
              <div className="pt-env-big" style={{ color: humidityColor(todayEnv.humidity) }}>
                {todayEnv.humidity} <span className="pt-env-unit">%</span>
              </div>
              <div className="pt-env-status-label" style={{ color: humidityColor(todayEnv.humidity) }}>
                {humidityLabel(todayEnv.humidity)}
              </div>
              <div className="pt-env-spark-wrap">
                <Spark data={last14.map((e) => e.humidity)} color={humidityColor(todayEnv.humidity)} />
              </div>
              <div className="pt-env-spark-lbl">Last 14 days</div>
              <button className="pt-env-why-btn" onClick={() => setHumOpen((o) => !o)}>
                Why this matters for Ahmad {humOpen ? '∧' : '∨'}
              </button>
              <AnimatePresence>
                {humOpen && (
                  <motion.p className="pt-env-why" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
                    High humidity makes breathing harder through asthma-affected airways. Above 75%, Ahmad's HRV tends to drop within 24 hours — Astra uses this lag to flag risks before you feel them.
                  </motion.p>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>

      {/* Signal tiles */}
      <motion.div {...fadeUp(0.25)}>
        <div className="pt-section-label">Your body signals — 7-day average vs your usual</div>
        <div className="pt-tiles">
          {tiles.map((t) => {
            const avg  = avg7(t.key)
            const bl   = t.bl?.mean ?? 0
            const diff = avg - bl
            const pct  = bl > 0 ? Math.round((diff / bl) * 100) : 0
            const bad  = t.higherIsBad ? diff > 0 : t.lowerIsBad ? diff < 0 : false
            const ok   = Math.abs(pct) < 8
            const sc   = ok ? '#22c55e' : bad ? '#ef4444' : '#f59e0b'
            const sl   = ok ? 'Within your usual range' : bad ? 'Outside your usual range' : 'Slightly off'
            return (
              <div key={t.key} className="pt-tile">
                <div className="pt-tile-header">
                  <span className="pt-tile-name">{t.label}</span>
                  <span className="pt-tile-status-dot" style={{ background: sc }} />
                </div>
                <div className="pt-tile-val" style={{ color: sc }}>{avg}{t.unit}</div>
                <div className="pt-tile-bl">
                  Usual: {bl}{t.unit}
                  {bl > 0 && <span style={{ color: sc, marginLeft: 4, fontWeight: 700 }}>{pct > 0 ? '+' : ''}{pct}%</span>}
                </div>
                <div className="pt-tile-spark"><Spark data={spark30(t.key)} color={t.color} height={28} /></div>
                <div className="pt-tile-status" style={{ color: sc }}>{sl}</div>
                <div className="pt-tile-desc">{t.desc}</div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Pattern cards */}
      <motion.div {...fadeUp(0.3)}>
        {active.length > 0 && (
          <>
            <div className="pt-section-label">Currently active</div>
            {active.map((p) => <PatternCard key={p.id} pattern={p} allPatterns={patterns} />)}
          </>
        )}
        <div className="pt-section-label" style={{ marginTop: 24 }}>Past patterns</div>
        {resolved.map((p) => <PatternCard key={p.id} pattern={p} allPatterns={patterns} />)}
      </motion.div>

      <p className="pt-safety-note">
        These patterns show changes from Ahmad's personal baseline — not population averages. They are for awareness only and are not a diagnosis or medical advice.
      </p>

    </div>
  )
}
