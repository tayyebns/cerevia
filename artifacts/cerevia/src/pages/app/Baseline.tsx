import { useAstraStore } from '@/lib/demo/store'
import { isOutsideBaseline, deviationPct } from '@/lib/demo/baseline'
import type { SignalBaseline, DailyReading } from '@/lib/demo/types'

interface SignalRowProps {
  label: string
  unit: string
  baseline: SignalBaseline
  currentValue: number
  higherIsBetter: boolean
  description: string
}

function SignalRow({ label, unit, baseline, currentValue, higherIsBetter, description }: SignalRowProps) {
  const outside = isOutsideBaseline(currentValue, baseline)
  const pct = deviationPct(currentValue, baseline.mean)
  const isHigh = currentValue > baseline.mean
  const isBetter = higherIsBetter ? isHigh : !isHigh
  const deviationClass = outside ? (isBetter ? 'dev-better' : 'dev-worse') : 'dev-normal'

  // Position marker on bar (0–100%)
  const range = baseline.high - baseline.low || 1
  const clampedPos = Math.max(0, Math.min(100,
    ((currentValue - baseline.low) / (baseline.high - baseline.low)) * 100
  ))

  return (
    <div className={`baseline-row ${outside ? 'baseline-row-outside' : ''}`}>
      <div className="baseline-row-header">
        <div>
          <span className="baseline-signal-label">{label}</span>
          <span className="baseline-signal-desc">{description}</span>
        </div>
        <div className="baseline-row-values">
          <span className={`baseline-current ${deviationClass}`}>{currentValue}{unit}</span>
          {outside && (
            <span className={`baseline-pct ${isBetter ? 'pct-better' : 'pct-worse'}`}>
              {pct > 0 ? '+' : ''}{pct}%
            </span>
          )}
        </div>
      </div>

      {/* Visual bar */}
      <div className="baseline-bar-wrap">
        <div className="baseline-bar-range">
          <div
            className="baseline-bar-fill"
            style={{ left: '0%', right: '0%' }}
          />
          <div
            className={`baseline-bar-marker ${outside ? 'marker-outside' : 'marker-inside'}`}
            style={{ left: `${clampedPos}%` }}
          />
        </div>
        <div className="baseline-bar-labels">
          <span>{baseline.low}{unit}</span>
          <span className="baseline-bar-mid">typical range</span>
          <span>{baseline.high}{unit}</span>
        </div>
      </div>

      <div className="baseline-row-meta">
        Usual range: <strong>{baseline.low}{unit} – {baseline.high}{unit}</strong> · Average: <strong>{baseline.mean}{unit}</strong>
      </div>
    </div>
  )
}

export default function Baseline() {
  const { baseline, readings } = useAstraStore()

  if (!baseline.calculatedAt) return null

  const latest = readings[readings.length - 1] as DailyReading | undefined

  const signals: SignalRowProps[] = latest
    ? [
        { label: 'Sleep duration',   unit: 'h',    baseline: baseline.sleepDuration,   currentValue: latest.sleepDuration,   higherIsBetter: true,  description: 'Hours of sleep measured by your device' },
        { label: 'Resting heart rate', unit: ' bpm', baseline: baseline.restingHR,     currentValue: latest.restingHR,       higherIsBetter: false, description: 'Resting HR on waking — lower typically means better recovery' },
        { label: 'HRV',              unit: ' ms',  baseline: baseline.hrv,             currentValue: latest.hrv,             higherIsBetter: true,  description: 'Heart rate variability — higher values generally reflect better recovery' },
        { label: 'Daily steps',      unit: '',     baseline: baseline.steps,           currentValue: latest.steps,           higherIsBetter: true,  description: 'Total steps from phone and wearable' },
        { label: 'Active minutes',   unit: ' min', baseline: baseline.activeMinutes,   currentValue: latest.activeMinutes,   higherIsBetter: true,  description: 'Minutes of elevated movement' },
        { label: 'Screen time',      unit: 'h',    baseline: baseline.screenTimeHours, currentValue: latest.screenTimeHours, higherIsBetter: false, description: 'Late-night screen time may contribute to sleep disruption' },
      ]
    : []

  const deviationsToday = signals.filter((s) => isOutsideBaseline(s.currentValue, s.baseline)).length

  return (
    <div className="screen-baseline">
      <h1 className="screen-title">Your Baseline</h1>
      <p className="screen-subtitle">
        What normal looks like for you — calculated from your last {baseline.windowDays} days of data, not a population average.
      </p>

      {/* Summary */}
      <div className="baseline-summary">
        <div className="baseline-summary-item">
          <span className="baseline-summary-value">{baseline.windowDays}</span>
          <span className="baseline-summary-label">days of data</span>
        </div>
        <div className="baseline-summary-item">
          <span className="baseline-summary-value">{signals.length}</span>
          <span className="baseline-summary-label">signals tracked</span>
        </div>
        <div className="baseline-summary-item">
          <span className={`baseline-summary-value ${deviationsToday > 0 ? 'dev-worse' : 'dev-normal'}`}>{deviationsToday}</span>
          <span className="baseline-summary-label">outside range today</span>
        </div>
      </div>

      {/* Signal rows */}
      <div className="baseline-signals">
        {signals.map((s) => (
          <SignalRow key={s.label} {...s} />
        ))}
      </div>

      <div className="baseline-how">
        <div className="baseline-how-title">How your baseline is calculated</div>
        <p className="baseline-how-body">
          Astra uses a rolling 30-day window of your stable data to establish your personal normal range for each signal. The range shows where your values typically fall. Current values are compared against this — not against population averages or general guidelines.
        </p>
        <p className="baseline-how-body">
          As more data is collected, the baseline becomes more accurate. Patterns are only surfaced when deviations are meaningful, repeated and cross multiple signals — not from single-day changes.
        </p>
      </div>

      <p className="screen-safety">
        Baseline values are personal context only. They do not constitute medical information. This is not a diagnosis.
      </p>
    </div>
  )
}
