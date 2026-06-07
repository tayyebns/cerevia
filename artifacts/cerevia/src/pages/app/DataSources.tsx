import { useAstraStore } from '@/lib/demo/store'

const SIGNAL_EXPLANATIONS: Record<string, string> = {
  'Sleep duration':     'Used to detect sleep disruption patterns and compare against your personal baseline.',
  'Resting HR':         'Key signal for recovery strain detection. Elevated RHR across multiple days contributes to pattern clustering.',
  'HRV':               'Heart rate variability suppression combined with RHR elevation is a strong recovery strain indicator.',
  'Steps':             'Used to detect reduced movement patterns and activity intolerance — days of unusually low activity relative to your baseline.',
  'Active minutes':    'Supports activity intolerance detection alongside daily steps.',
  'Screen time':       'Optional — used only to provide context for sleep disruption patterns. Never used for any other purpose.',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DataSources() {
  const { user } = useAstraStore()

  return (
    <div className="screen-sources">
      <h1 className="screen-title">Data Sources</h1>
      <p className="screen-subtitle">
        Everything Astra reads, why it reads it, and how to disconnect or delete your data at any time.
      </p>

      {/* Privacy principles */}
      <div className="sources-principles">
        <div className="sources-principles-title">Data principles</div>
        <div className="sources-principle-list">
          {[
            { icon: '◉', text: 'Explicit consent for every signal — no silent collection.' },
            { icon: '◉', text: 'Each signal has a clear, explained purpose in the product.' },
            { icon: '◉', text: 'You can disconnect any source or delete all data at any time.' },
            { icon: '◉', text: 'Your data is never sold, shared with employers, or sent anywhere without your explicit action.' },
            { icon: '◉', text: 'Health notes are only generated when you initiate them — nothing is auto-sent.' },
          ].map((p) => (
            <div key={p.text} className="sources-principle-row">
              <span className="sources-principle-icon">{p.icon}</span>
              <span className="sources-principle-text">{p.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connected sources */}
      <div className="sources-section">
        <div className="sources-section-title">Connected sources</div>
        {user.connectedSources.map((source) => (
          <div key={source.id} className="source-card">
            <div className="source-card-header">
              <span className="source-icon">{source.icon}</span>
              <div className="source-info">
                <div className="source-name">{source.name}</div>
                <div className="source-connected-at">Connected {formatDate(source.connectedAt)}</div>
              </div>
              <span className={`source-status-badge ${source.status === 'connected' ? 'status-connected' : 'status-disconnected'}`}>
                {source.status === 'connected' ? '● Connected' : '○ Disconnected'}
              </span>
            </div>

            <div className="source-signals">
              <div className="source-signals-title">Signals being read</div>
              {source.signals.map((sig) => (
                <div key={sig} className="source-signal-row">
                  <span className="source-signal-name">{sig}</span>
                  <span className="source-signal-why">{SIGNAL_EXPLANATIONS[sig] ?? 'Used to build your personal baseline.'}</span>
                </div>
              ))}
            </div>

            <div className="source-card-actions">
              <button className="source-btn-disconnect" disabled>
                Disconnect (demo)
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Signals not collected */}
      <div className="sources-not-collected">
        <div className="sources-not-title">Signals Astra does not collect</div>
        <div className="sources-not-list">
          {[
            'GPS location or location history',
            'Messages, email or social activity',
            'Contacts or communication patterns',
            'Financial data of any kind',
            'Glucose or blood markers (unless future integration is explicitly opted in)',
            'Any signal not listed above without your explicit re-consent',
          ].map((item) => (
            <div key={item} className="sources-not-item">
              <span className="sources-not-x">✕</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delete all */}
      <div className="sources-delete">
        <div className="sources-delete-title">Delete all data</div>
        <p className="sources-delete-body">
          You can request complete deletion of all your data — readings, baseline calculations, patterns and any health notes — at any time. In the live product, deletion is immediate and irreversible.
        </p>
        <button className="sources-delete-btn" disabled>
          Delete all my data (demo — disabled)
        </button>
      </div>

      <p className="screen-safety">
        Astra treats all health data and inferred patterns as sensitive data requiring strong governance. This is a demo using simulated wearable data only.
      </p>
    </div>
  )
}
