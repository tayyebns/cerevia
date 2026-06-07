import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, Check, X } from 'lucide-react'
import { createAccessCode, getActiveAccessCodes, revokeAccessCode } from '@/lib/supabase/db'
import type { GpAccess } from '@/lib/supabase/types'

function daysLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export function ShareWithGP({ patientId }: { patientId: string }) {
  const [codes, setCodes] = useState<GpAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (patientId) loadCodes()
  }, [patientId])

  async function loadCodes() {
    setLoading(true)
    const result = await getActiveAccessCodes(patientId)
    setCodes(result)
    setLoading(false)
  }

  async function handleGenerate() {
    setGenerating(true)
    await createAccessCode(patientId)
    await loadCodes()
    setGenerating(false)
  }

  async function handleRevoke(id: string) {
    await revokeAccessCode(id)
    await loadCodes()
  }

  async function handleCopy(code: string, id: string) {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[24px] border p-5 space-y-4"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 4px 24px rgba(15,22,21,0.08)' }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(104,184,175,0.15)' }}>
          <Share2 className="w-4 h-4" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
        </div>
        <div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Share with GP</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-subtle)' }}>Give your doctor a secure access code</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#68B8AF', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {codes.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)', marginBottom: 12, lineHeight: 1.6 }}>
                Generate a one-time code. Your GP enters it on their dashboard to access your health data.
                Codes expire in 7 days.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  width: '100%', padding: '12px', borderRadius: 24,
                  background: generating ? '#6b8b89' : '#68B8AF',
                  border: 'none', color: 'white',
                  fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {generating ? 'Generating…' : 'Generate Access Code'}
              </button>
            </motion.div>
          ) : (
            codes.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-[16px] p-4 space-y-3"
                style={{ background: 'var(--bg)', border: '1.5px solid #68B8AF33' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    style={{
                      fontFamily: 'monospace', fontSize: 26, fontWeight: 700,
                      color: '#68B8AF', letterSpacing: '0.12em',
                    }}
                  >
                    {c.access_code}
                  </span>
                  <button
                    onClick={() => handleCopy(c.access_code, c.id)}
                    className="p-2 rounded-xl"
                    style={{ background: 'rgba(104,184,175,0.1)', border: 'none', cursor: 'pointer', color: '#68B8AF' }}
                    title="Copy code"
                  >
                    {copiedId === c.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-subtle)' }}>
                    {c.gp_id ? '✓ GP linked' : `Expires in ${daysLeft(c.expires_at)} day${daysLeft(c.expires_at) !== 1 ? 's' : ''}`}
                  </span>
                  <button
                    onClick={() => handleRevoke(c.id)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                    style={{
                      fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600,
                      color: '#C0526A', background: 'rgba(192,82,106,0.08)',
                      border: '1px solid rgba(192,82,106,0.2)', cursor: 'pointer',
                    }}
                  >
                    <X className="w-3 h-3" />
                    Revoke
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      )}

      {codes.length > 0 && (
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            width: '100%', padding: '10px', borderRadius: 24,
            background: 'transparent', border: '1.5px dashed var(--border)',
            color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif',
            fontSize: 13, fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer',
          }}
        >
          {generating ? 'Generating…' : '+ Another code'}
        </button>
      )}
    </motion.div>
  )
}
