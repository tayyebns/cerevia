'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, AlertCircle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function Capture() {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [transcript, setTranscript] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startRecording() {
    setRecording(true)
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
  }

  function stopRecording() {
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setTranscript(
      'Dr. Chen asked about frequency of headaches over the past month. I mentioned they have been improving since reducing screen time. She suggested we continue the current Topiramate dose and review in six weeks. She also wants me to keep a trigger diary.'
    )
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="px-5 py-4 space-y-5">
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 2 }}>Appointment Capture</h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>Record your consultation for your own records</p>
      </div>

      {/* BMA notice */}
      <div className="rounded-[22px] border p-4" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
          <div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: '#68B8AF', marginBottom: 2 }}>Recording your appointment is encouraged</div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The BMA supports patients recording consultations for personal use. It helps you remember what was discussed and share it with carers or family. Your recording is stored only on this device.
            </p>
          </div>
        </div>
      </div>

      {/* Recording UI */}
      <div className="flex flex-col items-center gap-6 py-8">
        <motion.button
          onClick={recording ? stopRecording : startRecording}
          className="w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: recording ? 'rgba(192,82,106,0.15)' : 'rgba(104,184,175,0.15)',
            border: `3px solid ${recording ? '#C0526A' : '#68B8AF'}`,
          }}
          whileTap={{ scale: 0.92 }}
        >
          {recording ? (
            <Square className="w-10 h-10" style={{ color: '#C0526A' }} strokeWidth={1.5} />
          ) : (
            <Mic className="w-10 h-10" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
          )}
        </motion.button>

        {recording ? (
          <div className="text-center space-y-1">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 rounded-full bg-[#C0526A]" style={{ animation: 'none' }} />
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: '#C0526A' }}>Recording</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center" style={{ color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif', fontSize: 28, fontWeight: 700 }}>
              <Clock className="w-5 h-5" strokeWidth={1.5} />
              {mm}:{ss}
            </div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)' }}>Tap to stop recording</p>
          </div>
        ) : (
          <div className="text-center space-y-1">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: 'var(--text)' }}>Tap to start recording</div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)' }}>Your recording will be transcribed automatically when you stop.</p>
          </div>
        )}
      </div>

      {/* Transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-[22px] border p-5 space-y-3"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: 'var(--text)' }}>Transcript</h2>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{transcript}</p>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors"
              style={{ fontFamily: 'Nunito, sans-serif', borderColor: '#68B8AF', color: '#68B8AF', background: 'transparent' }}
            >
              Add to GP Bridge report
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
