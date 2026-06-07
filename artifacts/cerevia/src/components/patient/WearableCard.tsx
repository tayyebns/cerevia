import { motion } from 'framer-motion'
import { Watch, Moon, HeartPulse, Footprints } from 'lucide-react'
import type { WearableSummary } from '@/lib/demo/types'

// Simulated Apple Watch card. Surfaces device-measured sleep, resting heart
// rate and activity, and ties them back to trigger management. Purely
// illustrative - labelled "simulated" so it is never mistaken for real data.
export function WearableCard({
  summary,
  delay = 0,
  showNarrative = true,
}: {
  summary: WearableSummary
  delay?: number
  showNarrative?: boolean
}) {
  const metrics = [
    {
      icon: Moon,
      label: 'Sleep · this wk',
      value: `${summary.avgSleepThisWeek}h`,
      sub: summary.sleepMeetingTarget ? `target ${summary.sleepTarget}h` : `below ${summary.sleepTarget}h`,
      color: summary.sleepMeetingTarget ? '#4A7A50' : '#B07030',
    },
    {
      icon: HeartPulse,
      label: 'Resting HR',
      value: `${summary.avgRestingHR}`,
      sub: 'bpm',
      color: '#C0526A',
    },
    {
      icon: Footprints,
      label: 'Activity',
      value: summary.avgSteps.toLocaleString(),
      sub: 'steps/day',
      color: '#68B8AF',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-[24px] border p-5"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 4px 24px rgba(15,22,21,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(104,184,175,0.16)' }}>
          <Watch className="w-4 h-4" strokeWidth={1.75} style={{ color: '#4A9990' }} />
        </div>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Apple Watch · simulated
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-[16px] p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <m.icon className="w-4 h-4 mb-1.5" strokeWidth={1.75} style={{ color: m.color }} />
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 19, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>{m.value}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: 'var(--text-subtle)' }}>{m.sub}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: 'var(--text-subtle)', marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {showNarrative && (
        <div className="mt-3.5 space-y-1.5">
          {[summary.sleepNarrative, summary.hrNarrative, summary.activityNarrative].map((line) => (
            <p key={line} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12.5, color: 'var(--text-subtle)', lineHeight: 1.5 }}>
              {line}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  )
}
