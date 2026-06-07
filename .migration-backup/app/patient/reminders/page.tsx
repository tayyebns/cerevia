'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Clock, Moon, Check, X } from 'lucide-react'
import { medications } from '@/lib/data'

export const dynamic = 'force-dynamic'

type MedStatus = 'taken' | 'skipped' | 'pending'

export default function Reminders() {
  const [statuses, setStatuses] = useState<MedStatus[]>(medications.map((m) => m.status as MedStatus))

  const taken = statuses.filter((s) => s === 'taken').length
  const total = statuses.length
  const pct = Math.round((taken / total) * 100)

  function mark(idx: number, status: MedStatus) {
    setStatuses((prev) => {
      const next = [...prev]
      next[idx] = status
      return next
    })
  }

  const groups = [
    { label: 'Morning', icon: Sun, color: '#E8A85A', time: 'morning' },
    { label: 'Afternoon', icon: Clock, color: '#68B8AF', time: 'afternoon' },
    { label: 'Evening', icon: Moon, color: '#6B7CC4', time: 'evening' },
  ]

  return (
    <div className="px-5 py-4 space-y-5">
      <div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: 'var(--text)', marginBottom: 2 }}>Reminders</h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>Your medication schedule for today</p>
      </div>

      {/* Progress card */}
      <div className="rounded-[22px] border p-5 space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
            {taken} of {total} taken today
          </span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 700, color: '#68B8AF' }}>{pct}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full" style={{ background: 'var(--surface-2)' }}>
          <motion.div
            className="h-2.5 rounded-full"
            style={{ background: '#68B8AF' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)' }}>
          {total - taken} medication{total - taken !== 1 ? 's' : ''} still to take today.
        </p>
      </div>

      {/* Medication groups */}
      {groups.map(({ label, icon: Icon, color, time }) => {
        const meds = medications.map((m, i) => ({ ...m, idx: i })).filter((m) => m.time === time)
        if (meds.length === 0) return null
        return (
          <div key={time} className="rounded-[22px] border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: '#EEF5F5' }}>
              <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color }} />
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{label}</span>
            </div>
            <div className="divide-y" style={{ borderColor: '#EEF5F5' }}>
              {meds.map(({ name, dose, idx }) => {
                const status = statuses[idx]
                return (
                  <div key={idx} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* Status indicator */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                        style={{
                          borderColor: status === 'taken' ? '#72AA79' : status === 'skipped' ? '#DDE9E8' : '#DDE9E8',
                          background: status === 'taken' ? '#72AA79' : 'transparent',
                        }}
                      >
                        {status === 'taken' && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: 'Nunito, sans-serif',
                            fontSize: 15,
                            fontWeight: 600,
                            color: status !== 'pending' ? '#8AA8A6' : '#1C2625',
                            textDecoration: status === 'taken' ? 'line-through' : 'none',
                          }}
                        >
                          {name}
                        </div>
                        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)' }}>{dose}</div>
                      </div>
                    </div>
                    {status === 'taken' && (
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: '#72AA79' }}>Taken</span>
                    )}
                    {status === 'skipped' && (
                      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text-subtle)' }}>Skipped</span>
                    )}
                    {status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => mark(idx, 'taken')}
                          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                          style={{ background: '#EEF5EE', color: '#4A7A50', fontFamily: 'Nunito, sans-serif' }}
                        >
                          Taken
                        </button>
                        <button
                          onClick={() => mark(idx, 'skipped')}
                          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                          style={{ background: 'var(--surface-2)', color: 'var(--text-subtle)', fontFamily: 'Nunito, sans-serif' }}
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
