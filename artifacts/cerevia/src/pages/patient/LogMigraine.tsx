import { useMemo, useState, useEffect, useCallback } from 'react'
import { useLocation } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useDemoData, addMigraine } from '@/lib/demo/store'
import { usePatientAuth } from '@/lib/patient/PatientContext'
import type { ReliefLevel } from '@/lib/demo/types'
import type { MigraineEvent } from '@/lib/supabase/types'

const SYMPTOMS = ['Aura', 'Nausea', 'Light sensitivity', 'Sound sensitivity', 'Dizziness', 'Visual disturbance', 'Neck pain']
const PAIN = ['One-sided (left)', 'One-sided (right)', 'Behind the eyes', 'Whole head', 'Temples']
const IMPACT = ['Missed work/study', 'Reduced productivity', 'Needed rest', 'Sleep disrupted', 'Social plans cancelled']
const RELIEF: { key: ReliefLevel; label: string }[] = [
  { key: 'none', label: 'No relief' },
  { key: 'slight', label: 'Slight' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'strong', label: 'Strong' },
]

function Chip({ active, onClick, children, activeColor = '#68B8AF' }: { active: boolean; onClick: () => void; children: React.ReactNode; activeColor?: string }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
      style={{ fontFamily: 'Nunito, sans-serif', background: active ? activeColor : 'var(--bg)', color: active ? 'white' : 'var(--text-subtle)', border: '1px solid var(--border)', cursor: 'pointer' }}>
      {children}
    </button>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>{children}</label>
}

const reliefLabel: Record<ReliefLevel, string> = { none: 'No relief', slight: 'Slight relief', moderate: 'Moderate relief', strong: 'Strong relief' }

function formatSbDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function parseExtra(notes?: string | null): Record<string, unknown> {
  try { return JSON.parse(notes ?? '') } catch { return {} }
}

