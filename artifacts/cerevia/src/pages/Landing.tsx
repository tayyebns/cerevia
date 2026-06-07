import { lazy, Suspense } from 'react'
import { useLocation } from 'wouter'
import { loadDemoData } from '@/lib/demo/store'

// Start downloading the Three.js chunk immediately — don't wait for Suspense to trigger
const _bandViewerChunk = import('@/components/landing/BandViewer')
const BandViewer = lazy(() => _bandViewerChunk)

// Flip to true once public/astraband.glb is dropped in the public folder
const HAS_GLB = true

const FEATURES = [
  { icon: '◎', label: 'Passive pattern detection',    desc: 'No forms. No dashboards. Astra observes while you live.' },
  { icon: '⌁', label: 'Personal baseline engine',     desc: 'Learns what normal looks like for you, not a population average.' },
  { icon: '↻', label: 'Recurrence detection',         desc: 'Notices when the same cluster of changes has appeared before.' },
  { icon: '⊞', label: 'Multi-signal interpretation',  desc: 'Cross-references sleep, heart rate, HRV and activity together.' },
  { icon: '⌘', label: 'Decision fatigue reduction',   desc: 'One clear priority per day. Nothing else unless it matters.' },
  { icon: '⊡', label: 'Clinician-ready health notes', desc: 'Optional export you own, never sent without your permission.' },
]

const COMPARISONS = [
  { label: 'Daily mandatory logs',      astra: '0',                    others: 'Many' },
  { label: 'Manual tracking required',  astra: 'Never',                others: 'Always' },
  { label: 'Clear health priority',     astra: '1 per day',            others: 'Dozens of charts' },
  { label: 'Passive wearable',          astra: 'AstraBand',            others: 'None' },
  { label: 'Clinician export',          astra: 'Optional, user-owned', others: 'Not available' },
]

const BAND_SPECS = [
  { label: 'Continuous skin temperature trend',   desc: 'Detects low-grade thermal shifts that precede fatigue or immune response, invisible to smartwatches.' },
  { label: 'Autonomic strain index',              desc: 'Real-time HRV and RHR combined to surface nervous system load as a trend, not just a number.' },
  { label: 'Movement deterioration tracking',     desc: 'Day-over-day gait and mobility pattern shifts that signal accumulating physical cost.' },
  { label: 'Sleep architecture context',          desc: '24/7 wear means full-night passive reading without a device that charges overnight.' },
  { label: 'Zero interaction required',           desc: 'No buttons. No notifications. No app checks. Wear it and forget it.' },
]

