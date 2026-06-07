import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, ArrowRight } from 'lucide-react'
import { linkPatientByCode } from '@/lib/supabase/db'

interface Props {
  onLinked: () => void
}

export function LinkPatient({ onLinked }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ERROR_MESSAGES: Record<string, string> = {
    not_a_gp: 'Your account is not registered as a GP.',
    code_not_found: 'Code not found, already used, or expired. Ask your patient to generate a new one.',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError(null)

    const result = await linkPatientByCode(code.trim())
    if (result.error) {
      setError(ERROR_MESSAGES[result.error] ?? 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setLoading(false)
    onLinked()
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    setCode(raw)
    setError(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6"
    >
      <div className="w-full max-w-md rounded-[28px] border p-8 space-y-6" style={{ background: '#132B28', borderColor: '#2E5E57' }}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(104,184,175,0.15)' }}>
            <Link2 className="w-7 h-7" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: '#DCEEED', marginBottom: 6 }}>
              Link a Patient
            </h2>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#8ABFBA', lineHeight: 1.6 }}>
              Ask your patient to generate an access code in their Cerevia app and enter it below.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#8ABFBA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Access Code
            </label>
            <input
              value={code}
              onChange={handleInput}
              placeholder="CER-0000"
              maxLength={8}
              style={{
                width: '100%', padding: '14px 16px',
                fontFamily: 'monospace', fontSize: 22, fontWeight: 700,
                letterSpacing: '0.15em', textAlign: 'center',
                borderRadius: 14, border: `1.5px solid ${error ? '#C0526A' : code ? '#68B8AF' : '#2E5E57'}`,
                background: '#1E433E', color: '#DCEEED',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(192,82,106,0.1)', border: '1px solid rgba(192,82,106,0.3)',
              fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#C0526A',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length < 4}
            className="flex items-center justify-center gap-2"
            style={{
              width: '100%', padding: '14px',
              borderRadius: 24, border: 'none',
              background: loading || code.length < 4 ? '#265750' : '#68B8AF',
              color: loading || code.length < 4 ? '#8ABFBA' : 'white',
              fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 700,
              cursor: loading || code.length < 4 ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {loading ? 'Linking…' : (
              <>Link Patient <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
