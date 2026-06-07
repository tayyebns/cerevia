import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain } from 'lucide-react'

const EASE = [0.4, 0, 0.2, 1] as const

const TICKS = [0, 72, 144, 216, 288].map((deg) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return {
    x1: 70 + 54 * Math.cos(rad),
    y1: 70 + 54 * Math.sin(rad),
    x2: 70 + 46 * Math.cos(rad),
    y2: 70 + 46 * Math.sin(rad),
  }
})

export function SplashScreen() {
  const [visible, setVisible] = useState<boolean | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem('cerevia-splash')) {
      setVisible(false)
      return
    }
    sessionStorage.setItem('cerevia-splash', '1')
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 4200)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible === true && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#0A1210',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(104,184,175,0.11) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 1.6, ease: EASE }}
            style={{
              position: 'absolute',
              width: 340,
              height: 340,
              borderRadius: '50%',
              border: '1px solid rgba(104,184,175,0.07)',
              pointerEvents: 'none',
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 1.8, ease: EASE }}
            style={{
              position: 'absolute',
              width: 480,
              height: 480,
              borderRadius: '50%',
              border: '1px solid rgba(104,184,175,0.04)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ overflow: 'visible' }}>
                <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(104,184,175,0.06)" strokeWidth="1" />
                <motion.circle
                  cx="70" cy="70" r="54"
                  fill="none"
                  stroke="#68B8AF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: EASE, delay: 0.3 }}
                />
                <motion.circle
                  cx="70" cy="70" r="46"
                  fill="none"
                  stroke="rgba(104,184,175,0.18)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: EASE, delay: 1.0 }}
                />
                {TICKS.map(({ x1, y1, x2, y2 }, i) => (
                  <motion.line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#68B8AF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.55, scale: 1 }}
                    transition={{ delay: 1.7 + i * 0.06, duration: 0.35, ease: EASE }}
                  />
                ))}
                <motion.circle
                  cx="70" cy="16"
                  r="3"
                  fill="#68B8AF"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6, duration: 0.4, ease: EASE }}
                />
              </svg>
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.6, ease: EASE }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Brain strokeWidth={1} style={{ width: 36, height: 36, color: '#68B8AF' }} />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20, letterSpacing: '0.45em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.06em' }}
              transition={{ delay: 1.9, duration: 0.9, ease: EASE }}
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 54,
                fontWeight: 300,
                color: '#DCEEED',
                marginTop: 20,
                lineHeight: 1,
              }}
            >
              Cerevia
            </motion.div>

            <div style={{ position: 'relative', width: 140, height: 1, marginTop: 10 }}>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 2.5, duration: 0.7, ease: EASE }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, transparent, #68B8AF 40%, #72AA79 70%, transparent)',
                  transformOrigin: 'left center',
                  borderRadius: 999,
                  height: 1,
                }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.85, duration: 0.55, ease: EASE }}
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: 12,
                fontWeight: 400,
                color: '#8ABFBA',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginTop: 14,
              }}
            >
              Your health, clearly tracked.
            </motion.p>

          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: 'rgba(104,184,175,0.08)',
            }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 3.9, ease: 'linear', delay: 0.2 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #68B8AF, #72AA79 60%, #68B8AF)',
                transformOrigin: 'left center',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
