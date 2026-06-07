'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarDays, Bell, Mic } from 'lucide-react'
import { patient, recentSymptoms } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default function PatientHome() {
  return (
    <div className="px-5 py-4 space-y-5">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 300,
            color: 'var(--text)',
            marginBottom: 2,
          }}
        >
          Welcome, {patient.name}
        </h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, color: 'var(--text-subtle)' }}>Your health, clearly tracked.</p>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06 }}
        className="rounded-[28px] border p-5 space-y-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 4px 24px rgba(15,22,21,0.08)' }}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
            style={{ background: '#68B8AF', fontFamily: 'Nunito, sans-serif' }}
          >
            {patient.name[0]}
          </div>
          <div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{patient.name}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--text-subtle)' }}>{patient.condition}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: `${patient.adherenceToday}%`, label: 'Adherence today' },
            { value: '13', label: 'Total logged' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-[16px] p-3"
              style={{ background: 'var(--bg)', border: '1px solid #EEF5F5' }}
            >
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 24, fontWeight: 700, color: '#68B8AF' }}>{value}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: 'var(--text-subtle)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Most recent */}
        <div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Most recent
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            {recentSymptoms[0].symptom} —{' '}
            <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>{recentSymptoms[0].severity}/10</span>
          </div>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/patient/daily-care', icon: CalendarDays, label: 'Daily Care', color: '#68B8AF' },
          { href: '/patient/reminders', icon: Bell, label: 'Reminders', color: '#72AA79' },
          { href: '/patient/capture', icon: Mic, label: 'Capture', color: '#68B8AF' },
        ].map(({ href, icon: Icon, label, color }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
          >
            <Link href={href} style={{ textDecoration: 'none' }}>
              <div
                className="rounded-[22px] border p-4 flex items-center gap-3 min-h-[68px] transition-all duration-200 hover:shadow-md active:scale-95"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 2px 12px rgba(15,22,21,0.06)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18` }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color }} />
                </div>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
