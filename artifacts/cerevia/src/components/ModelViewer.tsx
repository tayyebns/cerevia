import { Brain } from 'lucide-react'

export function ModelViewer() {
  return (
    <div
      style={{
        width: '100%',
        minHeight: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 40,
      }}
    >
      <div style={{ position: 'relative' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ overflow: 'visible' }}>
          <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(104,184,175,0.12)" strokeWidth="1" />
          <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(104,184,175,0.18)" strokeWidth="1.5" />
          <circle cx="80" cy="80" r="44" fill="rgba(104,184,175,0.08)" stroke="#68B8AF" strokeWidth="1.5" strokeDasharray="4 3" />
          {[0,72,144,216,288].map((deg, i) => {
            const rad = ((deg - 90) * Math.PI) / 180
            const x1 = 80 + 56 * Math.cos(rad)
            const y1 = 80 + 56 * Math.sin(rad)
            const x2 = 80 + 66 * Math.cos(rad)
            const y2 = 80 + 66 * Math.sin(rad)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#68B8AF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          })}
          <circle cx="80" cy="14" r="4" fill="#68B8AF" />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <Brain strokeWidth={0.8} style={{ width: 56, height: 56, color: '#68B8AF' }} />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: 'var(--text)', marginBottom: 6 }}>
          Migraine intelligence
        </div>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)', lineHeight: 1.6, maxWidth: 260 }}>
          Track patterns, understand triggers, and share clear summaries with your GP.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        {[
          { label: 'Symptom tracking', pct: 87 },
          { label: 'Medication adherence', pct: 72 },
          { label: 'Trigger analysis', pct: 64 },
        ].map(({ label, pct }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#68B8AF' }}>{pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: 'rgba(104,184,175,0.15)' }}>
              <div style={{ height: 4, borderRadius: 999, width: `${pct}%`, background: 'linear-gradient(90deg, #68B8AF, #72AA79)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
