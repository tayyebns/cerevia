import { useAstraStore } from '@/lib/demo/store'
import { countRecurrences, PATTERN_LABELS, PATTERN_DESCRIPTIONS } from '@/lib/demo/patterns'
import type { PatternEvent } from '@/lib/demo/types'
import { useState } from 'react'

const SEVERITY_COLOR: Record<string, string> = {
  low:      'var(--severity-low)',
  moderate: 'var(--severity-moderate)',
  high:     'var(--severity-high)',
}

const SEVERITY_BG: Record<string, string> = {
  low:      'var(--severity-low-bg)',
  moderate: 'var(--severity-moderate-bg)',
  high:     'var(--severity-high-bg)',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function PatternCard({ pattern, allPatterns }: { pattern: PatternEvent; allPatterns: PatternEvent[] }) {
  const [expanded, setExpanded] = useState(false)
  const recurrences = countRecurrences(pattern, allPatterns)

  return (
    <div className={`pattern-card ${pattern.isActive ? 'pattern-card-active' : ''}`}>
      <div className="pattern-card-header" onClick={() => setExpanded((e) => !e)}>
        <div className="pattern-card-top">
          <span className="pattern-severity-dot" style={{ background: SEVERITY_COLOR[pattern.severity] }} />
          <span className="pattern-type-label">{PATTERN_LABELS[pattern.patternType]}</span>
          {pattern.isActive && <span className="pattern-active-chip">Active</span>}
          {recurrences > 1 && (
            <span className="pattern-recurrence-chip">↻ {recurrences}× recurrence</span>
          )}
        </div>
        <div className="pattern-card-meta">
          <span className="pattern-date-range">
            {formatDate(pattern.startDate)}
            {pattern.endDate ? ` – ${formatDate(pattern.endDate)}` : ' – Present'}
          </span>
          <span className="pattern-duration">{pattern.durationDays} days</span>
          <span className="pattern-expand-toggle">{expanded ? '∧' : '∨'}</span>
        </div>
      </div>

      {expanded && (
        <div className="pattern-card-body">
          <p className="pattern-summary">{pattern.summary}</p>

          <div className="pattern-signals">
            <div className="pattern-signals-title">Contributing signals</div>
            {pattern.supportingSignals.map((s) => (
              <div key={s.label} className="pattern-signal-row">
                <span className={`pattern-signal-dir ${s.direction === 'up' ? 'dir-up' : s.direction === 'down' ? 'dir-down' : 'dir-irr'}`}>
                  {s.direction === 'up' ? '↑' : s.direction === 'down' ? '↓' : '↕'}
                </span>
                <span className="pattern-signal-name">{s.label}</span>
                <span className="pattern-signal-change">{s.change}</span>
              </div>
            ))}
          </div>

          <div className="pattern-action-block">
            <span className="pattern-action-label">Suggested action at the time</span>
            <p className="pattern-action-text">{pattern.suggestedAction}</p>
          </div>

          <div className="pattern-confidence">
            Pattern confidence: <strong>{pattern.confidence}%</strong>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Patterns() {
  const { patterns } = useAstraStore()

  const sorted = [...patterns].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )

  const active    = sorted.filter((p) => p.isActive)
  const resolved  = sorted.filter((p) => !p.isActive)

  return (
    <div className="screen-patterns">
      <h1 className="screen-title">Pattern History</h1>
      <p className="screen-subtitle">
        Recurring changes detected from your personal baseline. Tap any entry to expand.
      </p>

      {/* What changed summary */}
      <div className="patterns-what-changed">
        <div className="what-changed-title">What changed — last 90 days</div>
        <div className="what-changed-grid">
          <div className="what-changed-item">
            <span className="wc-value">{patterns.length}</span>
            <span className="wc-label">patterns detected</span>
          </div>
          <div className="what-changed-item">
            <span className="wc-value">{active.length}</span>
            <span className="wc-label">currently active</span>
          </div>
          <div className="what-changed-item">
            <span className="wc-value">3</span>
            <span className="wc-label">pattern types seen</span>
          </div>
          <div className="what-changed-item">
            <span className="wc-value">2</span>
            <span className="wc-label">recurrences of same type</span>
          </div>
        </div>
      </div>

      {active.length > 0 && (
        <section className="patterns-section">
          <div className="patterns-section-label">Currently active</div>
          {active.map((p) => (
            <PatternCard key={p.id} pattern={p} allPatterns={patterns} />
          ))}
        </section>
      )}

      <section className="patterns-section">
        <div className="patterns-section-label">Resolved</div>
        {resolved.map((p) => (
          <PatternCard key={p.id} pattern={p} allPatterns={patterns} />
        ))}
      </section>

      {/* Pattern categories reference */}
      <div className="patterns-categories">
        <div className="patterns-categories-title">Pattern categories Astra monitors</div>
        {(Object.entries(PATTERN_DESCRIPTIONS) as [string, string][]).map(([key, desc]) => (
          <div key={key} className="patterns-category-row">
            <span className="patterns-category-name">{PATTERN_LABELS[key as keyof typeof PATTERN_LABELS]}</span>
            <span className="patterns-category-desc">{desc}</span>
          </div>
        ))}
      </div>

      <p className="screen-safety">
        Astra does not diagnose. These are changes from your personal baseline, not medical conclusions. This is not medical advice.
      </p>
    </div>
  )
}
