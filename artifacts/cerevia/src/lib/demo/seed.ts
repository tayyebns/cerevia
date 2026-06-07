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

function jitter(rng: () => number, magnitude: number): number {
  return (rng() - 0.5) * magnitude * 2
}

// 90-day deterministic dataset. Index 0 = 89 days ago, index 89 = today.
// Pattern windows (days-ago from today):
//   P1 – Recovery strain:            days 82–77  (resolved)
//   P2 – Sleep disruption + strain:  days 55–49  (resolved, recurrence of P1 type)
//   P3 – Activity intolerance:       days 22–17  (resolved)
//   P4 – Recovery strain (ACTIVE):   days 4–0    (ongoing, recurrence of P1/P2 type)
export function generateSeedData(): DailyReading[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const BASE = {
    sleep: 7.2,
    rhr: 54,
    hrv: 42,
    steps: 8200,
    activeMins: 42,
    screenTime: 3.8,
  }

  const readings: DailyReading[] = []

  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    const d = new Date(today)
    d.setDate(today.getDate() - daysAgo)
    const dateStr = d.toISOString().split('T')[0]

    const rng = mulberry32(daysAgo * 1_234_567 + 89)

    let sleep = BASE.sleep + jitter(rng, 0.55)
    let rhr   = BASE.rhr   + jitter(rng, 2.5)
    let hrv   = BASE.hrv   + jitter(rng, 4.5)
    let steps = BASE.steps + jitter(rng, 1100)
    let activ = BASE.activeMins + jitter(rng, 7)
    let scr   = BASE.screenTime + jitter(rng, 0.7)

    // P1 – Recovery strain (days 82–77 ago)
    if (daysAgo >= 77 && daysAgo <= 82) {
      rhr   += 5.5 + rng() * 3
      hrv   -= 7.5 + rng() * 3.5
      sleep -= 0.7 + rng() * 0.35
    }

    // P2 – Sleep disruption + recovery strain (days 55–49 ago)
    if (daysAgo >= 49 && daysAgo <= 55) {
      sleep -= 1.15 + rng() * 0.45
      rhr   += 7   + rng() * 3.5
      hrv   -= 10  + rng() * 4.5
      scr   += 1.4 + rng() * 0.7
    }

    // P3 – Activity intolerance (days 22–17 ago)
    if (daysAgo >= 17 && daysAgo <= 22) {
      const dayInPattern = 22 - daysAgo
      if (dayInPattern <= 1) {
        steps += 5800 + rng() * 1800
        activ += 32  + rng() * 14
      } else {
        steps -= 3200 + rng() * 900
        activ -= 18  + rng() * 9
        rhr   += 4.5 + rng() * 2.5
        hrv   -= 6   + rng() * 3
      }
    }

    // P4 – Current recovery strain (days 4–0 ago, ACTIVE)
    if (daysAgo >= 0 && daysAgo <= 4) {
      sleep -= 0.95 + rng() * 0.4
      rhr   += 8   + rng() * 3
      hrv   -= 9   + rng() * 4
      steps -= 1600 + rng() * 550
    }

    readings.push({
      date: dateStr,
      sleepDuration:    Math.round(Math.max(4.0, Math.min(10.0, sleep)) * 10) / 10,
      restingHR:        Math.round(Math.max(44, Math.min(92, rhr))),
      hrv:              Math.round(Math.max(14, Math.min(88, hrv))),
      steps:            Math.round(Math.max(800, Math.min(20000, steps))),
      activeMinutes:    Math.round(Math.max(5, Math.min(120, activ))),
      screenTimeHours:  Math.round(Math.max(0.5, Math.min(10, scr)) * 10) / 10,
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
  name: 'Alex',
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
