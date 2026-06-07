import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Brain, AlertTriangle, Sparkles } from 'lucide-react'
import { getPatientRecord, getPatientMigraineEvents, getPatientMedicationLogs, getLinkedPatients } from '@/lib/supabase/db'
import { useLanguage, useTranslate } from '@/lib/i18n/LanguageContext'
import type { MigraineEvent, MedicationLog } from '@/lib/supabase/types'

interface ChatMessage {
  role: 'user' | 'ai'
  text: string
  isEmergency?: boolean
}

interface PatientContext {
  patientName?: string
  linkedPatientName?: string
  events?: MigraineEvent[]
  medicationLogs?: MedicationLog[]
}

function buildApiUrl() {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/chat`.replace('//', '/')
}

/** Returns the current Supabase access token (for server-side auth). */
async function getAccessToken(): Promise<string | null> {
  const { createClient } = await import('@/lib/auth/client')
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

async function fetchPatientContext(role: 'patient' | 'gp'): Promise<PatientContext> {
  const { createClient } = await import('@/lib/auth/client')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const name = user.user_metadata?.full_name ?? user.email ?? undefined

  if (role === 'patient') {
    const patient = await getPatientRecord(user.id)
    if (!patient) return { patientName: name }
    const [events, medicationLogs] = await Promise.all([
      getPatientMigraineEvents(patient.id),
      getPatientMedicationLogs(patient.id),
    ])
    return { patientName: name, events, medicationLogs }
  }

  // GP role
  const linked = await getLinkedPatients()
  if (linked.length === 0) return { patientName: name }
  const primary = linked[0]
  const [events, medicationLogs] = await Promise.all([
    getPatientMigraineEvents(primary.patient_id),
    getPatientMedicationLogs(primary.patient_id),
  ])
  return {
    patientName: name,
    linkedPatientName: primary.full_name ?? undefined,
    events,
    medicationLogs,
  }
}

/**
 * Safely renders a single line of text with **bold** markdown support.
 * No dangerouslySetInnerHTML - all content is rendered as React nodes.
 */
function SafeLine({ text, color }: { text: string; color: string }) {
  if (!text.trim()) return <p style={{ margin: 0 }}>&nbsp;</p>

  // Split on **...** markers and alternate between plain text and bold spans
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, lineHeight: 1.6, color, margin: 0 }}>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
      )}
    </p>
  )
}

function SafetyNotice() {
  const text = useTranslate('Cerevia AI provides data insights only. Not a substitute for medical advice.')
  return (
    <div className="px-4 py-2.5" style={{ background: 'rgba(232,165,90,0.1)', borderBottom: '1px solid rgba(232,165,90,0.2)' }}>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#B8873A' }}>⚕️ {text}</p>
    </div>
  )
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  const lines = msg.text.split('\n')
  const textColor = isUser ? 'white' : 'var(--text)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="max-w-[85%] rounded-[18px] px-4 py-3 space-y-1"
        style={{
          background: isUser ? '#68B8AF' : 'rgba(104,184,175,0.08)',
          border: isUser ? 'none' : '1px solid rgba(104,184,175,0.2)',
        }}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            {msg.isEmergency
              ? <AlertTriangle className="w-3 h-3" style={{ color: '#E8564A' }} />
              : <Brain className="w-3 h-3" style={{ color: '#68B8AF' }} />
            }
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: msg.isEmergency ? '#E8564A' : '#68B8AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Cerevia AI
            </span>
          </div>
        )}
        {lines.map((line, i) => (
          <SafeLine key={i} text={line} color={textColor} />
        ))}
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-[18px] px-4 py-3" style={{ background: 'rgba(104,184,175,0.08)', border: '1px solid rgba(104,184,175,0.2)' }}>
        <div className="flex items-center gap-1.5">
          <Brain className="w-3 h-3" style={{ color: '#68B8AF' }} />
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: '#68B8AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cerevia AI</span>
        </div>
        <div className="flex gap-1 mt-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#68B8AF', animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

const QUICK_QUESTIONS_PATIENT = [
  "What are my most common triggers?",
  "How has my severity trended?",
  "Am I taking my medication consistently?",
]
const QUICK_QUESTIONS_GP = [
  "What are the main triggers?",
  "Review medication adherence",
  "Has the patient improved recently?",
]

interface Props {
  role: 'patient' | 'gp'
}

function TranslatedQuickQuestion({ en, onClick }: { en: string; onClick: () => void }) {
  const text = useTranslate(en)
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
      style={{ fontFamily: 'Nunito, sans-serif', background: 'rgba(104,184,175,0.1)', color: '#68B8AF', border: '1px solid rgba(104,184,175,0.25)' }}
    >
      {text}
    </button>
  )
}

export function CereviaChat({ role }: Props) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [contextLoaded, setContextLoaded] = useState(false)
  const [patientContext, setPatientContext] = useState<PatientContext>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const { lang } = useLanguage()
  const placeholder = useTranslate('Ask about your migraine data…')
  const noticeText = useTranslate('Cerevia AI · Not medical advice · Always consult your GP')
  const loadingText = useTranslate('Loading your data…')
  const subtitleText = useTranslate(role === 'gp' ? 'Consultation Intelligence' : 'Patient Insights')

  const hasSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

  // Load context once when chat opens
  useEffect(() => {
    if (!open || contextLoaded || !hasSupabase) return
    fetchPatientContext(role).then(ctx => {
      setPatientContext(ctx)
      setContextLoaded(true)
      const name = role === 'gp' ? (ctx.linkedPatientName ?? 'your patient') : (ctx.patientName?.split(' ')[0] ?? 'there')
      const intro = role === 'gp'
        ? ctx.events && ctx.events.length > 0
          ? `I've loaded ${name}'s data - ${ctx.events.length} migraine episodes logged. Average severity: ${(ctx.events.reduce((s, e) => s + e.severity, 0) / ctx.events.length).toFixed(1)}/10. What would you like to explore before the consultation?`
          : `${name} hasn't logged any episodes yet. I can help you prepare consultation questions or discuss general migraine patterns.`
        : ctx.events && ctx.events.length > 0
          ? `Hi ${name}! I can see you've logged ${ctx.events.length} migraine episodes. What would you like to understand about your patterns?`
          : `Hi ${name}! Start logging migraine episodes in Daily Care and I'll be able to analyse your patterns. What would you like to know?`
      setMessages([{ role: 'ai', text: `⚕️ *Cerevia AI provides insights based on your logged history. Please consult your GP for all medical decisions.*\n\n${intro}` }])
    }).catch(() => {
      setContextLoaded(true)
      setMessages([{ role: 'ai', text: '⚕️ *Cerevia AI provides insights based on your logged history. Please consult your GP for all medical decisions.*\n\nHello! I\'m Cerevia AI. How can I help you today?' }])
    })
  }, [open, contextLoaded, hasSupabase, role])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim()
    if (!msg || streaming) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setStreaming(true)

    const url = buildApiUrl()
    abortRef.current = new AbortController()

    try {
      const token = await getAccessToken()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: msg,
          role,
          patientContext,
          language: lang.name,
          languageCode: lang.code,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ''
      let msgAdded = false
      // Buffer carries over any incomplete SSE line between network chunks.
      // HTTP chunk boundaries are arbitrary - a data: JSON line can be split
      // across two reads. We only parse lines we know are complete (i.e. they
      // ended with \n), and defer the remainder to the next iteration.
      let buffer = ''

      const applyContent = (text: string, emergency: boolean) => {
        if (!msgAdded) {
          setMessages(prev => [...prev, { role: 'ai', text, isEmergency: emergency }])
          msgAdded = true
        } else {
          setMessages(prev => {
            const next = [...prev]
            next[next.length - 1] = { role: 'ai', text, isEmergency: emergency }
            return next
          })
        }
      }

      const processLine = (line: string) => {
        if (!line.startsWith('data: ')) return
        const payload = line.slice(6).trim()
        if (!payload) return
        try {
          const data = JSON.parse(payload)
          if (data.done || data.error) return
          if (data.content) {
            aiText += data.content
            applyContent(aiText, aiText.includes('🚨'))
          }
        } catch {
          // genuinely malformed - skip
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        // The last element may be an incomplete line - put it back in the buffer
        buffer = lines.pop() ?? ''
        for (const line of lines) processLine(line)
      }
      // Flush any remaining buffered content after the stream closes
      if (buffer) processLine(buffer)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages(prev => [...prev, { role: 'ai', text: 'I\'m having trouble connecting right now. Please try again in a moment.' }])
    } finally {
      setStreaming(false)
    }
  }, [input, streaming, role, patientContext, lang])

  const quickQuestions = role === 'gp' ? QUICK_QUESTIONS_GP : QUICK_QUESTIONS_PATIENT

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={() => setOpen(true)}
            aria-label="Open Cerevia AI chat"
            className="fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)', boxShadow: '0 4px 20px rgba(104,184,175,0.4)' }}
          >
            <Sparkles className="w-6 h-6 text-white" strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            role="dialog"
            aria-label="Cerevia AI chat"
            aria-modal="true"
            className="fixed bottom-4 right-4 z-50 flex flex-col rounded-[28px] overflow-hidden"
            style={{
              width: 'min(420px, calc(100vw - 32px))',
              height: 'min(580px, calc(100vh - 120px))',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(15,22,21,0.25)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)' }}>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 700, color: 'white' }}>Cerevia AI</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                  {subtitleText}
                  {lang.code !== 'en' && (
                    <span style={{ marginLeft: 6, opacity: 0.75 }}>· {lang.native}</span>
                  )}
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-300 flex-shrink-0" aria-label="Online" />
              <button
                onClick={() => { setOpen(false); abortRef.current?.abort() }}
                aria-label="Close chat"
                className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-white" strokeWidth={2} />
              </button>
            </div>

            {/* Safety notice */}
            <SafetyNotice />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
              {messages.length === 0 && !contextLoaded && (
                <div className="flex items-center gap-2 justify-center py-8">
                  <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#68B8AF', borderTopColor: 'transparent' }} />
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)' }}>{loadingText}</span>
                </div>
              )}
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {streaming && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && !streaming && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickQuestions.map(q => (
                  <TranslatedQuickQuestion key={q} en={q} onClick={() => sendMessage(q)} />
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={placeholder}
                  aria-label="Chat message input"
                  disabled={streaming}
                  dir={lang.rtl ? 'rtl' : 'ltr'}
                  className="flex-1 px-4 py-2.5 rounded-[999px] text-sm border outline-none"
                  style={{
                    fontFamily: 'Nunito, sans-serif',
                    background: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                    opacity: streaming ? 0.6 : 1,
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || streaming}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, #68B8AF, #4A9990)',
                    opacity: !input.trim() || streaming ? 0.5 : 1,
                    border: 'none',
                    cursor: !input.trim() || streaming ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Send className="w-4 h-4 text-white" strokeWidth={2} />
                </button>
              </div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: 'var(--text-subtle)', textAlign: 'center', marginTop: 6 }}>
                {noticeText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
