import { lazy, Suspense, useEffect } from 'react'
import { Switch, Route, useLocation } from 'wouter'
import BottomNav from '@/components/app/BottomNav'
import { useAstraStore, loadDemoData } from '@/lib/demo/store'

const Today       = lazy(() => import('./Today'))
const Patterns    = lazy(() => import('./Patterns'))
const Baseline    = lazy(() => import('./Baseline'))
const HealthNote  = lazy(() => import('./HealthNote'))
const DataSources = lazy(() => import('./DataSources'))

function ScreenLoader() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}

export default function AppLayout() {
  const { isDemoLoaded } = useAstraStore()
  const [location, navigate] = useLocation()

  // Auto-load demo data if someone navigates directly to /app
  useEffect(() => {
    if (!isDemoLoaded) loadDemoData()
  }, [isDemoLoaded])

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <span className="app-header-logo">Astra</span>
        <div className="app-header-right">
          <span className="app-demo-badge">Demo</span>
          <a href="/" className="app-header-link">← Exit</a>
        </div>
      </header>

      {/* Screen content */}
      <main className="app-main">
        <Suspense fallback={<ScreenLoader />}>
          <Switch>
            <Route path="/app"          component={Today} />
            <Route path="/app/patterns" component={Patterns} />
            <Route path="/app/baseline" component={Baseline} />
            <Route path="/app/note"     component={HealthNote} />
            <Route path="/app/sources"  component={DataSources} />
          </Switch>
        </Suspense>
      </main>

      <BottomNav />
    </div>
  )
}
