import type { EnvironmentalReading, PollenLevel, PressureTrend } from './types'

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Environmental data correlated with pattern windows:
//   P1 (days 82–77 ago) — high pollen + dropping pressure (spring front)
//   P2 (days 55–49 ago) — AQI spike + heat wave (summer pollution)
//   P3 (days 22–17 ago) — cold front + humidity spike
//   P4 (days 4–0 ago)   — high pollen + dropping pressure (same trigger as P1)
//
// The P1/P4 match is the key demo insight: same environmental combination → same body response
export function generateEnvironmentalData(): EnvironmentalReading[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const readings: EnvironmentalReading[] = []

  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    const d = new Date(today)
    d.setDate(today.getDate() - daysAgo)
    const date = d.toISOString().split('T')[0]
    const rng = mulberry32(daysAgo * 7_654_321 + 42)

    // Baseline quiet environment
    let aqi = 35 + rng() * 20
    let pollenLevel: PollenLevel = rng() < 0.4 ? 'low' : 'moderate'
    let pressureTrend: PressureTrend = 'stable'
    let heatIndex = 18 + rng() * 6
    let humidity = 45 + rng() * 15
    let uvIndex = 3 + Math.round(rng() * 4)

    // P1 window (days 82–77): High pollen + dropping pressure
    if (daysAgo >= 77 && daysAgo <= 85) {
      pollenLevel = daysAgo >= 79 && daysAgo <= 83 ? 'very_high' : 'high'
      pressureTrend = daysAgo >= 80 && daysAgo <= 82 ? 'dropping_fast' : 'falling'
      aqi = 58 + rng() * 25
      heatIndex = 22 + rng() * 5
    }

    // P2 window (days 55–49): AQI spike + heat wave
    if (daysAgo >= 47 && daysAgo <= 57) {
      aqi = 115 + rng() * 55
      heatIndex = 31 + rng() * 6
      humidity = 72 + rng() * 15
      pollenLevel = 'moderate'
      pressureTrend = daysAgo >= 51 && daysAgo <= 53 ? 'dropping_fast' : 'stable'
      uvIndex = 8 + Math.round(rng() * 3)
    }

    // P3 window (days 22–17): Cold front + humidity spike
    if (daysAgo >= 15 && daysAgo <= 24) {
      humidity = 82 + rng() * 12
      pressureTrend = daysAgo >= 19 && daysAgo <= 21 ? 'dropping_fast' : 'falling'
      heatIndex = 12 + rng() * 5
      aqi = 42 + rng() * 18
      pollenLevel = daysAgo >= 18 && daysAgo <= 22 ? 'high' : 'moderate'
    }

    // P4 window (days 4–0): Same as P1 — high pollen + dropping pressure
    if (daysAgo >= 0 && daysAgo <= 6) {
      pollenLevel = daysAgo <= 4 ? 'very_high' : 'high'
      pressureTrend = daysAgo <= 3 ? 'dropping_fast' : 'falling'
      aqi = daysAgo <= 4 ? 108 + rng() * 30 : 65 + rng() * 20
      heatIndex = 24 + rng() * 6
      uvIndex = 6 + Math.round(rng() * 3)
    }

    readings.push({
      date,
      aqi:          Math.round(aqi),
      pollenLevel,
      pressureTrend,
      heatIndex:    Math.round(heatIndex),
      humidity:     Math.round(humidity),
      uvIndex:      Math.max(0, Math.min(11, uvIndex)),
    })
  }

  return readings
}

export function getEnvForDate(
  env: EnvironmentalReading[],
  date: string,
): EnvironmentalReading | undefined {
  return env.find((e) => e.date === date)
}

export function getEnvForPattern(
  env: EnvironmentalReading[],
  startDate: string,
  endDate: string | null,
): EnvironmentalReading[] {
  return env.filter((e) => {
    if (e.date < startDate) return false
    if (endDate && e.date > endDate) return false
    return true
  })
}

export const POLLEN_LABELS: Record<PollenLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
}

export const PRESSURE_LABELS: Record<PressureTrend, string> = {
  rising: 'Rising',
  stable: 'Stable',
  falling: 'Falling',
  dropping_fast: 'Dropping fast',
}

export function aqiLabel(aqi: number): string {
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy — sensitive groups'
  if (aqi <= 200) return 'Unhealthy'
  return 'Very Unhealthy'
}

export function envPatternTrigger(
  env: EnvironmentalReading[],
  startDate: string,
  endDate: string | null,
): string | null {
  const window = getEnvForPattern(env, startDate, endDate)
  if (!window.length) return null

  const hasHighPollen  = window.some((e) => e.pollenLevel === 'high' || e.pollenLevel === 'very_high')
  const hasHighAqi     = window.some((e) => e.aqi > 100)
  const hasDroppingP   = window.some((e) => e.pressureTrend === 'dropping_fast' || e.pressureTrend === 'falling')
  const hasHeat        = window.some((e) => e.heatIndex > 29)
  const hasHumidity    = window.some((e) => e.humidity > 78)

  const triggers: string[] = []
  if (hasHighPollen) triggers.push('high pollen')
  if (hasHighAqi)    triggers.push('poor air quality')
  if (hasDroppingP)  triggers.push('falling barometric pressure')
  if (hasHeat)       triggers.push('heat stress')
  if (hasHumidity)   triggers.push('high humidity')

  if (!triggers.length) return null
  return triggers.slice(0, 2).join(' + ')
}
