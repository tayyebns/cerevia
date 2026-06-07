import { useLocation } from 'wouter'
import { useAstraStore } from '@/lib/demo/store'
import { getActivePattern, countRecurrences, PATTERN_LABELS } from '@/lib/demo/patterns'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatToday() {
  const d = new Date()
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

const SEVERITY_COLOR: Record<string, string> = {
  low:      'var(--severity-low)',
  moderate: 'var(--severity-moderate)',
  high:     'var(--severity-high)',
}

export default function Today() {
  const { patterns, readings, baseline } = useAstraStore()
  const [, navigate] = useLocation()

  const active = getActivePattern(patterns)
  const recurrenceCount = active ? countRecurrences(active, patterns) : 0

  // Today's readings (last entry)
  const today = readings[readings.length - 1]

  return (
    <div className="screen-today">
      {/* Date */}
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
                <span>This pattern has appeared <strong>{recurrenceCount} times</strong> in your history.</span>
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

          {/* Safety note */}
          <p className="today-safety">
            This is not a diagnosis. Astra surfaces changes from your personal baseline. If this pattern continues or concerns you, consider discussing it with a clinician.
          </p>
        </>
      ) : (
        <div className="today-clear-card">
          <div className="today-clear-icon">✓</div>
          <div className="today-clear-title">Everything looks like your usual baseline today.</div>
          <p className="today-clear-body">Astra hasn't detected any meaningful deviation from your normal patterns. Check back tomorrow or review your pattern history.</p>
          <button className="today-btn-secondary" onClick={() => navigate('/app/patterns')}>
            View past patterns
          </button>
        </div>
      )}

      {/* Today's snapshot */}
      {today && (
        <div className="today-snapshot">
          <div className="today-snapshot-title">Today's readings</div>
          <div className="today-snapshot-grid">
            {[
              { label: 'Sleep',      value: `${today.sleepDuration}h`,       base: `${baseline.sleepDuration.mean}h typical` },
              { label: 'Resting HR', value: `${today.restingHR} bpm`,        base: `${baseline.restingHR.mean} typical` },
              { label: 'HRV',        value: `${today.hrv} ms`,               base: `${baseline.hrv.mean} typical` },
              { label: 'Steps',      value: today.steps.toLocaleString(),    base: `${baseline.steps.mean.toLocaleString()} typical` },
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
          <div className="today-band-teaser-desc">Our own passive wearable — capturing the signals existing devices miss.</div>
        </div>
        <div className="today-band-teaser-icon">◌</div>
      </div>
    </div>
  )
}
