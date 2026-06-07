import { useLocation } from 'wouter'
import { loadDemoData } from '@/lib/demo/store'

const FEATURES = [
  { icon: '◎', label: 'Passive pattern detection', desc: 'No forms. No dashboards. Astra observes while you live.' },
  { icon: '⌁', label: 'Personal baseline engine', desc: 'Learns what normal looks like for you — not a population average.' },
  { icon: '↻', label: 'Recurrence detection', desc: 'Notices when the same cluster of changes has appeared before.' },
  { icon: '⊞', label: 'Multi-signal interpretation', desc: 'Cross-references sleep, heart rate, HRV and activity together.' },
  { icon: '⌘', label: 'Decision fatigue reduction', desc: 'One clear priority per day. Nothing else unless it matters.' },
  { icon: '⊡', label: 'Clinician-ready health notes', desc: 'Optional export you own — never sent without your permission.' },
]

const COMPARISONS = [
  { label: 'Daily mandatory logs',       astra: '0',                   others: 'Many' },
  { label: 'Manual tracking required',   astra: 'Never',               others: 'Always' },
  { label: 'Clear health priority',      astra: '1 per day',           others: 'Dozens of charts' },
  { label: 'Passive wearable (future)',  astra: 'AstraBand',           others: 'None' },
  { label: 'Clinician export',           astra: 'Optional, user-owned', others: 'Not available' },
]

export default function Landing() {
  const [, navigate] = useLocation()

  function handleTryDemo() {
    loadDemoData()
    navigate('/app')
  }

  return (
    <div className="landing-root">
      {/* Nav */}
      <nav className="landing-nav">
        <span className="landing-logo">Astra</span>
        <div className="landing-nav-links">
          <button className="landing-nav-link" onClick={handleTryDemo}>Try demo</button>
          <a href="/auth/signup" className="landing-nav-cta">Get early access</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-badge">Passive Health Pattern Intelligence</div>
        <h1 className="landing-h1">
          Your wearable tracks.<br />
          <span className="landing-h1-accent">Astra tells you what changed.</span>
        </h1>
        <p className="landing-hero-sub">
          No forms. No dashboards. No guessing. Connect your existing wearable — Astra learns your personal baseline, detects meaningful patterns, and gives you one clear priority each day.
        </p>
        <div className="landing-hero-actions">
          <button className="landing-cta-primary" onClick={handleTryDemo}>
            Try the demo →
          </button>
          <a href="/auth/signup" className="landing-cta-secondary">
            Get early access
          </a>
        </div>

        {/* Stats strip */}
        <div className="landing-stats">
          <div className="landing-stat">
            <span className="landing-stat-value">0</span>
            <span className="landing-stat-label">daily mandatory logs</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-value">1</span>
            <span className="landing-stat-label">clear priority per day</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-value">Future</span>
            <span className="landing-stat-label">AstraBand — our own passive wearable</span>
          </div>
        </div>
      </section>

      {/* What Astra does */}
      <section className="landing-section">
        <h2 className="landing-section-title">Built around a different thesis</h2>
        <p className="landing-section-sub">
          People do not want to track their health. They want to understand what is changing in their body without becoming data-entry clerks.
        </p>
        <div className="landing-features-grid">
          {FEATURES.map((f) => (
            <div key={f.label} className="landing-feature-card">
              <span className="landing-feature-icon">{f.icon}</span>
              <div>
                <div className="landing-feature-label">{f.label}</div>
                <div className="landing-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="landing-section landing-section-alt">
        <h2 className="landing-section-title">How it works</h2>
        <div className="landing-steps">
          {[
            { n: '01', title: 'Connect once',   body: 'Grant permission to Apple Health or Google Health Connect. Astra reads only what it needs and explains why each signal is used.' },
            { n: '02', title: 'Astra observes', body: 'For 7–14 days Astra quietly builds your personal baseline — what normal looks like for you specifically, not a population.' },
            { n: '03', title: 'Patterns surface', body: 'When a meaningful cluster of changes repeats, Astra explains it in plain language with one clear suggested next step.' },
            { n: '04', title: 'You decide',     body: 'Dismiss it, note it, or generate a clinician-ready health summary. Everything is yours. Nothing is sent automatically.' },
          ].map((s) => (
            <div key={s.n} className="landing-step">
              <span className="landing-step-n">{s.n}</span>
              <div>
                <div className="landing-step-title">{s.title}</div>
                <div className="landing-step-body">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="landing-section">
        <h2 className="landing-section-title">What others skip</h2>
        <div className="landing-compare-table">
          <div className="landing-compare-header">
            <span />
            <span className="landing-compare-col-label astra-col">Astra</span>
            <span className="landing-compare-col-label">Others</span>
          </div>
          {COMPARISONS.map((row) => (
            <div key={row.label} className="landing-compare-row">
              <span className="landing-compare-feature">{row.label}</span>
              <span className="landing-compare-astra">{row.astra}</span>
              <span className="landing-compare-other">{row.others}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AstraBand */}
      <section className="landing-section landing-band-section">
        <div className="landing-band-card">
          <div className="landing-band-left">
            <div className="landing-band-badge">Coming soon</div>
            <h2 className="landing-band-title">AstraBand</h2>
            <p className="landing-band-body">
              A passive health pattern band designed for continuous wear. Not a smartwatch. No notifications. No fitness scores. Just the signals that existing wearables miss — captured quietly, all day and night.
            </p>
            <ul className="landing-band-bullets">
              <li>Continuous skin temperature trend</li>
              <li>Autonomic strain context</li>
              <li>Movement deterioration tracking</li>
              <li>Long battery life — designed for 24/7 wear</li>
              <li>Zero interaction required</li>
            </ul>
            <p className="landing-band-note">
              The software intelligence layer comes first. AstraBand captures the signals existing devices cannot.
            </p>
          </div>
          <div className="landing-band-visual">
            <div className="landing-band-ring">
              <div className="landing-band-ring-inner">
                <span className="landing-band-ring-label">AstraBand</span>
                <span className="landing-band-ring-sub">2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-section landing-final-cta">
        <h2 className="landing-final-title">Start understanding your patterns</h2>
        <p className="landing-final-sub">No forms. No dashboards. Just what changed.</p>
        <button className="landing-cta-primary landing-cta-large" onClick={handleTryDemo}>
          Try the demo now →
        </button>
        <p className="landing-safety">
          Astra does not diagnose illnesses. It surfaces personal baseline changes and recurring patterns for your own awareness. This is not a diagnosis or medical advice.
        </p>
      </section>

      <footer className="landing-footer">
        <span className="landing-logo" style={{ fontSize: 14, opacity: 0.6 }}>Astra</span>
        <span className="landing-footer-note">Passive Health Pattern Intelligence · Not a medical device</span>
      </footer>
    </div>
  )
}
