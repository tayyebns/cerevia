import type { DailyReading, UserBaseline, SignalBaseline } from './types'

function stats(values: number[]): SignalBaseline {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
  const std = Math.sqrt(variance)
  return {
    mean: Math.round(mean * 10) / 10,
    low:  Math.round((mean - std * 1.5) * 10) / 10,
    high: Math.round((mean + std * 1.5) * 10) / 10,
  }
}

// Use the stable middle of the dataset (days 70–15 ago) as baseline
// to avoid including current active deviations or the very beginning.
export function calculateBaseline(readings: DailyReading[], windowDays = 30): UserBaseline {
  const stableReadings = readings.slice(20, 20 + windowDays)

  return {
    sleepDuration:   stats(stableReadings.map((r) => r.sleepDuration)),
    restingHR:       stats(stableReadings.map((r) => r.restingHR)),
    hrv:             stats(stableReadings.map((r) => r.hrv)),
    steps:           stats(stableReadings.map((r) => r.steps)),
    activeMinutes:   stats(stableReadings.map((r) => r.activeMinutes)),
    screenTimeHours: stats(stableReadings.map((r) => r.screenTimeHours)),
    windowDays,
    calculatedAt: new Date().toISOString(),
  }
}

export function deviationPct(current: number, baselineMean: number): number {
  return Math.round(((current - baselineMean) / baselineMean) * 100)
}

export function isOutsideBaseline(value: number, baseline: SignalBaseline): boolean {
  return value < baseline.low || value > baseline.high
}
