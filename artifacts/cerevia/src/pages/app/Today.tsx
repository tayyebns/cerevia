import { useLocation } from 'wouter'
import { useAstraStore } from '@/lib/demo/store'
import { getActivePattern, countRecurrences, PATTERN_LABELS } from '@/lib/demo/patterns'
import { getEnvForDate, aqiLabel, POLLEN_LABELS, PRESSURE_LABELS, envPatternTrigger } from '@/lib/demo/env'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatToday() {
  const d = new Date()
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

const SEVERITY_COLOR: Record<string, string> = {
  low:      'var(--severity-low)',
  moderate: 'var(--severity-moderate)',
  high:     'var(--severity-high)',
}

function aqiColor(aqi: number): string {
  if (aqi <= 50)  return 'var(--positive)'
  if (aqi <= 100) return 'var(--warning)'
  return 'var(--negative)'
}

function pollenColor(level: string): string {
  if (level === 'low')       return 'var(--positive)'
  if (level === 'moderate')  return 'var(--warning)'
  return 'var(--negative)'
}

function pressureColor(trend: string): string {
  if (trend === 'rising' || trend === 'stable') return 'var(--text-muted)'
  return 'var(--negative)'
}

export default function Today() {
  const { patterns, readings, baseline, env } = useAstraStore()
  const [, navigate] = useLocation()

  const active = getActivePattern(patterns)
  const recurrenceCount = active ? countRecurrences(active, patterns) : 0

  const today = readings[readings.length - 1]
  const todayDate = today?.date
  const todayEnv = todayDate ? getEnvForDate(env, todayDate) : undefined

  const envTrigger = active
    ? envPatternTrigger(env, active.startDate, active.endDate)
    : null

  // Find the earlier pattern with the same environmental trigger (for the recurrence story)
  const matchingEarlierPattern = active?.recurrenceOf
    ? patterns.find((p) => p.id === active.recurrenceOf)
    : undefined

  return (
    <div className="screen-today">
      <div className="today-date">{formatToday()}</div>
      <h1 className="today-greeting">Good morning, Alex.</h1>

      {active ? (
        <>
          {/* Active pattern card */}
          <div className="today-pattern-card">
            <div className="today-pattern-header">
              <div className="today-pattern-type-row">
                <span className="today-pattern-dot" style={{ background: SEVERITY_COLOR[active.severity] }} />
                <span className="today-pattern-type">{PATTERN_LABELS[active.patternType]}</span>
                <span className="today-pattern-active-badge">Active · {active.durationDays} days</span>
              </div>
              <div className="today-pattern-title">{active.title}</div>
            </div>

            <p className="today-pattern-summary">{active.summary}</p>

            {/* Contributing signals */}
            <div className="today-signals">
              {active.supportingSignals.map((s) => (
                <div key={s.label} className="today-signal-pill">
                  <span className={`today-signal-arrow ${s.direction === 'up' ? 'arrow-up' : s.direction === 'down' ? 'arrow-down' : 'arrow-irr'}`}>
                    {s.direction === 'up' ? '↑' : s.direction === 'down' ? '↓' : '↕'}
                  </span>
                  <span className="today-signal-label">{s.label}</span>
                  <span className="today-signal-change">{s.change}</span>
                </div>
              ))}
            </div>

            {/* Recurrence note */}
            {recurrenceCount > 1 && (
              <div className="today-recurrence">
                <span className="today-recurrence-icon">↻</span>
                <span>
                  This pattern has appeared <strong>{recurrenceCount} times</strong> in your history.
                  {matchingEarlierPattern && envTrigger && (
                    <> Same environmental combination ({envTrigger}) appeared each time.</>
                  )}
                </span>
              </div>
            )}

            {/* Confidence */}
            <div className="today-confidence">
              <div className="today-confidence-bar" style={{ width: `${active.confidence}%` }} />
              <span className="today-confidence-label">Pattern confidence {active.confidence}%</span>
            </div>

            {/* Suggested action */}
            <div className="today-action-block">
              <span className="today-action-label">Suggested next step</span>
              <p className="today-action-text">{active.suggestedAction}</p>
            </div>

            {/* CTAs */}
            <div className="today-card-actions">
              <button className="today-btn-primary" onClick={() => navigate('/app/patterns')}>
                See full pattern history
              </button>
              <button className="today-btn-secondary" onClick={() => navigate('/app/note')}>
                Prepare a health note
              </button>
            </div>
          </div>

          {/* Environmental context card */}
          {todayEnv && (
            <div className="today-env-card">
              <div className="today-env-header">
                <span className="today-env-title">Today's environmental factors</span>
                {envTrigger && (
                  <span className="today-env-match-badge">⚠ Matches pattern trigger</span>
                )}
              </div>
              <div className="today-env-grid">
                <div className="today-env-item">
                  <span className="today-env-icon">🌫</span>
                  <div className="today-env-item-body">
                    <span className="today-env-item-label">Air quality</span>
                    <span className="today-env-item-value" style={{ color: aqiColor(todayEnv.aqi) }}>
                      AQI {todayEnv.aqi} — {aqiLabel(todayEnv.aqi)}
                    </span>
                  </div>
                </div>
                <div className="today-env-item">
                  <span className="today-env-icon">🌸</span>
                  <div className="today-env-item-body">
                    <span className="today-env-item-label">Pollen count</span>
                    <span className="today-env-item-value" style={{ color: pollenColor(todayEnv.pollenLevel) }}>
                      {POLLEN_LABELS[todayEnv.pollenLevel]}
                    </span>
                  </div>
                </div>
                <div className="today-env-item">
                  <span className="today-env-icon">📉</span>
                  <div className="today-env-item-body">
                    <span className="today-env-item-label">Barometric pressure</span>
                    <span className="today-env-item-value" style={{ color: pressureColor(todayEnv.pressureTrend) }}>
                      {PRESSURE_LABELS[todayEnv.pressureTrend]}
                    </span>
                  </div>
                </div>
                <div className="today-env-item">
                  <span className="today-env-icon">🌡</span>
                  <div className="today-env-item-body">
                    <span className="today-env-item-label">Feels like</span>
                    <span className="today-env-item-value" style={{ color: 'var(--text)' }}>
                      {todayEnv.heatIndex}°C · {todayEnv.humidity}% humidity
                    </span>
                  </div>
                </div>
              </div>
              {envTrigger && (
                <div className="today-env-insight">
                  <span className="today-env-insight-icon">◎</span>
                  <span>
                    Astra has linked <strong>{envTrigger}</strong> to this pattern type in your history.
                    Your body consistently responds this way to this combination.
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="today-safety">
            This is not a diagnosis. Astra surfaces changes from your personal baseline alongside environmental context. If this pattern continues or concerns you, consider discussing it with a clinician.
          </p>
        </>
      ) : (
        <>
          <div className="today-clear-card">
            <div className="today-clear-icon">✓</div>
            <div className="today-clear-title">Everything looks like your usual baseline today.</div>
            <p className="today-clear-body">Astra hasn't detected any meaningful deviation from your normal patterns. Check back tomorrow or review your pattern history.</p>
            <button className="today-btn-secondary" onClick={() => navigate('/app/patterns')}>
              View past patterns
            </button>
          </div>

          {/* Still show env even on clear days */}
          {todayEnv && (
            <div className="today-env-card">
              <div className="today-env-header">
                <span className="today-env-title">Today's environment</span>
              </div>
              <div className="today-env-grid">
                <div className="today-env-item">
                  <span className="today-env-icon">🌫</span>
                  <div className="today-env-item-body">
                    <span className="today-env-item-label">Air quality</span>
                    <span className="today-env-item-value" style={{ color: aqiColor(todayEnv.aqi) }}>
                      AQI {todayEnv.aqi} — {aqiLabel(todayEnv.aqi)}
                    </span>
                  </div>
                </div>
                <div className="today-env-item">
                  <span className="today-env-icon">🌸</span>
                  <div className="today-env-item-body">
                    <span className="today-env-item-label">Pollen</span>
                    <span className="today-env-item-value" style={{ color: pollenColor(todayEnv.pollenLevel) }}>
                      {POLLEN_LABELS[todayEnv.pollenLevel]}
                    </span>
                  </div>
                </div>
                <div className="today-env-item">
                  <span className="today-env-icon">📉</span>
                  <div className="today-env-item-body">
                    <span className="today-env-item-label">Pressure</span>
                    <span className="today-env-item-value" style={{ color: pressureColor(todayEnv.pressureTrend) }}>
                      {PRESSURE_LABELS[todayEnv.pressureTrend]}
                    </span>
                  </div>
                </div>
                <div className="today-env-item">
                  <span className="today-env-icon">🌡</span>
                  <div className="today-env-item-body">
                    <span className="today-env-item-label">Feels like</span>
                    <span className="today-env-item-value">{todayEnv.heatIndex}°C</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Today's snapshot */}
      {today && (
        <div className="today-snapshot">
          <div className="today-snapshot-title">Today's readings</div>
          <div className="today-snapshot-grid">
            {[
              { label: 'Sleep',      value: `${today.sleepDuration}h`,    base: `${baseline.sleepDuration.mean}h typical` },
              { label: 'Resting HR', value: `${today.restingHR} bpm`,     base: `${baseline.restingHR.mean} typical` },
              { label: 'HRV',        value: `${today.hrv} ms`,            base: `${baseline.hrv.mean} typical` },
              { label: 'Steps',      value: today.steps.toLocaleString(), base: `${baseline.steps.mean.toLocaleString()} typical` },
            ].map((item) => (
              <div key={item.label} className="today-snapshot-item">
                <span className="today-snapshot-label">{item.label}</span>
                <span className="today-snapshot-value">{item.value}</span>
                <span className="today-snapshot-base">{item.base}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AstraBand teaser */}
      <div className="today-band-teaser">
        <div className="today-band-teaser-left">
          <span className="today-band-teaser-badge">Coming soon</span>
          <div className="today-band-teaser-name">AstraBand</div>
          <div className="today-band-teaser-desc">Our own passive wearable — capturing environmental + body signals existing devices miss, all day and night.</div>
        </div>
        <div className="today-band-teaser-icon">◌</div>
      </div>
    </div>
  )
}