export default function Landing() {
  const [, navigate] = useLocation()

  function handleTryDemo() {
    loadDemoData()
    navigate('/app/patterns')
  }

  return (
    <div className="landing-root">

      {/* Nav */}
      <nav className="landing-nav">
        <a href="/" className="landing-logo" style={{ textDecoration: 'none' }}>Astra</a>
        <div className="landing-nav-links">
          <button className="landing-nav-link" onClick={() => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
          }}>How it works</button>
          <button className="landing-nav-link" onClick={() => {
            document.getElementById('astraband')?.scrollIntoView({ behavior: 'smooth' })
          }}>AstraBand</button>
          <button className="landing-cta-demo" onClick={handleTryDemo}>See it in action</button>
        </div>
      </nav>

      {/* Hero: text left, 3D band right */}
      <section className="landing-hero-split">
        <div className="landing-hero-text">
          <div className="landing-hero-badge">Made for neurodivergent bodies</div>
          <h1 className="landing-h1">
            Your body has patterns.<br />
            <span className="landing-h1-accent">Astra is the first to see them.</span>
          </h1>
          <p className="landing-hero-sub">
            ADHD, autism, and other neurodivergent profiles make self-tracking almost impossible. Astra does it for you - no journaling, no check-ins, no apps to remember. Just one clear signal when something in your body has shifted.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-cta-primary" onClick={() => navigate('/onboarding')}>
              Get started
            </button>
            <button className="landing-cta-secondary" onClick={handleTryDemo}>
              See it in action
            </button>
          </div>

          <div className="landing-stats">
            <div className="landing-stat">
              <span className="landing-stat-value">0</span>
              <span className="landing-stat-label">mandatory logs</span>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <span className="landing-stat-value">1</span>
              <span className="landing-stat-label">priority per day</span>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <span className="landing-stat-value">6</span>
              <span className="landing-stat-label">passive signals</span>
            </div>
            <div className="landing-stat-divider" />
            <div className="landing-stat">
              <span className="landing-stat-value">90</span>
              <span className="landing-stat-label">days of memory</span>
            </div>
          </div>
        </div>

        <div className="landing-hero-band">
          <div className="landing-hero-band-viewer">
            <Suspense fallback={null}>
              <BandViewer />
            </Suspense>
          </div>
          <div className="landing-hero-band-label">
            <span className="landing-band-badge">In development</span>
            <span className="landing-hero-band-name">AstraBand</span>
            <span className="landing-hero-band-sub">The wearable made for neurodivergent bodies, not fitness apps</span>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="landing-section landing-problem-section">
        <div className="landing-problem-inner">
          <div className="landing-problem-label">The problem</div>
          <p className="landing-problem-body">
            Most health apps demand the most from the people who have the least to give. Astra asks for nothing - and gives you back clarity.
          </p>
        </div>
      </section>

      {/* Features */}
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
      <section id="how-it-works" className="landing-section landing-section-alt">
        <h2 className="landing-section-title">How it works</h2>
        <p className="landing-section-sub">Four steps. Zero daily effort.</p>
        <div className="landing-steps">
          {[
            { n: '01', title: 'Connect once',     body: 'Grant permission to Apple Health or Google Health Connect. Astra reads only what it needs and explains exactly why each signal is used.' },
            { n: '02', title: 'Astra observes',   body: 'For 7 to 14 days Astra quietly builds your personal baseline, what normal looks like for you specifically, not for a population.' },
            { n: '03', title: 'Patterns surface', body: 'When a meaningful cluster of changes repeats, Astra explains it in plain language with one clear suggested next step.' },
            { n: '04', title: 'You decide',       body: 'Dismiss it, note it, or generate a clinician-ready health summary. Everything is yours. Nothing is sent automatically.' },
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
            See 90 days of Ahmad's patterns
          </button>
        </div>
      </section>

      {/* Support tiers */}
      <section className="landing-section">
        <h2 className="landing-section-title">Choose your level of support</h2>
        <p className="landing-section-sub">Every neurodivergent body is different. Pick what works for yours.</p>
        <div className="landing-tiers">
          <div className="landing-tier">
            <div className="landing-tier-name">Minimal</div>
            <div className="landing-tier-tagline">Only what matters</div>
            <ul className="landing-tier-list">
              <li>Important insights only</li>
            </ul>
          </div>
          <div className="landing-tier landing-tier-featured">
            <div className="landing-tier-popular">Most popular</div>
            <div className="landing-tier-name">Balanced</div>
            <div className="landing-tier-tagline">One clear thing per day</div>
            <ul className="landing-tier-list">
              <li>One insight per day</li>
            </ul>
          </div>
          <div className="landing-tier">
            <div className="landing-tier-name">High support</div>
            <div className="landing-tier-tagline">Full guidance</div>
            <ul className="landing-tier-list">
              <li>Insights</li>
              <li>Reminders</li>
              <li>Routine support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison */}
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

      {/* 3 Phone screens */}
      <section className="landing-section landing-section-alt">
        <h2 className="landing-section-title">From signal to one clear answer</h2>
        <p className="landing-section-sub">
          Most apps show you data. Astra connects your body signals to what is happening around you and gives you one thing to do.
        </p>

        <div className="landing-phones">

          {/* Phone 1 */}
          <div className="landing-phone-wrap">
            <div className="landing-phone-label">What is happening</div>
            <div className="landing-phone">
              <div className="phone-status-bar"><span>9:41</span><span>●●●</span></div>
              <div className="phone-screen">
                <div className="phone-app-header">
                  <span className="phone-app-logo">Astra</span>
                  <span className="phone-app-badge">Ahmad</span>
                </div>
                <div className="phone-date">Saturday, 7 June</div>
                <div className="phone-greeting">Good morning, Alex.</div>

                <div className="phone-pattern-card">
                  <div className="phone-pattern-top">
                    <span className="phone-dot phone-dot-moderate" />
                    <span className="phone-pattern-type">Recovery Strain</span>
                    <span className="phone-active-pill">Active · 4 days</span>
                  </div>
                  <div className="phone-pattern-title">Your body is working harder than usual</div>
                  <p className="phone-pattern-body">RHR elevated, HRV suppressed for 4 consecutive days outside your personal baseline.</p>
                  <div className="phone-signals">
                    <span className="phone-signal phone-signal-bad">↑ Resting HR +23%</span>
                    <span className="phone-signal phone-signal-bad">↓ HRV 31%</span>
                    <span className="phone-signal phone-signal-bad">↓ Sleep 0.9h</span>
                  </div>
                  <div className="phone-recurrence-note">↻ 3rd time this pattern has appeared</div>
                </div>

                <div className="phone-env-strip">
                  <div className="phone-env-title">Today's environment</div>
                  <div className="phone-env-row"><span>🌫</span><span className="phone-env-item-name">Air quality</span><span className="phone-env-bad">AQI 118</span></div>
                  <div className="phone-env-row"><span>🌸</span><span className="phone-env-item-name">Pollen</span><span className="phone-env-bad">Very High</span></div>
                  <div className="phone-env-row"><span>📉</span><span className="phone-env-item-name">Pressure</span><span className="phone-env-bad">Dropping fast</span></div>
                  <div className="phone-env-insight-pill">⚠ Matches your pattern trigger</div>
                </div>
              </div>
            </div>
          </div>

          {/* Phone 2 */}
          <div className="landing-phone-wrap landing-phone-center">
            <div className="landing-phone-label">When it started and why</div>
            <div className="landing-phone landing-phone-elevated">
              <div className="phone-status-bar"><span>9:41</span><span>●●●</span></div>
              <div className="phone-screen">
                <div className="phone-app-header">
                  <span className="phone-app-logo">Astra</span>
                  <span className="phone-app-badge">Ahmad</span>
                </div>
                <div className="phone-section-title">What triggered this</div>

                <div className="phone-timeline">
                  <div className="phone-tl-row">
                    <div className="phone-tl-left"><div className="phone-tl-dot phone-tl-env" /><div className="phone-tl-line" /></div>
                    <div className="phone-tl-body">
                      <div className="phone-tl-date">3 Jun</div>
                      <div className="phone-tl-event">Pollen peaked: <strong>Very High</strong></div>
                      <div className="phone-tl-sub">Barometric pressure began falling</div>
                    </div>
                  </div>
                  <div className="phone-tl-row">
                    <div className="phone-tl-left"><div className="phone-tl-dot phone-tl-body-sig" /><div className="phone-tl-line" /></div>
                    <div className="phone-tl-body">
                      <div className="phone-tl-date">4 Jun</div>
                      <div className="phone-tl-event">Sleep dropped to <strong>6.2h</strong></div>
                      <div className="phone-tl-sub">Down from 7.2h baseline</div>
                    </div>
                  </div>
                  <div className="phone-tl-row">
                    <div className="phone-tl-left"><div className="phone-tl-dot phone-tl-body-sig" /><div className="phone-tl-line" /></div>
                    <div className="phone-tl-body">
                      <div className="phone-tl-date">5 Jun</div>
                      <div className="phone-tl-event">HRV: <strong>29ms</strong> · RHR: <strong>72 bpm</strong></div>
                      <div className="phone-tl-sub">Both outside personal baseline</div>
                    </div>
                  </div>
                  <div className="phone-tl-row">
                    <div className="phone-tl-left"><div className="phone-tl-dot phone-tl-flag" /></div>
                    <div className="phone-tl-body">
                      <div className="phone-tl-date">6 Jun</div>
                      <div className="phone-tl-event phone-tl-flagged">Pattern detected</div>
                      <div className="phone-tl-sub">Recovery Strain · Moderate</div>
                    </div>
                  </div>
                </div>

                <div className="phone-insight-box">
                  <div className="phone-insight-label">Astra's pattern memory</div>
                  <p className="phone-insight-text">
                    <strong>High pollen + falling pressure</strong> appeared before your Recovery Strain episodes in April and February. Your body responds consistently to this combination.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phone 3 */}
          <div className="landing-phone-wrap">
            <div className="landing-phone-label">One clear action</div>
            <div className="landing-phone">
              <div className="phone-status-bar"><span>9:41</span><span>●●●</span></div>
              <div className="phone-screen">
                <div className="phone-app-header">
                  <span className="phone-app-logo">Astra</span>
                  <span className="phone-app-badge">Ahmad</span>
                </div>
                <div className="phone-section-title">What Astra suggests</div>

                <div className="phone-action-hero">
                  <div className="phone-action-icon">◎</div>
                  <div className="phone-action-title">Skip intensity today</div>
                  <p className="phone-action-body">Your autonomic system is managing environmental load. Adding physical or cognitive stress will slow recovery.</p>
                </div>

                <div className="phone-why-section">
                  <div className="phone-why-title">Why today specifically</div>
                  <div className="phone-why-row"><span className="phone-why-dot" /><span>HRV 29ms vs your usual 48ms</span></div>
                  <div className="phone-why-row"><span className="phone-why-dot" /><span>Pollen forecast remains Very High</span></div>
                  <div className="phone-why-row"><span className="phone-why-dot" /><span>Pressure still dropping</span></div>
                  <div className="phone-why-row"><span className="phone-why-dot" /><span>Resolved in 2 to 3 days each time before</span></div>
                </div>

                <div className="phone-note-cta">
                  Export health note
                  <span className="phone-note-cta-arrow">→</span>
                </div>

                <p className="phone-safety-note">Not a diagnosis. Worth monitoring.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* AstraBand full section */}
      <section id="astraband" className="landing-band-full">
        <div className="landing-band-full-inner">
          <div className="landing-band-copy">
            <div className="landing-band-badge">In development</div>
            <h2 className="landing-band-title">AstraBand</h2>
            <p className="landing-band-body">
              A passive health pattern band purpose-built for continuous wear. Not a smartwatch. No notifications. No fitness scores. Just the signals that existing wearables miss, captured quietly all day and all night.
            </p>
            <p className="landing-band-body" style={{ marginBottom: 24 }}>
              The software intelligence layer comes first. AstraBand captures the signals existing devices cannot, then feeds them into the same pattern engine powering Astra.
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
              AstraBand is currently in hardware prototyping. The intelligence layer it feeds runs today.
            </p>
          </div>

          <div className="landing-band-canvas-wrap">
            <div className="landing-band-canvas">
              <Suspense fallback={null}>
                <BandViewer />
              </Suspense>
            </div>
            <div className="landing-band-canvas-caption">
              {HAS_GLB ? 'AstraBand · drag to rotate' : 'AstraBand · 3D model coming soon'}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-section landing-final-cta">
        <h2 className="landing-final-title">See 90 days of passive health intelligence</h2>
        <p className="landing-final-sub">No sign-up. No forms. Just what changed.</p>
        <button className="landing-cta-primary landing-cta-large" onClick={handleTryDemo}>
          See it for yourself
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
