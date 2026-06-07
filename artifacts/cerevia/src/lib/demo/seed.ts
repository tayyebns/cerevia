import type { MigraineEntry, TriggerCheckin, WearableDay } from './types'

// ---------------------------------------------------------------------------
// Sarah Ahmed — seeded demo patient.
// 29, chronic migraine, takes Sumatriptan. Story: migraines rose over ~3
// months; she suspects poor sleep and stress. Cerevia surfaces poor sleep +
// high stress as her strongest associated triggers, then her final week
// improves after following a sleep target.
//
// The data is deterministic (fixed pseudo-random seed) and anchored to "today"
// so the insight engine produces stable, narrative-consistent numbers:
//   Sleep ~87% · Stress ~74% · Skipped meals ~61% · Caffeine ~27%.
// ---------------------------------------------------------------------------

export const sarah = {
  name: 'Sarah Ahmed',
  firstName: 'Sarah',
  age: 29,
  condition: 'Chronic migraine',
  medication: 'Sumatriptan 50mg',
  sleepTarget: 7.5,
  mainConcern: 'My migraines are increasing and starting to affect my work.',
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = mulberry32(20260606)
const rand = (min: number, max: number) => min + rng() * (max - min)
const round1 = (n: number) => Math.round(n * 10) / 10

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

// --- Migraine plan (15 events) -------------------------------------------------
// flags drive both the migraine record and the matching check-in that day.
interface MigrainePlan {
  d: number // days ago
  sev: number
  poorSleep: boolean
  highStress: boolean
  skippedMeal: boolean
  caffeineVar: boolean
  med: boolean
  relief: MigraineEntry['reliefLevel']
  impact: string[]
}

const MIGRAINE_PLAN: MigrainePlan[] = [
  { d: 75, sev: 5, poorSleep: true,  highStress: false, skippedMeal: false, caffeineVar: false, med: false, relief: 'none',     impact: ['Needed rest'] },
  { d: 58, sev: 6, poorSleep: true,  highStress: true,  skippedMeal: false, caffeineVar: false, med: true,  relief: 'moderate', impact: ['Reduced productivity'] },
  { d: 52, sev: 8, poorSleep: true,  highStress: true,  skippedMeal: true,  caffeineVar: true,  med: true,  relief: 'slight',   impact: ['Missed work/study', 'Reduced productivity', 'Needed rest'] },
  { d: 47, sev: 7, poorSleep: true,  highStress: true,  skippedMeal: true,  caffeineVar: false, med: true,  relief: 'moderate', impact: ['Reduced productivity', 'Sleep disrupted'] },
  { d: 40, sev: 6, poorSleep: true,  highStress: true,  skippedMeal: false, caffeineVar: false, med: false, relief: 'none',     impact: ['Needed rest'] },
  { d: 34, sev: 7, poorSleep: true,  highStress: true,  skippedMeal: true,  caffeineVar: false, med: true,  relief: 'moderate', impact: ['Reduced productivity', 'Social plans cancelled'] },
  { d: 29, sev: 8, poorSleep: true,  highStress: true,  skippedMeal: true,  caffeineVar: true,  med: true,  relief: 'slight',   impact: ['Missed work/study', 'Reduced productivity', 'Needed rest'] },
  { d: 26, sev: 6, poorSleep: true,  highStress: true,  skippedMeal: true,  caffeineVar: false, med: false, relief: 'none',     impact: ['Reduced productivity'] },
  { d: 22, sev: 7, poorSleep: true,  highStress: true,  skippedMeal: true,  caffeineVar: false, med: true,  relief: 'moderate', impact: ['Reduced productivity', 'Needed rest'] },
  { d: 18, sev: 5, poorSleep: false, highStress: true,  skippedMeal: false, caffeineVar: false, med: false, relief: 'none',     impact: ['Sleep disrupted'] },
  { d: 15, sev: 8, poorSleep: true,  highStress: true,  skippedMeal: true,  caffeineVar: true,  med: true,  relief: 'strong',   impact: ['Reduced productivity', 'Needed rest'] },
  { d: 12, sev: 6, poorSleep: true,  highStress: false, skippedMeal: false, caffeineVar: false, med: false, relief: 'none',     impact: ['Needed rest'] },
  { d: 9,  sev: 7, poorSleep: true,  highStress: true,  skippedMeal: true,  caffeineVar: true,  med: true,  relief: 'moderate', impact: ['Reduced productivity', 'Sleep disrupted'] },
  { d: 7,  sev: 5, poorSleep: true,  highStress: true,  skippedMeal: true,  caffeineVar: false, med: false, relief: 'none',     impact: ['Needed rest'] },
  { d: 4,  sev: 4, poorSleep: false, highStress: false, skippedMeal: false, caffeineVar: false, med: false, relief: 'none',     impact: ['Reduced productivity'] },
]

const PAIN_LOCATIONS = ['One-sided (left)', 'One-sided (right)', 'Behind the eyes', 'Whole head', 'Temples']
const SYMPTOM_POOL = ['Aura', 'Nausea', 'Light sensitivity', 'Sound sensitivity', 'Dizziness', 'Visual disturbance', 'Neck pain']

function buildMigraines(): MigraineEntry[] {
  return MIGRAINE_PLAN.map((p, i) => {
    const symptoms = ['Light sensitivity']
    if (p.sev >= 6) symptoms.push('Nausea')
    if (p.sev >= 7) symptoms.push('Sound sensitivity')
    if (p.poorSleep && p.sev >= 7) symptoms.push('Aura')
    if (rng() > 0.6) symptoms.push(SYMPTOM_POOL[Math.floor(rng() * SYMPTOM_POOL.length)])
    const duration = Math.max(3, Math.round(p.sev * 2.2 + rand(-2, 3)))
    const startHour = 6 + Math.floor(rand(0, 12))
    const start = `${String(startHour).padStart(2, '0')}:${rng() > 0.5 ? '30' : '00'}`
    const endHour = Math.min(23, startHour + Math.min(duration, 16))
    return {
      id: `m-${p.d}`,
      date: isoDaysAgo(p.d),
      startTime: start,
      endTime: `${String(endHour).padStart(2, '0')}:00`,
      durationHours: duration,
      severity: p.sev,
      painLocation: PAIN_LOCATIONS[i % PAIN_LOCATIONS.length],
      symptoms: Array.from(new Set(symptoms)),
      medicationTaken: p.med,
      medicationName: p.med ? 'Sumatriptan 50mg' : undefined,
      timeToReliefMins: p.med ? Math.round(rand(40, 120)) : undefined,
      reliefLevel: p.relief,
      impact: p.impact,
      notes: p.sev >= 8 ? 'One of the worst episodes this period.' : '',
    }
  })
}

function buildCheckins(migraines: MigraineEntry[]): TriggerCheckin[] {
  const byDate = new Map(MIGRAINE_PLAN.map((p) => [isoDaysAgo(p.d), p]))
  const checkins: TriggerCheckin[] = []
  for (let d = 75; d >= 0; d--) {
    const date = isoDaysAgo(d)
    const m = byDate.get(date)
    const finalWeek = d <= 6
    // Sleep: poor on flagged migraine days; better in the improved final week.
    let sleepHours: number
    if (m?.poorSleep) sleepHours = round1(rand(4.4, 5.7))
    else if (finalWeek) sleepHours = round1(rand(7.1, 8.0))
    else sleepHours = round1(rand(5.9, 7.6))
    const sleepQuality = Math.max(1, Math.min(5, Math.round(sleepHours - 2.5)))
    // Stress: high on flagged days; calmer in the final week.
    let stressLevel: number
    if (m?.highStress) stressLevel = Math.round(rand(7, 9))
    else if (finalWeek) stressLevel = Math.round(rand(2, 4))
    else stressLevel = Math.round(rand(3, 6))
    const mealsSkipped = m?.skippedMeal ? Math.round(rand(1, 2)) : rng() > 0.85 ? 1 : 0
    const caffeineIntake = m?.caffeineVar ? (rng() > 0.5 ? 4 : 0) : Math.round(rand(1, 3))
    checkins.push({
      id: `c-${d}`,
      date,
      sleepHours,
      sleepQuality,
      stressLevel,
      hydration: Math.round(rand(2, 5)),
      mealsSkipped,
      caffeineIntake,
      screenTimeHours: round1(rand(4, 9)),
      activityLevel: Math.round(rand(1, 4)),
      weatherSensitivity: rng() > 0.8,
      hormonalRelated: d % 28 < 3,
      notes: '',
    })
  }
  return checkins
}

// --- Simulated Apple Watch / wearable stream -------------------------------
// A separate "device-measured" signal that complements self-reported check-ins.
// Sleep tracks the check-in sleep (watch measures slightly less asleep time);
// resting heart rate runs higher on high-stress / migraine days; activity dips
// on migraine days. Anchored to the same narrative so numbers stay consistent.
//
// Derivation is DETERMINISTIC PER DATE (the jitter is seeded from the date
// string), so the wearable stream can be rebuilt from current check-ins after
// the user logs new data without existing days shifting around.
function dateNoise(date: string): () => number {
  let h = 2166136261
  for (let i = 0; i < date.length; i++) {
    h ^= date.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return mulberry32(h >>> 0)
}

export function deriveWearableDay(c: TriggerCheckin, isMigraine: boolean): WearableDay {
  const n = dateNoise(c.date)
  const nrand = (min: number, max: number) => min + n() * (max - min)
  // Device-measured asleep time: a little under reported time in bed.
  const sleepHours = round1(Math.max(3.8, c.sleepHours - nrand(0.1, 0.5)))
  // Resting HR: baseline ~56, elevated by stress and on migraine days.
  let restingHR = 56 + (c.stressLevel - 5) * 1.1
  if (isMigraine) restingHR += 4
  restingHR = Math.round(Math.max(50, Math.min(74, restingHR + nrand(-1.5, 1.5))))
  const avgHR = Math.round(restingHR + 16 + nrand(0, 8))
  // Activity dips on migraine and high-stress days.
  let steps = 7800
  if (isMigraine) steps *= 0.5
  if (c.stressLevel >= 7) steps *= 0.85
  steps = Math.round(Math.max(1800, steps + nrand(-900, 900)))
  const activeMinutes = Math.max(6, Math.round(steps / 165 + nrand(-4, 4)))
  return { date: c.date, sleepHours, restingHR, avgHR, steps, activeMinutes }
}

export function buildWearable(checkins: TriggerCheckin[], migraines: MigraineEntry[]): WearableDay[] {
  const migraineDates = new Set(migraines.map((m) => m.date))
  return checkins.map((c) => deriveWearableDay(c, migraineDates.has(c.date)))
}

export function buildSarahData(): {
  checkins: TriggerCheckin[]
  migraines: MigraineEntry[]
  wearable: WearableDay[]
} {
  const migraines = buildMigraines()
  const checkins = buildCheckins(migraines)
  const wearable = buildWearable(checkins, migraines)
  return { checkins, migraines, wearable }
}
