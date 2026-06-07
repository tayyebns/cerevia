// Trigger-management domain types for Cerevia.
// These power the mock-first experience and are shaped so a Supabase backend
// can be added later (snake_case columns map cleanly to these fields).

export type TriggerKey =
  | 'sleep'
  | 'stress'
  | 'meals'
  | 'caffeine'
  | 'screen'
  | 'hydration'

export interface TriggerCheckin {
  id: string
  date: string // YYYY-MM-DD
  sleepHours: number // 0–12
  sleepQuality: number // 1–5
  stressLevel: number // 1–10
  hydration: number // 1–5
  mealsSkipped: number // 0–3
  caffeineIntake: number // cups
  screenTimeHours: number // 0–16
  activityLevel: number // 1–5
  weatherSensitivity: boolean
  hormonalRelated: boolean
  notes?: string
}

export type ReliefLevel = 'none' | 'slight' | 'moderate' | 'strong'

export interface MigraineEntry {
  id: string
  date: string // YYYY-MM-DD
  startTime?: string // HH:MM
  endTime?: string // HH:MM
  durationHours: number
  severity: number // 1–10
  painLocation?: string
  symptoms: string[]
  medicationTaken: boolean
  medicationName?: string
  timeToReliefMins?: number
  reliefLevel: ReliefLevel
  impact: string[]
  notes?: string
}

export type AssociationStrength =
  | 'Very strong'
  | 'Strong'
  | 'Moderate'
  | 'Weak'
  | 'Unclear'

export interface TriggerScore {
  key: TriggerKey
  label: string
  confidence: number // 0–100
  strength: AssociationStrength
  explanation: string
}

export interface TriggerProfile {
  primary: TriggerScore
  secondary: TriggerScore[]
  all: TriggerScore[]
  managementFocus: string
  combination: string | null
  whatChanged: string | null
}

export type RiskLevel = 'Good' | 'Moderate' | 'Needs attention' | 'High risk' | 'Rising'

export interface TodayExposureItem {
  key: TriggerKey
  label: string
  level: RiskLevel
  detail: string
}

export interface OutcomeSnapshot {
  migraineDaysThisPeriod: number
  migraineDaysPrevPeriod: number
  changePct: number // signed
  avgSeverity: number
  daysDisrupted: number
  direction: 'improving' | 'worsening' | 'steady'
}

export interface CoachPlan {
  triggerLabel: string
  triggerKey: TriggerKey
  why: string
  target: string
  action: string
  progressDone: number
  progressTotal: number
  progressLabel: string
}

export interface GPSummary {
  rangeStart: string
  rangeEnd: string
  text: string
  structured: {
    migraineDays: number
    avgSeverity: number
    changeVsPrev: string
    topTriggers: { label: string; confidence: number }[]
    medication: string
    qualityOfLife: string
    mainConcern: string
    discussionAreas: string[]
  }
}

export type ReminderType =
  | 'sleep'
  | 'hydration'
  | 'meals'
  | 'screen'
  | 'stress'
  | 'checkin'
  | 'medication'

export interface TriggerReminder {
  id: string
  type: ReminderType
  title: string
  time: string // HH:MM
  linkedTrigger: string
  rationale: string
  active: boolean
}

export interface TriggerGoal {
  triggerKey: TriggerKey
  triggerLabel: string
  goalType: string
  targetValue: string
  currentValue: string
  status: 'on_track' | 'behind' | 'met'
}

// Simulated Apple Watch / wearable signal. Sleep, activity and heart rate only.
// Deliberately a separate "device-measured" stream that complements the
// self-reported check-ins and feeds trigger intelligence.
export interface WearableDay {
  date: string // YYYY-MM-DD
  sleepHours: number // device-measured asleep time
  restingHR: number // bpm
  avgHR: number // daytime average bpm
  steps: number
  activeMinutes: number
}

export interface WearableSummary {
  avgSleepThisWeek: number
  avgSleepPrev: number
  sleepTarget: number
  sleepMeetingTarget: boolean
  avgRestingHR: number
  avgRestingHRPrev: number
  avgSteps: number
  activeMinutesAvg: number
  sleepNarrative: string
  hrNarrative: string
  activityNarrative: string
}
