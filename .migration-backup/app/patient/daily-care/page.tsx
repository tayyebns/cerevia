'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, X, Trash2, TrendingDown } from 'lucide-react'
import { symptomTrendData, recentSymptoms } from '@/lib/data'

export const dynamic = 'force-dynamic'

const SYMPTOMS = [
  'Headache',
  'Aura (visual)',
  'Aura (sensory)',
  'Nausea',
  'Vomiting',
  'Light sensitivity',
  'Sound sensitivity',
  'Smell sensitivity',
  'Neck stiffness',
  'Dizziness',
  'Postdrome fatigue',
  'Cognitive fog',
  'Eye pain',
  'Mood changes',
]

const FILTERS = ['All', 'Headache', 'Nausea', 'Light sensitivity', 'Aura']
const COLORS = { headache: '#68B8AF', nausea: '#72AA79', lightSensitivity: '#E8A85A', aura: '#C0526A' }

function SeverityBadge({ score }: { score: number }) {
  const label = score <= 2 ? 'Very mild' : score <= 4 ? 'Mild' : score <= 6 ? 'Moderate' : 'Severe'
  const bg = score <= 2 ? '#EEF5EE' : score <= 4 ? '#EEF5F5' : score <= 6 ? '#FEF3E6' : '#FCEEF1'
  const color = score <= 2 ? '#4A7A50' : score <= 4 ? '#4A9990' : score <= 6 ? '#B07030' : '#C0526A'
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: bg, color, fontFamily: 'Nunito, sans-serif' }}>
      {score}/10 · {label}
    </span>
  )
}

