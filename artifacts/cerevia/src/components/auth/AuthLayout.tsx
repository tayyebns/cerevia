import { Navbar } from '@/components/Navbar'

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>

      <footer
        className="border-t text-center py-5 px-6 space-y-1"
        style={{ borderColor: 'var(--border)' }}
      >
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>
          Cerevia organises patient-reported information and does not provide medical advice.
        </p>
      </footer>
    </div>
  )
}
