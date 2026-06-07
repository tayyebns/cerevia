import { lazy, Suspense } from 'react'
import { Switch, Route, Router as WouterRouter } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SplashScreen } from '@/components/SplashScreen'
import { AuthGuard } from '@/components/AuthGuard'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import PatientLayout from '@/pages/patient/PatientLayout'
import GPLayout from '@/pages/gp/GPLayout'

const LandingPage = lazy(() => import('@/pages/Landing'))
const LoginPage = lazy(() => import('@/pages/auth/Login'))
const SignupPage = lazy(() => import('@/pages/auth/Signup'))
const AuthCallback = lazy(() => import('@/pages/auth/Callback'))
const PatientHome = lazy(() => import('@/pages/patient/PatientHome'))
const TriggerCheckIn = lazy(() => import('@/pages/patient/TriggerCheckIn'))
const LogMigraine = lazy(() => import('@/pages/patient/LogMigraine'))
const Insights = lazy(() => import('@/pages/patient/Insights'))
const Care = lazy(() => import('@/pages/patient/Care'))
const Capture = lazy(() => import('@/pages/patient/Capture'))
const GPDashboard = lazy(() => import('@/pages/gp/GPDashboard'))

const queryClient = new QueryClient()

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#68B8AF', borderTopColor: 'transparent' }} />
    </div>
  )
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/signup" component={SignupPage} />
        <Route path="/auth/callback" component={AuthCallback} />

        <Route path="/patient">
          <AuthGuard area="patient">
            <PatientLayout>
              <PatientHome />
            </PatientLayout>
          </AuthGuard>
        </Route>
        <Route path="/patient/triggers">
          <AuthGuard area="patient">
            <PatientLayout>
              <TriggerCheckIn />
            </PatientLayout>
          </AuthGuard>
        </Route>
        <Route path="/patient/log">
          <AuthGuard area="patient">
            <PatientLayout>
              <LogMigraine />
            </PatientLayout>
          </AuthGuard>
        </Route>
        <Route path="/patient/insights">
          <AuthGuard area="patient">
            <PatientLayout>
              <Insights />
            </PatientLayout>
          </AuthGuard>
        </Route>
        <Route path="/patient/care">
          <AuthGuard area="patient">
            <PatientLayout>
              <Care />
            </PatientLayout>
          </AuthGuard>
        </Route>
        <Route path="/patient/capture">
          <AuthGuard area="patient">
            <PatientLayout>
              <Capture />
            </PatientLayout>
          </AuthGuard>
        </Route>

        <Route path="/gp">
          <AuthGuard area="gp">
            <GPLayout>
              <GPDashboard />
            </GPLayout>
          </AuthGuard>
        </Route>

        <Route>
          <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
            <div className="text-center space-y-3">
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: 'var(--text)' }}>404</h1>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-muted)' }}>Page not found</p>
              <a href="/" style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#68B8AF', textDecoration: 'none', fontWeight: 600 }}>← Back to home</a>
            </div>
          </div>
        </Route>
      </Switch>
    </Suspense>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <SplashScreen />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