export default function LogMigraine() {
  const [, setLocation] = useLocation()
  const { migraines } = useDemoData()
  const { patientId, hasSupabase } = usePatientAuth()

  const [sbEvents, setSbEvents] = useState<MigraineEvent[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [severity, setSeverity] = useState<number | null>(null)
  const [painLocation, setPainLocation] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [medicationTaken, setMedicationTaken] = useState(false)
  const [medicationName, setMedicationName] = useState('Sumatriptan 50mg')
  const [timeToRelief, setTimeToRelief] = useState('')
  const [reliefLevel, setReliefLevel] = useState<ReliefLevel>('none')
  const [impact, setImpact] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const fetchSbEvents = useCallback(async () => {
    if (!patientId || !hasSupabase) return
    const { getPatientMigraineEvents } = await import('@/lib/supabase/db')
    const events = await getPatientMigraineEvents(patientId)
    setSbEvents(events)
  }, [patientId, hasSupabase])

  useEffect(() => { fetchSbEvents() }, [fetchSbEvents])

  const demoRecent = useMemo(
    () => [...migraines].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8),
    [migraines],
  )

  function toggle(list: string[], v: string, set: (l: string[]) => void) {
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  }

  function durationFromTimes(): number {
    if (!startTime || !endTime) return 0
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    let mins = eh * 60 + em - (sh * 60 + sm)
    if (mins < 0) mins += 24 * 60
    return Math.round((mins / 60) * 10) / 10
  }

  async function handleSave() {
    if (!severity) return
    setSaving(true)
    const dur = durationFromTimes()

    // Always update local demo store for analytics
    addMigraine({
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      durationHours: dur,
      severity,
      painLocation: painLocation || undefined,
      symptoms,
      medicationTaken,
      medicationName: medicationTaken ? medicationName : undefined,
      timeToReliefMins: timeToRelief ? parseInt(timeToRelief, 10) : undefined,
      reliefLevel,
      impact,
      notes: notes.trim() || undefined,
    })

    // Write to Supabase if logged in
    if (patientId && hasSupabase) {
      const extraJson = JSON.stringify({
        painLocation: painLocation || null,
        medicationTaken,
        medicationName: medicationTaken ? medicationName : null,
        timeToReliefMins: timeToRelief ? parseInt(timeToRelief, 10) : null,
        reliefLevel,
        impact,
        ...(notes.trim() ? { text: notes.trim() } : {}),
      })
      const { insertMigraineEvent } = await import('@/lib/supabase/db')
      await insertMigraineEvent(patientId, {
        date: new Date().toISOString().slice(0, 10),
        severity,
        duration: Math.round(dur) || null,
        triggers: symptoms,
        aura: symptoms.includes('Aura'),
        notes: extraJson,
      })
      await fetchSbEvents()
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => { setShowForm(false); setSaved(false); setLocation('/patient/insights') }, 1100)
  }

  // Use Supabase events when available, else fall back to demo store
  const useSupabaseList = hasSupabase && (sbEvents.length > 0 || patientId !== null)

  return (
    <div className="px-5 py-4 space-y-5">
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 2 }}>Log a Migraine</h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>Migraines are the outcome Cerevia helps you reduce.</p>
      </div>

      <button onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 rounded-[999px] h-14 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #C0526A, #9E3F54)', boxShadow: '0 4px 16px rgba(192,82,106,0.35)', fontFamily: 'Nunito, sans-serif', fontSize: 16, border: 'none', cursor: 'pointer' }}>
        I had a migraine
      </button>

      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: 'var(--text)', marginBottom: 12 }}>Recent episodes</h2>

        {/* Supabase-backed list */}
        {useSupabaseList && (
          <div className="space-y-3">
            {sbEvents.length === 0 ? (
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>No episodes logged yet. Tap above to log your first one.</p>
            ) : (
              sbEvents.slice(0, 8).map((ev) => {
                const extra = parseExtra(ev.notes)
                const medTaken = extra.medicationTaken as boolean | undefined
                const medName = extra.medicationName as string | undefined
                const relief = extra.reliefLevel as ReliefLevel | undefined
                const impactArr = (extra.impact as string[] | undefined) ?? []
                return (
                  <div key={ev.id} className="rounded-[20px] border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                        {formatSbDate(ev.date)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full" style={{ background: ev.severity >= 7 ? 'rgba(192,82,106,0.16)' : 'rgba(104,184,175,0.16)', color: ev.severity >= 7 ? '#C0526A' : '#4A9990', fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700 }}>
                        {ev.severity}/10{ev.duration ? ` · ${ev.duration}h` : ''}
                      </span>
                    </div>
                    {(ev.triggers ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(ev.triggers ?? []).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg)', color: 'var(--text-subtle)', fontFamily: 'Nunito, sans-serif', border: '1px solid var(--border)' }}>{s}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-subtle)' }}>
                      {medTaken ? `${medName ?? 'Medication'} · ${reliefLabel[relief ?? 'none']}` : 'No medication logged'}
                      {impactArr.length > 0 && ` · ${impactArr.length} impact${impactArr.length > 1 ? 's' : ''}`}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Demo store list (when no Supabase) */}
        {!useSupabaseList && (
          <div className="space-y-3">
            {demoRecent.map((m) => (
              <div key={m.id} className="rounded-[20px] border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                    {new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full" style={{ background: m.severity >= 7 ? 'rgba(192,82,106,0.16)' : 'rgba(104,184,175,0.16)', color: m.severity >= 7 ? '#C0526A' : '#4A9990', fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700 }}>
                    {m.severity}/10 · {m.durationHours}h
                  </span>
                </div>
                {m.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {m.symptoms.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg)', color: 'var(--text-subtle)', fontFamily: 'Nunito, sans-serif', border: '1px solid var(--border)' }}>{s}</span>
                    ))}
                  </div>
                )}
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-subtle)' }}>
                  {m.medicationTaken ? `${m.medicationName} · ${reliefLabel[m.reliefLevel]}` : 'No medication logged'}
                  {m.impact.length > 0 && ` · ${m.impact.length} impact${m.impact.length > 1 ? 's' : ''}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(15,22,21,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <motion.div initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 48, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-lg rounded-t-[28px] flex flex-col" style={{ background: 'var(--surface)', maxHeight: '92vh' }}>
              <div className="overflow-y-auto flex-1 p-6 space-y-5">
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, color: 'var(--text)' }}>Log migraine event</h2>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start time</Label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border" style={{ fontFamily: 'Nunito, sans-serif', borderColor: 'var(--border)', outline: 'none', color: 'var(--text)', background: 'var(--bg)' }} />
                  </div>
                  <div>
                    <Label>End time</Label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border" style={{ fontFamily: 'Nunito, sans-serif', borderColor: 'var(--border)', outline: 'none', color: 'var(--text)', background: 'var(--bg)' }} />
                  </div>
                </div>

                <div>
                  <Label>Severity <span style={{ color: '#C0526A' }}>*</span></Label>
                  <div className="flex gap-2 flex-wrap">
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                      <button key={n} onClick={() => setSeverity(n)} className="w-10 h-10 rounded-full text-sm font-semibold transition-colors"
                        style={{ fontFamily: 'Nunito, sans-serif', background: severity === n ? '#C0526A' : 'var(--bg)', color: severity === n ? 'white' : 'var(--text-subtle)', border: '1px solid var(--border)', cursor: 'pointer' }}>{n}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Pain location</Label>
                  <div className="flex flex-wrap gap-2">
                    {PAIN.map((p) => <Chip key={p} active={painLocation === p} onClick={() => setPainLocation(p)}>{p}</Chip>)}
                  </div>
                </div>

                <div>
                  <Label>Symptoms</Label>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS.map((s) => <Chip key={s} active={symptoms.includes(s)} onClick={() => toggle(symptoms, s, setSymptoms)}>{s}</Chip>)}
                  </div>
                </div>

                <div>
                  <Label>Medication</Label>
                  <div className="flex items-center gap-2 mb-3">
                    <Chip active={medicationTaken} onClick={() => setMedicationTaken(true)}>Taken</Chip>
                    <Chip active={!medicationTaken} onClick={() => setMedicationTaken(false)}>None</Chip>
                  </div>
                  {medicationTaken && (
                    <div className="space-y-3">
                      <input value={medicationName} onChange={(e) => setMedicationName(e.target.value)} placeholder="e.g. Sumatriptan 50mg"
                        className="w-full px-4 py-2.5 text-sm rounded-lg border" style={{ fontFamily: 'Nunito, sans-serif', borderColor: 'var(--border)', outline: 'none', color: 'var(--text)', background: 'var(--bg)' }} />
                      <div className="flex items-center gap-2">
                        <input type="number" min="0" max="600" value={timeToRelief} onChange={(e) => setTimeToRelief(e.target.value)} placeholder="Time to relief (mins)"
                          className="w-44 px-4 py-2.5 text-sm rounded-lg border" style={{ fontFamily: 'Nunito, sans-serif', borderColor: 'var(--border)', outline: 'none', color: 'var(--text)', background: 'var(--bg)' }} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {RELIEF.map((r) => <Chip key={r.key} active={reliefLevel === r.key} onClick={() => setReliefLevel(r.key)}>{r.label}</Chip>)}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Impact</Label>
                  <div className="flex flex-wrap gap-2">
                    {IMPACT.map((s) => <Chip key={s} active={impact.includes(s)} onClick={() => toggle(impact, s, setImpact)} activeColor="#E8A85A">{s}</Chip>)}
                  </div>
                </div>

                <div>
                  <Label>Notes (optional)</Label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional context…"
                    className="w-full px-4 py-3 text-sm rounded-lg border resize-none" style={{ fontFamily: 'Nunito, sans-serif', borderColor: 'var(--border)', outline: 'none', color: 'var(--text)', minHeight: 56, background: 'var(--bg)' }} />
                </div>
              </div>

              <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <button onClick={handleSave} disabled={!severity || saved || saving}
                  className="w-full h-12 rounded-[999px] text-white font-semibold text-base transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: !severity ? '#D9A9B4' : '#C0526A', fontFamily: 'Nunito, sans-serif', boxShadow: '0 4px 16px rgba(192,82,106,0.35)', border: 'none', cursor: !severity ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {saved ? <><CheckCircle2 className="w-5 h-5" strokeWidth={2} /> Saved</> : saving ? 'Saving…' : 'Save migraine event'}
                </button>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center', marginTop: 8, lineHeight: 1.4 }}>
                  This organises your self-reported data - it is not a substitute for medical advice.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