export default function DailyCare() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [selectedSymptom, setSelectedSymptom] = useState('')
  const [severity, setSeverity] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <div className="px-5 py-4 space-y-5">
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 2 }}>Daily Care</h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>Track how you feel, every day</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2">
        {[{ v: '13', l: 'Total logged' }, { v: '3', l: 'This week' }, { v: '5.5/10', l: 'Avg severity' }].map(({ v, l }) => (
          <div key={l} className="rounded-[16px] p-3 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 20, fontWeight: 700, color: '#68B8AF' }}>{v}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Chart card */}
      <div className="rounded-[28px] border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 4px 24px rgba(15,22,21,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: 'var(--text)' }}>Symptom Severity</div>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: '#EEF5EE', color: '#4A7A50', fontFamily: 'Nunito, sans-serif' }}>
            <TrendingDown className="w-3 h-3" strokeWidth={2} /> Improving
          </span>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-3 py-1 rounded-full text-sm font-semibold transition-colors"
              style={{
                fontFamily: 'Nunito, sans-serif',
                background: activeFilter === f ? '#68B8AF' : 'transparent',
                color: activeFilter === f ? 'white' : '#5A7271',
                border: activeFilter === f ? 'none' : '1px solid #DDE9E8',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={symptomTrendData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8AA8A6', fontFamily: 'Nunito, sans-serif' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#8AA8A6', fontFamily: 'Nunito, sans-serif' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #DDE9E8', fontSize: 12, fontFamily: 'Nunito, sans-serif', background: 'var(--surface)' }} />
            {(activeFilter === 'All' || activeFilter === 'Headache') && (
              <Line type="monotone" dataKey="headache" name="Headache" stroke={COLORS.headache} strokeWidth={2} dot={{ r: 3, fill: COLORS.headache }} activeDot={{ r: 5 }} />
            )}
            {(activeFilter === 'All' || activeFilter === 'Nausea') && (
              <Line type="monotone" dataKey="nausea" name="Nausea" stroke={COLORS.nausea} strokeWidth={2} dot={{ r: 3, fill: COLORS.nausea }} activeDot={{ r: 5 }} />
            )}
            {(activeFilter === 'All' || activeFilter === 'Light sensitivity') && (
              <Line type="monotone" dataKey="lightSensitivity" name="Light sensitivity" stroke={COLORS.lightSensitivity} strokeWidth={2} dot={{ r: 3, fill: COLORS.lightSensitivity }} activeDot={{ r: 5 }} />
            )}
            {(activeFilter === 'All' || activeFilter === 'Aura') && (
              <Line type="monotone" dataKey="aura" name="Aura" stroke={COLORS.aura} strokeWidth={2} dot={{ r: 3, fill: COLORS.aura }} activeDot={{ r: 5 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Record button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 rounded-[999px] h-14 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)', boxShadow: '0 4px 16px rgba(104,184,175,0.4)', fontFamily: 'Nunito, sans-serif', fontSize: 16 }}
      >
        <Plus className="w-5 h-5" strokeWidth={2} />
        Record a symptom
      </button>

      {/* Recent entries */}
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: 'var(--text)', marginBottom: 12 }}>Recent Entries</h2>
        <div className="space-y-3">
          {recentSymptoms.map((entry, i) => (
            <div key={i} className="rounded-[20px] border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{entry.symptom}</span>
                  {' '}
                  <SeverityBadge score={entry.severity} />
                </div>
                <button className="p-1 rounded-lg hover:bg-[#FEF3F3] transition-colors" style={{ color: '#C0526A' }}>
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-subtle)', marginBottom: 6 }}>{entry.date}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-muted)' }}>{entry.description}</div>
              {entry.notes && (
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)', fontStyle: 'italic', marginTop: 4 }}>{entry.notes}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Record symptom modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(15,22,21,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}
          >
            <motion.div
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-lg rounded-t-[28px] flex flex-col"
              style={{ background: 'var(--surface)', maxHeight: '92vh' }}
            >
              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: 'var(--text)' }}>Record a symptom</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-[#F0F4F4] transition-colors">
                    <X className="w-5 h-5 text-[#5A7271]" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Symptom chips */}
                <div>
                  <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>SYMPTOM</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {SYMPTOMS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSymptom(s)}
                        className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
                        style={{
                          fontFamily: 'Nunito, sans-serif',
                          background: selectedSymptom === s ? '#68B8AF' : '#F0F4F4',
                          color: selectedSymptom === s ? 'white' : '#5A7271',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <input
                    placeholder="Or type a custom symptom..."
                    className="w-full px-4 py-3 text-sm rounded-lg border"
                    style={{ fontFamily: 'Nunito, sans-serif', borderColor: 'var(--border)', outline: 'none', color: 'var(--text)' }}
                  />
                </div>

                {/* Severity */}
                <div>
                  <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>SEVERITY</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setSeverity(n)}
                        className="w-10 h-10 rounded-full text-sm font-semibold transition-colors"
                        style={{
                          fontFamily: 'Nunito, sans-serif',
                          background: severity === n ? '#68B8AF' : '#F0F4F4',
                          color: severity === n ? 'white' : '#5A7271',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>HOW DOES IT FEEL?</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe how you are feeling..."
                    className="w-full px-4 py-3 text-sm rounded-lg border resize-none"
                    style={{ fontFamily: 'Nunito, sans-serif', borderColor: 'var(--border)', outline: 'none', color: 'var(--text)', minHeight: 80 }}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>NOTES (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional context..."
                    className="w-full px-4 py-3 text-sm rounded-lg border resize-none"
                    style={{ fontFamily: 'Nunito, sans-serif', borderColor: 'var(--border)', outline: 'none', color: 'var(--text)', minHeight: 64 }}
                  />
                </div>
              </div>

              {/* Sticky save button — always visible */}
              <div className="px-6 py-4 border-t" style={{ borderColor: '#EEF5F5', background: 'var(--surface)' }}>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-full h-12 rounded-[999px] text-white font-semibold text-base transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: '#68B8AF', fontFamily: 'Nunito, sans-serif', boxShadow: '0 4px 16px rgba(104,184,175,0.4)' }}
                >
                  Save symptom
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
