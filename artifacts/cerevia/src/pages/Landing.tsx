import { lazy, Suspense } from 'react'
import { useLocation } from 'wouter'
import { loadDemoData } from '@/lib/demo/store'

const BandViewer = lazy(() => import('@/components/landing/BandViewer'))

// Set to true once public/astraband.glb is placed in the public folder
const HAS_GLB = false

const FEATURES = [
  { icon: '◎', label: 'Passive pattern detection',    desc: 'No forms. No dashboards. Astra observes while you live.' },
  { icon: '⌁', label: 'Personal baseline engine',     desc: 'Learns what normal looks like for you — not a population average.' },
  { icon: '↻', label: 'Recurrence detection',         desc: 'Notices when the same cluster of changes has appeared before.' },
  { icon: '⊞', label: 'Multi-signal interpretation',  desc: 'Cross-references sleep, heart rate, HRV and activity together.' },
  { icon: '⌘', label: 'Decision fatigue reduction',   desc: 'One clear priority per day. Nothing else unless it matters.' },
  { icon: '⊡', label: 'Clinician-ready health notes', desc: 'Optional export you own — never sent without your permission.' },
]

const COMPARISONS = [
  { label: 'Daily mandatory logs',      astra: '0',                    others: 'Many' },
  { label: 'Manual tracking required',  astra: 'Never',                others: 'Always' },
  { label: 'Clear health priority',     astra: '1 per day',            others: 'Dozens of charts' },
  { label: 'Passive wearable',          astra: 'AstraBand',            others: 'None' },
  { label: 'Clinician export',          astra: 'Optional, user-owned', others: 'Not available' },
]

const BAND_SPECS = [
  { icon: '◉', label: 'Continuous skin temperature trend',   desc: 'Detects low-grade thermal shifts that precede fatigue or immune response — invisible to smartwatches.' },
  { icon: '◉', label: 'Autonomic strain index',              desc: 'Real-time HRV + RHR combined to surface nervous system load — not just a number, a trend.' },
  { icon: '◉', label: 'Movement deterioration tracking',     desc: 'Day-over-day gait and mobility pattern shifts that signal accumulating physical cost.' },
  { icon: '◉', label: 'Sleep architecture context',          desc: '24/7 wear means full-night passive reading without a device that charges overnight.' },
  { icon: '◉', label: 'Zero interaction required',           desc: 'No buttons. No notifications. No app checks. Wear it and forget it.' },
]

export default function Landing() {
  const [, navigate] = useLocation()

  function handleTryDemo() {
    loadDemoData()
    navigate('/app')
  }

  return (
    <div className="landing-root">

      {/* ── Nav ── */}
      <nav className="landing-nav">
        <span className="landing-logo">Astra</span>
        <div className="landing-nav-links">
          <button className="landing-nav-link" onClick={() => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
          }}>How it works</button>
          <button className="landing-nav-link" onClick={() => {
            document.getElementById('astraband')?.scrollIntoView({ behavior: 'smooth' })
          }}>AstraBand</button>
          <button className="landing-cta-demo" onClick={handleTryDemo}>Try demo →</button>
        </div>
      </nav>

      {/* ── Hero ── */}
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
            <span className="landing-stat-value">6</span>
            <span className="landing-stat-label">passive signals tracked</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-value">90</span>
            <span className="landing-stat-label">days of health memory</span>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
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

      {/* ── How it works ── */}
      <section id="how-it-works" className="landing-section landing-section-alt">
        <h2 className="landing-section-title">How it works</h2>
        <p className="landing-section-sub">Four steps. Zero daily effort.</p>
        <div className="landing-steps">
          {[
            { n: '01', title: 'Connect once',    body: 'Grant permission to Apple Health or Google Health Connect. Astra reads only what it needs and explains exactly why each signal is used.' },
            { n: '02', title: 'Astra observes',  body: 'For 7–14 days Astra quietly builds your personal baseline — what normal looks like for you specifically, not for a population.' },
            { n: '03', title: 'Patterns surface',body: 'When a meaningful cluster of changes repeats, Astra explains it in plain language with one clear suggested next step.' },
            { n: '04', title: 'You decide',      body: 'Dismiss it, note it, or generate a clinician-ready health summary. Everything is yours. Nothing is sent automatically.' },
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
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button className="landing-cta-primary" onClick={handleTryDemo}>
            See it with 90 days of real-looking data →
          </button>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="landing-section">
        <h2 className="landing-section-title">What others skip</h2>
        <p className="landing-section-sub">Most health apps mistake activity for insight.</p>
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

      {/* ── AstraBand ── */}
      <section id="astraband" className="landing-band-full">
        <div className="landing-band-full-inner">

          {/* Left — copy */}
          <div className="landing-band-copy">
            <div className="landing-band-badge">In development</div>
            <h2 className="landing-band-title">AstraBand</h2>
            <p className="landing-band-body">
              A passive health pattern band purpose-built for continuous wear. Not a smartwatch. No notifications. No fitness scores. Just the signals that existing wearables miss — captured quietly, all day and all night.
            </p>
            <p className="landing-band-body" style={{ marginBottom: 24 }}>
              The software intelligence layer comes first. AstraBand captures the signals existing devices cannot — then feeds them into the same pattern engine you just saw in the demo.
            </p>
            <div className="landing-band-specs">
              {BAND_SPECS.map((s) => (
                <div key={s.label} className="landing-band-spec-row">
                  <div className="landing-band-spec-top">
                    <span className="landing-band-spec-dot">◉</span>
                    <span className="landing-band-spec-label">{s.label}</span>
                  </div>
                  <p className="landing-band-spec-desc">{s.desc}</p>
                </div>
              ))}
            </div>
            <p className="landing-band-note">
              AstraBand is currently in hardware prototyping. The intelligence layer it feeds runs today — connect any existing wearable to try the demo.
            </p>
          </div>

          {/* Right — 3D viewer */}
          <div className="landing-band-canvas-wrap">
            <div className="landing-band-canvas">
              <Suspense fallback={
                <div className="landing-band-canvas-fallback">
                  <div className="landing-band-ring">
                    <div className="landing-band-ring-inner">
                      <span className="landing-band-ring-label">AstraBand</span>
                      <span className="landing-band-ring-sub">in development</span>
                    </div>
                  </div>
                </div>
              }>
                <BandViewer hasGlb={HAS_GLB} />
              </Suspense>
            </div>
            <div className="landing-band-canvas-caption">
              {HAS_GLB ? 'AstraBand — drag to rotate' : 'AstraBand concept — 3D model loading soon'}
            </div>
          </div>

        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="landing-section landing-final-cta">
        <h2 className="landing-final-title">See 90 days of passive health intelligence</h2>
        <p className="landing-final-sub">
          No sign-up. No forms. Just what changed — in two minutes.
        </p>
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
