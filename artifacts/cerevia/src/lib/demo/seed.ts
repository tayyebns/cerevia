import type { DailyReading, AstraUser } from './types'

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Ahmad - 34yo, chronic fatigue + mild asthma, Apple Watch user.
// 90-day deterministic dataset. Index 0 = 89 days ago, index 89 = today.
//
// Pattern windows (days-ago from today):
//   A – Autonomic strain:       days 82–77  (high pollen + falling pressure)
//   B – Low energy / fatigue:   days 55–49  (wildfire AQI spike + 80%+ humidity)
//   C – Activity intolerance:   days 22–17  (cold front dropping fast + humidity)
//   D – Autonomic strain ACTIVE: days 4–0   (same trigger as A, caught early)
export function generateSeedData(): DailyReading[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const BASE = {
    sleep:      7.5,
    rhr:        58,
    hrv:        45,
    steps:      8000,
    activeMins: 45,
    screenTime: 3.5,
  }

  const readings: DailyReading[] = []

  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    const d = new Date(today)
    d.setDate(today.getDate() - daysAgo)
    const dateStr = d.toISOString().split('T')[0]

    const rng = mulberry32(daysAgo * 1_234_567 + 42)

    let sleep = BASE.sleep      + (rng() * 1.4 - 0.7)
    let rhr   = BASE.rhr        + (rng() * 4   - 2)
    let hrv   = BASE.hrv        + (rng() * 8   - 4)
    let steps = BASE.steps      + (rng() * 2000 - 1000)
    let activ = BASE.activeMins + (rng() * 18  - 9)
    let scr   = BASE.screenTime + (rng() * 1.8 - 0.9)

    // Window A – Autonomic strain (days 82–77): pollen + dropping pressure
    if (daysAgo >= 77 && daysAgo <= 82) {
      rhr   += 8  + rng() * 2
      hrv   -= 12 + rng() * 3
      sleep -= 1.5 + rng() * 0.5
    }

    // Window B – Low energy / fatigue (days 55–49): wildfire AQI + high humidity
    else if (daysAgo >= 49 && daysAgo <= 55) {
      steps  -= 4500 + rng() * 500
      activ   = 10  + rng() * 5
      sleep  -= 2.0 + rng() * 0.3
      scr    += 2.5 + rng() * 0.5
      rhr    += 4   + rng() * 2
      hrv    -= 8   + rng() * 2
    }

    // Window C – Activity intolerance (days 22–17): cold front + humidity spike
    else if (daysAgo >= 17 && daysAgo <= 22) {
      hrv   -= 15 + rng() * 2
      steps -= 3000 + rng() * 500
      activ -= 20  + rng() * 8
      rhr   += 5   + rng() * 2
    }

    // Window D – Autonomic strain ACTIVE (days 4–0): recurrence of A
    else if (daysAgo >= 0 && daysAgo <= 4) {
      rhr   += 6  + rng() * 2
      hrv   -= 10 + rng() * 3
      sleep -= 1.0 + rng() * 0.5
    }

    readings.push({
      date:            dateStr,
      sleepDuration:   Math.round(Math.max(3.5, Math.min(10.0, sleep)) * 10) / 10,
      restingHR:       Math.round(Math.max(44,  Math.min(95,   rhr))),
      hrv:             Math.round(Math.max(12,  Math.min(90,   hrv))),
      steps:           Math.round(Math.max(500, Math.min(20000, steps))),
      activeMinutes:   Math.round(Math.max(0,   Math.min(120,  activ))),
      screenTimeHours: Math.round(Math.max(0.5, Math.min(10,   scr)) * 10) / 10,
    })
  }

  return readings
}

function daysAgoIso(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export const SEED_USER: AstraUser = {
  name: 'Ahmad',
  onboardedAt: daysAgoIso(89),
  baselinePeriodDays: 90,
  connectedSources: [
    {
      id: 'apple_health',
      name: 'Apple Health',
      icon: '🍎',
      signals: ['Sleep duration', 'Resting HR', 'HRV', 'Steps', 'Active minutes'],
      status: 'connected',
      connectedAt: daysAgoIso(89),
    },
    {
      id: 'iphone',
      name: 'iPhone',
      icon: '📱',
      signals: ['Screen time'],
      status: 'connected',
      connectedAt: daysAgoIso(89),
    },
  ],
}
