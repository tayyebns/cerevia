import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  AlertTriangle, Brain, TrendingDown,
  Pill, Calendar, Send, Sparkles, Users
} from 'lucide-react'
import { LinkPatient } from '@/components/gp/LinkPatient'
import { BrainViewer } from '@/components/gp/BrainViewer'
import {
  ensureGPProfileRecord, getLinkedPatients,
  getPatientMigraineEvents, getPatientMedicationLogs,
} from '@/lib/supabase/db'
import type { LinkedPatient, MigraineEvent, MedicationLog } from '@/lib/supabase/types'
import { severityColor, severityLabel, formatDate } from '@/lib/utils'

function DarkCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[24px] border ${className}`} style={{ background: '#132B28', borderColor: '#2E5E57', boxShadow: '0 4px 24px rgba(15,22,21,0.3)' }}>
      {children}
    </div>
  )
}

function StatPill({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <DarkCard className="p-5">
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#8ABFBA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div className="flex items-end gap-2">
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, color: '#DCEEED', lineHeight: 1 }}>{value}</span>
        {sub && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA', marginBottom: 4 }}>{sub}</span>}
        {trend && trend !== 'neutral' && (
          <span className="mb-1">
            <TrendingDown className="w-4 h-4" style={{ color: trend === 'down' ? '#72AA79' : '#C0526A' }} />
          </span>
        )}
      </div>
    </DarkCard>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10" style={{ color: '#8ABFBA' }}>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA' }}>{label}</div>
    </div>
  )
}

const TOOLTIP_STYLE = {
  borderRadius: 12, border: '1px solid #2E5E57', fontSize: 12,
  fontFamily: 'Nunito, sans-serif', background: '#1E433E', color: '#DCEEED',
}

interface PatientDashData {
  events: MigraineEvent[]
  logs: MedicationLog[]
}

function buildFrequencyData(events: MigraineEvent[]) {
  const counts: Record<string, number> = {}
  events.forEach((e) => {
    const m = new Date(e.date).toLocaleString('en-GB', { month: 'short' })
    counts[m] = (counts[m] ?? 0) + 1
  })
  return Object.entries(counts).map(([month, count]) => ({ month, count }))
}

function buildSeverityTrend(events: MigraineEvent[]) {
  return [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => ({
      label: new Date(e.date).toLocaleString('en-GB', { day: 'numeric', month: 'short' }),
      headache: e.severity,
    }))
}

function buildTriggerData(events: MigraineEvent[]) {
  const counts: Record<string, number> = {}
  events.forEach((e) => (e.triggers ?? []).forEach((t) => { counts[t] = (counts[t] ?? 0) + 1 }))
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([trigger, count]) => ({ trigger, count }))
}

function buildMedicationSummary(logs: MedicationLog[]) {
  const summary: Record<string, { taken: number; skipped: number }> = {}
  logs.forEach((l) => {
    if (!summary[l.medication_name]) summary[l.medication_name] = { taken: 0, skipped: 0 }
    if (l.taken) summary[l.medication_name].taken++
    else summary[l.medication_name].skipped++
  })
  return Object.entries(summary).map(([name, { taken, skipped }]) => ({
    name,
    taken,
    skipped,
    effectiveness: taken + skipped > 0 ? Math.round((taken / (taken + skipped)) * 100) : 0,
    time: '',
  }))
}

export default function GPDashboard() {
  const [gpProfileId, setGpProfileId] = useState<string | null>(null)
  const [linkedPatients, setLinkedPatients] = useState<LinkedPatient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<LinkedPatient | null>(null)
  const [dashData, setDashData] = useState<PatientDashData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<MigraineEvent | null>(null)
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])

  const hasSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

  const loadGPData = useCallback(async () => {
    if (!hasSupabase) { setLoading(false); return }
    try {
      const { createClient } = await import('@/lib/auth/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const gp = await ensureGPProfileRecord(user.id)
      if (gp) {
        setGpProfileId(gp.id)
        const patients = await getLinkedPatients()
        setLinkedPatients(patients)
        if (patients.length > 0) setSelectedPatient(patients[0])
      }
    } catch (err) {
      console.error('GPDashboard load error:', err)
    }
    setLoading(false)
  }, [hasSupabase])

  useEffect(() => { loadGPData() }, [loadGPData])

  const fetchPatientData = useCallback(async (patient: LinkedPatient) => {
    const [events, logs] = await Promise.all([
      getPatientMigraineEvents(patient.patient_id),
      getPatientMedicationLogs(patient.patient_id),
    ])
    setDashData({ events, logs })
    setSelectedEvent(null)
    return { events, logs }
  }, [])

  useEffect(() => {
    if (!selectedPatient) return
    setDataLoading(true)
    fetchPatientData(selectedPatient).then(({ events }) => {
      const name = selectedPatient.full_name?.split(' ')[0] ?? 'this patient'
      setAiMessages([{
        role: 'ai',
        text: events.length > 0
          ? `I've reviewed ${name}'s data. ${events.length} episodes recorded. Average severity: ${(events.reduce((s, e) => s + e.severity, 0) / events.length).toFixed(1)}/10. What would you like to explore?`
          : `${name} has been linked but hasn't logged any migraine episodes yet. Once they start tracking, I'll be able to provide insights here.`,
      }])
      setDataLoading(false)
    })
  }, [selectedPatient, fetchPatientData])

  // Supabase Realtime: re-fetch whenever patient logs new data
  useEffect(() => {
    if (!selectedPatient || !hasSupabase) return
    let channel: ReturnType<ReturnType<typeof import('@/lib/auth/client')['createClient']>['channel']> | null = null

    import('@/lib/auth/client').then(({ createClient }) => {
      const supabase = createClient() as any
      channel = supabase
        .channel(`gp-patient-${selectedPatient.patient_id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'migraine_events',
          filter: `patient_id=eq.${selectedPatient.patient_id}`,
        }, () => { fetchPatientData(selectedPatient) })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'medication_logs',
          filter: `patient_id=eq.${selectedPatient.patient_id}`,
        }, () => { fetchPatientData(selectedPatient) })
        .subscribe()
    })

    return () => {
      import('@/lib/auth/client').then(({ createClient }) => {
        if (channel) createClient().removeChannel(channel as any)
      })
    }
  }, [selectedPatient, hasSupabase, fetchPatientData])

  function sendMessage() {
    if (!aiInput.trim()) return
    const q = aiInput.trim()
    const name = selectedPatient?.full_name?.split(' ')[0] ?? 'the patient'
    setAiInput('')
    setAiMessages((prev) => [
      ...prev,
      { role: 'user', text: q },
      {
        role: 'ai',
        text: q.toLowerCase().includes('trigger')
          ? `The most common triggers for ${name} are: ${buildTriggerData(dashData?.events ?? []).slice(0, 3).map(t => t.trigger).join(', ') || 'none recorded yet'}.`
          : q.toLowerCase().includes('medication')
          ? dashData?.logs.length
            ? `${name}'s medication logs show ${dashData.logs.filter(l => l.taken).length} doses taken and ${dashData.logs.filter(l => !l.taken).length} skipped.`
            : `${name} hasn't logged medication data yet.`
          : `Based on the available data for ${name}, continue monitoring and review again in 4–6 weeks.`,
      },
    ])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#68B8AF', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!gpProfileId || linkedPatients.length === 0) {
    return <LinkPatient onLinked={() => window.location.reload()} />
  }

  const events = dashData?.events ?? []
  const logs = dashData?.logs ?? []
  const patientName = selectedPatient?.full_name ?? 'Patient'
  const avgSeverity = events.length > 0 ? (events.reduce((s, e) => s + e.severity, 0) / events.length).toFixed(1) : '-'
  const avgDuration = events.length > 0 ? Math.round(events.reduce((s, e) => s + (e.duration ?? 0), 0) / events.length) : 0
  const frequencyData = buildFrequencyData(events)
  const severityTrend = buildSeverityTrend(events)
  const triggerData = buildTriggerData(events)
  const medicationSummary = buildMedicationSummary(logs)
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-8">
      {linkedPatients.length > 1 && (
        <div className="flex items-center gap-3 flex-wrap">
          <Users className="w-4 h-4 flex-shrink-0" style={{ color: '#8ABFBA' }} />
          {linkedPatients.map((p) => (
            <button
              key={p.patient_id}
              onClick={() => setSelectedPatient(p)}
              style={{
                padding: '6px 16px', borderRadius: 999,
                fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                background: selectedPatient?.patient_id === p.patient_id ? '#68B8AF' : '#1E433E',
                color: selectedPatient?.patient_id === p.patient_id ? 'white' : '#8ABFBA',
              }}
            >
              {p.full_name ?? 'Patient'}
            </button>
          ))}
          <button
            onClick={() => { setLoading(true); loadGPData() }}
            style={{ padding: '6px 14px', borderRadius: 999, fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px dashed #2E5E57', color: '#8ABFBA' }}
          >
            + Link another
          </button>
        </div>
      )}

      {dataLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#68B8AF', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col lg:flex-row gap-5">
            <DarkCard className="p-6 flex-shrink-0">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: 'linear-gradient(135deg, #68B8AF, #4A9990)', fontFamily: 'Nunito, sans-serif' }}>
                  {patientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, color: '#DCEEED' }}>{patientName}</h2>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA' }}>
                    Linked {new Date(selectedPatient!.linked_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {medicationSummary.length > 0 ? (
                <div className="space-y-2">
                  {medicationSummary.map((med) => (
                    <div key={med.name} className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: '#1E433E' }}>
                      <Pill className="w-4 h-4 flex-shrink-0" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#DCEEED' }}>{med.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA' }}>No medication data yet.</p>
              )}
            </DarkCard>

            <div className="grid grid-cols-2 gap-4 flex-1">
              <StatPill label="Episodes total" value={events.length > 0 ? String(events.length) : '-'} sub="logged" />
              <StatPill label="Avg severity" value={avgSeverity} sub="/ 10" trend={events.length > 1 ? 'down' : undefined} />
              <StatPill label="Avg duration" value={avgDuration > 0 ? `${avgDuration}h` : '-'} sub="per episode" />
              <StatPill label="Aura events" value={events.length > 0 ? String(events.filter(e => e.aura).length) : '-'} />
            </div>

            {linkedPatients.length === 1 && (
              <DarkCard className="p-5 flex-shrink-0 max-w-xs">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4" style={{ color: '#E8A85A' }} strokeWidth={1.5} />
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700, color: '#E8A85A' }}>Patient actions</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => { setLoading(true); loadGPData() }}
                    style={{ width: '100%', padding: '8px 14px', borderRadius: 12, background: 'rgba(104,184,175,0.1)', border: '1px solid rgba(104,184,175,0.2)', color: '#68B8AF', fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Refresh data
                  </button>
                  <button
                    onClick={async () => {
                      const { revokeAccessCode } = await import('@/lib/supabase/db')
                      await revokeAccessCode(selectedPatient!.access_id)
                      loadGPData()
                    }}
                    style={{ width: '100%', padding: '8px 14px', borderRadius: 12, background: 'rgba(192,82,106,0.08)', border: '1px solid rgba(192,82,106,0.2)', color: '#C0526A', fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Unlink patient
                  </button>
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#8ABFBA', marginTop: 8 }}>
                    Link another patient? Use the patient selector above or ask them for a new code.
                  </div>
                </div>
              </DarkCard>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
              <DarkCard className="p-5 h-full">
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: '#DCEEED', marginBottom: 4 }}>Episode Frequency</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', marginBottom: 16 }}>Migraines per month</div>
                {frequencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={frequencyData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8ABFBA', fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#8ABFBA', fontFamily: 'Nunito' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {frequencyData.map((_, i) => (
                          <Cell key={i} fill={i === frequencyData.length - 1 ? '#72AA79' : '#265750'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState label="No episodes logged yet" />}
              </DarkCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
              <DarkCard className="p-5 h-full">
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: '#DCEEED', marginBottom: 4 }}>Severity Trend</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', marginBottom: 16 }}>Headache severity over time</div>
                {severityTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={severityTrend} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
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
                ) : <EmptyState label="No severity data yet" />}
              </DarkCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}>
              <DarkCard className="p-5 h-full">
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: '#DCEEED', marginBottom: 4 }}>Trigger Context</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', marginBottom: 16 }}>Reported co-factors</div>
                {triggerData.length > 0 ? (
                  <div className="space-y-2.5">
                    {triggerData.map(({ trigger, count }) => {
                      const max = triggerData[0]?.count ?? 1
                      return (
                        <div key={trigger} className="flex items-center gap-3">
                          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#DCEEED', minWidth: 120 }}>{trigger}</div>
                          <div className="flex-1 h-2 rounded-full" style={{ background: '#1E433E' }}>
                            <div className="h-2 rounded-full" style={{ width: `${(count / max) * 100}%`, background: count >= 5 ? '#C0526A' : count >= 3 ? '#E8A85A' : '#68B8AF' }} />
                          </div>
                          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', minWidth: 16, textAlign: 'right' }}>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : <EmptyState label="No trigger data yet" />}
              </DarkCard>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <DarkCard className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Pill className="w-5 h-5" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: '#DCEEED' }}>Medication Logs</h2>
              </div>
              {medicationSummary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {medicationSummary.map((med) => (
                    <div key={med.name} className="rounded-[16px] p-4" style={{ background: '#1E433E', border: '1px solid #265750' }}>
                      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: '#DCEEED', marginBottom: 12 }}>{med.name}</div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA' }}>Adherence</span>
                          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: med.effectiveness >= 75 ? '#72AA79' : '#E8A85A' }}>{med.effectiveness}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: '#132B28' }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${med.effectiveness}%`, background: med.effectiveness >= 75 ? '#72AA79' : '#68B8AF' }} />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mt-3" style={{ fontFamily: 'Nunito, sans-serif', color: '#8ABFBA' }}>
                        <span>{med.taken} taken</span>
                        <span>{med.skipped} skipped</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState label="No medication logs yet" />}
            </DarkCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}>
            <DarkCard className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-5 h-5" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: '#DCEEED' }}>Migraine Event Timeline</h2>
              </div>
              {sortedEvents.length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {sortedEvents.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedEvent(prev => prev?.id === ev.id ? null : ev)}
                      className="w-full text-left flex items-start gap-4 p-4 rounded-[16px] transition-all"
                      style={{
                        background: selectedEvent?.id === ev.id ? 'rgba(104,184,175,0.12)' : '#1E433E',
                        border: selectedEvent?.id === ev.id ? '1px solid rgba(104,184,175,0.5)' : '1px solid #265750',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                        style={{ background: severityColor(ev.severity), fontFamily: 'Nunito, sans-serif' }}>
                        {ev.severity}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, color: '#DCEEED' }}>{formatDate(ev.date)}</span>
                          {ev.duration != null && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(104,184,175,0.15)', color: '#68B8AF', fontFamily: 'Nunito, sans-serif' }}>{ev.duration}h</span>
                          )}
                          {ev.aura && <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(192,82,106,0.15)', color: '#C0526A', fontFamily: 'Nunito, sans-serif' }}>Aura</span>}
                          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA' }}>{severityLabel(ev.severity)}</span>
                        </div>
                        {(ev.triggers ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {(ev.triggers ?? []).map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#132B28', color: '#8ABFBA', fontFamily: 'Nunito, sans-serif' }}>{t}</span>
                            ))}
                          </div>
                        )}
                        {ev.notes && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#8ABFBA', fontStyle: 'italic', marginTop: 4 }}>{ev.notes}</div>}
                        {selectedEvent?.id === ev.id && (
                          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: '#68B8AF', marginTop: 4, fontWeight: 600 }}>▲ Focused in Neural Map</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : <EmptyState label="No migraine events logged yet" />}
            </DarkCard>
          </motion.div>

          {/* ── Neural Impact Map ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.26 }}>
            <BrainViewer events={events} selectedEvent={selectedEvent} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.28 }}>
            <DarkCard className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" style={{ color: '#68B8AF' }} strokeWidth={1.5} />
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: '#DCEEED' }}>AI Consultation Copilot</h2>
              </div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#8ABFBA', marginBottom: 20 }}>
                Ask anything about {patientName.split(' ')[0]}'s data before your appointment.
              </p>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[80%] rounded-[16px] px-4 py-3" style={{ background: msg.role === 'user' ? '#68B8AF' : '#1E433E', border: msg.role === 'ai' ? '1px solid #265750' : 'none' }}>
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Brain className="w-3 h-3" style={{ color: '#68B8AF' }} strokeWidth={2} />
                          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: '#68B8AF' }}>Cerevia AI</span>
                        </div>
                      )}
                      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: msg.role === 'user' ? 'white' : '#DCEEED', lineHeight: 1.6 }}>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {["What are the main triggers?", "Review medication adherence", "Is the plan working?"].map((q) => (
                  <button key={q} onClick={() => setAiInput(q)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ fontFamily: 'Nunito, sans-serif', background: 'rgba(104,184,175,0.12)', color: '#68B8AF', border: '1px solid rgba(104,184,175,0.25)', cursor: 'pointer' }}>
                    {q}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Ask about ${patientName.split(' ')[0]}'s data…`}
                  className="flex-1 px-4 py-3 rounded-[999px] text-sm border"
                  style={{ fontFamily: 'Nunito, sans-serif', background: '#1E433E', borderColor: '#2E5E57', color: '#DCEEED', outline: 'none' }}
                />
                <button onClick={sendMessage} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#68B8AF', color: 'white', border: 'none', cursor: 'pointer' }}>
                  <Send className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </DarkCard>
          </motion.div>
        </>
      )}
    </div>
  )
}
