'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  AlertTriangle, Brain, TrendingDown, TrendingUp,
  Pill, Zap, Clock, Calendar, Send, Sparkles
} from 'lucide-react'
import {
  patient, migraineEvents, symptomTrendData, medicationData,
  frequencyData, triggerData, aiSummary
} from '@/lib/data'
import { severityColor, severityLabel, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[24px] border ${className}`}
      style={{ background: '#132B28', borderColor: '#2E5E57', boxShadow: '0 4px 24px rgba(15,22,21,0.3)' }}
    >
      {children}
    </div>
  )
}

function StatPill({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <DarkCard className="p-5">
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#8ABFBA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </div>
      <div className="flex items-end gap-2">
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: '#DCEEED', lineHeight: 1 }}>{value}</span>
        {sub && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA', marginBottom: 4 }}>{sub}</span>}
        {trend && (
          <span className="mb-1">
            {trend === 'down' ? <TrendingDown className="w-4 h-4 text-[#72AA79]" /> : <TrendingUp className="w-4 h-4 text-[#C0526A]" />}
          </span>
        )}
      </div>
    </DarkCard>
  )
}

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid #2E5E57',
  fontSize: 12,
  fontFamily: 'Nunito, sans-serif',
  background: '#1E433E',
  color: '#DCEEED',
}

export default function GPDashboard() {
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    {
      role: 'ai',
      text: "I've reviewed Maria's last 4 weeks of data. There's a clear improvement trend — severity dropped from an average of 6.8 to 3.5 in the past two weeks. Sumatriptan usage is approaching the monthly threshold for overuse consideration. What would you like to explore?",
    },
  ])

  function sendMessage() {
    if (!aiInput.trim()) return
    const q = aiInput.trim()
    setAiInput('')
    setAiMessages((prev) => [
      ...prev,
      { role: 'user', text: q },
      {
        role: 'ai',
        text: q.toLowerCase().includes('trigger')
          ? 'The three most common triggers for Maria are stress (6 events), poor sleep (5), and bright light (4). The stress peak correlates with the 6 May cluster — she mentioned a work deadline in her voice note. A referral to a clinical psychologist for stress management may be worth discussing.'
          : q.toLowerCase().includes('medication') || q.toLowerCase().includes('topiramate')
          ? "Maria's Topiramate adherence is 75% over the past month. She reports difficulty remembering the morning dose. You may consider a once-daily evening formulation if available, or explore a pill organiser. Her Sumatriptan use (6 doses this month) is still within guidelines but bears monitoring."
          : "Based on the data, Maria is showing a positive response to the current management plan. The two-week severity decline is statistically meaningful. I'd recommend continuing current medications and reviewing in 6 weeks unless symptoms worsen.",
      },
    ])
  }

  const sortedEvents = [...migraineEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const avgSeverity = (migraineEvents.reduce((s, e) => s + e.severity, 0) / migraineEvents.length).toFixed(1)
  const avgDuration = Math.round(migraineEvents.reduce((s, e) => s + e.duration, 0) / migraineEvents.length)
  const auraCount = migraineEvents.filter((e) => e.aura).length

  return (
    <div className="space-y-8">
      {/* Patient overview header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row gap-5"
      >
        {/* Patient profile */}
        <DarkCard className="p-6 flex-shrink-0">
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)', fontFamily: 'Nunito, sans-serif' }}
            >
              {patient.name[0]}
            </div>
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, color: '#DCEEED' }}>{patient.name}</h2>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA' }}>{patient.condition}</p>
            </div>
          </div>
          <div className="space-y-2">
            {patient.medications.map((med) => (
              <div key={med} className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: '#1E433E' }}>
                <Pill className="w-4 h-4 flex-shrink-0" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#DCEEED' }}>{med}</span>
              </div>
            ))}
          </div>
        </DarkCard>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <StatPill label="Frequency (May)" value="8" sub="episodes" trend="neutral" />
          <StatPill label="Avg severity" value={avgSeverity} sub="/ 10" trend="down" />
          <StatPill label="Avg duration" value={`${avgDuration}h`} sub="per episode" />
          <StatPill label="Adherence today" value={`${patient.adherenceToday}%`} sub="medications" trend="down" />
        </div>

        {/* Key changes alert */}
        <DarkCard className="p-5 flex-shrink-0 max-w-xs">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" style={{ color: '#E8A85A' }} strokeWidth={1.5} />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700, color: '#E8A85A' }}>Key changes</span>
          </div>
          <ul className="space-y-2">
            {[
              { text: 'Severity improving — down 3.3 pts in 2 weeks', ok: true },
              { text: 'No aura since 14 May', ok: true },
              { text: 'Sumatriptan: 6 doses this month', ok: false },
              { text: 'Topiramate adherence 75%', ok: false },
            ].map(({ text, ok }, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ fontFamily: 'Nunito, sans-serif', color: ok ? '#72AA79' : '#C0526A' }}>
                <span className="mt-1 flex-shrink-0">{ok ? '↓' : '!'}</span>
                {text}
              </li>
            ))}
          </ul>
        </DarkCard>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Frequency */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
          <DarkCard className="p-5 h-full">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: '#DCEEED', marginBottom: 4 }}>Episode Frequency</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', marginBottom: 16 }}>Migraines per month</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={frequencyData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8ABFBA', fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8ABFBA', fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {frequencyData.map((entry, i) => (
                    <Cell key={i} fill={i === frequencyData.length - 1 ? '#72AA79' : '#265750'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </DarkCard>
        </motion.div>

        {/* Severity trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
          <DarkCard className="p-5 h-full">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: '#DCEEED', marginBottom: 4 }}>Severity Trend</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', marginBottom: 16 }}>Headache severity over time</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={symptomTrendData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="sevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#68B8AF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#68B8AF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8ABFBA', fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#8ABFBA', fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="headache" stroke="#68B8AF" strokeWidth={2} fill="url(#sevGrad)" dot={{ r: 3, fill: '#68B8AF' }} />
              </AreaChart>
            </ResponsiveContainer>
          </DarkCard>
        </motion.div>

        {/* Top triggers */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}>
          <DarkCard className="p-5 h-full">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: '#DCEEED', marginBottom: 4 }}>Trigger Context</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', marginBottom: 16 }}>Reported co-factors</div>
            <div className="space-y-2.5">
              {triggerData.slice(0, 6).map(({ trigger, count }) => (
                <div key={trigger} className="flex items-center gap-3">
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#DCEEED', minWidth: 120 }}>{trigger}</div>
                  <div className="flex-1 h-2 rounded-full" style={{ background: '#1E433E' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${(count / 8) * 100}%`, background: count >= 5 ? '#C0526A' : count >= 4 ? '#E8A85A' : '#68B8AF' }}
                    />
                  </div>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', minWidth: 16, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </DarkCard>
        </motion.div>
      </div>

      {/* Medication effectiveness */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <DarkCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Pill className="w-5 h-5" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: '#DCEEED' }}>Medication Effectiveness</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {medicationData.map((med) => (
              <div key={med.name} className="rounded-[16px] p-4" style={{ background: '#1E433E', border: '1px solid #265750' }}>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: '#DCEEED', marginBottom: 2 }}>{med.name}</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', marginBottom: 12 }}>{med.time}</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA' }}>Effectiveness</span>
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: med.effectiveness >= 75 ? '#72AA79' : '#E8A85A' }}>{med.effectiveness}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#132B28' }}>
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${med.effectiveness}%`,
                          background: med.effectiveness >= 75 ? '#72AA79' : med.effectiveness >= 60 ? '#68B8AF' : '#E8A85A',
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs" style={{ fontFamily: 'Nunito, sans-serif', color: '#8ABFBA' }}>
                    <span>{med.taken} taken</span>
                    <span>{med.skipped} skipped</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DarkCard>
      </motion.div>

      {/* Event timeline */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}>
        <DarkCard className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: '#DCEEED' }}>Migraine Event Timeline</h2>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {sortedEvents.map((ev, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-[16px]" style={{ background: '#1E433E', border: '1px solid #265750' }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                  style={{ background: severityColor(ev.severity), fontFamily: 'Nunito, sans-serif' }}
                >
                  {ev.severity}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: '#DCEEED' }}>{formatDate(ev.date)}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(104,184,175,0.15)', color: '#68B8AF', fontFamily: 'Nunito, sans-serif' }}
                    >
                      {ev.duration}h
                    </span>
                    {ev.aura && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(192,82,106,0.15)', color: '#C0526A', fontFamily: 'Nunito, sans-serif' }}>
                        Aura
                      </span>
                    )}
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA' }}>{severityLabel(ev.severity)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ev.triggers.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#132B28', color: '#8ABFBA', fontFamily: 'Nunito, sans-serif' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {ev.notes && (
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', fontStyle: 'italic', marginTop: 4 }}>{ev.notes}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DarkCard>
      </motion.div>

      {/* AI Copilot */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.28 }}>
        <DarkCard className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: '#DCEEED' }}>AI Consultation Copilot</h2>
          </div>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA', marginBottom: 20 }}>
            Ask anything about Maria's data before your appointment.
          </p>

          {/* AI summary */}
          <div className="rounded-[16px] p-4 mb-5" style={{ background: '#1E433E', border: '1px solid #265750' }}>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: '#8ABFBA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              AI SUMMARY
            </div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: '#DCEEED', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{aiSummary}</p>
          </div>

          {/* Chat */}
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[80%] rounded-[16px] px-4 py-3"
                  style={{
                    background: msg.role === 'user' ? '#68B8AF' : '#1E433E',
                    border: msg.role === 'ai' ? '1px solid #265750' : 'none',
                  }}
                >
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Brain className="w-3 h-3" style={{ color: '#68B8AF' }} strokeWidth={2} />
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: '#68B8AF' }}>Cerevia AI</span>
                    </div>
                  )}
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: msg.role === 'user' ? 'white' : '#DCEEED', lineHeight: 1.6 }}>
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2 mb-4">
            {["What are the main triggers?", "Review medication adherence", "Is the plan working?"].map((q) => (
              <button
                key={q}
                onClick={() => { setAiInput(q); }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif', background: 'rgba(104,184,175,0.12)', color: '#68B8AF', border: '1px solid rgba(104,184,175,0.25)' }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about Maria's data..."
              className="flex-1 px-4 py-3 rounded-[999px] text-sm border"
              style={{
                fontFamily: 'Nunito, sans-serif',
                background: '#1E433E',
                borderColor: '#2E5E57',
                color: '#DCEEED',
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{ background: '#68B8AF', color: 'white' }}
            >
              <Send className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </DarkCard>
      </motion.div>
    </div>
  )
}
