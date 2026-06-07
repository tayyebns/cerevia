import { lazy, Suspense } from 'react'
import { Switch, Route, Router as WouterRouter } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/ThemeProvider'

const LandingPage  = lazy(() => import('@/pages/Landing'))
const LoginPage    = lazy(() => import('@/pages/auth/Login'))
const SignupPage   = lazy(() => import('@/pages/auth/Signup'))
const AuthCallback = lazy(() => import('@/pages/auth/Callback'))
const AppLayout    = lazy(() => import('@/pages/app/AppLayout'))

const queryClient = new QueryClient()

function PageLoader() {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/"                component={LandingPage} />
              <Route path="/auth/login"      component={LoginPage} />
              <Route path="/auth/signup"     component={SignupPage} />
              <Route path="/auth/callback"   component={AuthCallback} />
              <Route path="/app/:rest*"      component={AppLayout} />
              <Route>
                <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: 48, fontWeight: 300, color: 'var(--text)', margin: '0 0 8px' }}>404</p>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 16px' }}>Page not found</p>
                    <a href="/" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>← Back to home</a>
                  </div>
                </div>
              </Route>
            </Switch>
          </Suspense>
        </WouterRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
