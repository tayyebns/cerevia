export type SignalType =
  | 'sleep_duration'
  | 'resting_hr'
  | 'hrv'
  | 'steps'
  | 'active_minutes'
  | 'screen_time'

export interface DailyReading {
  date: string // YYYY-MM-DD
  sleepDuration: number // hours
  restingHR: number // bpm
  hrv: number // ms
  steps: number
  activeMinutes: number
  screenTimeHours: number
}

export interface SignalBaseline {
  mean: number
  low: number
  high: number
}

export interface UserBaseline {
  sleepDuration: SignalBaseline
  restingHR: SignalBaseline
  hrv: SignalBaseline
  steps: SignalBaseline
  activeMinutes: SignalBaseline
  screenTimeHours: SignalBaseline
  windowDays: number
  calculatedAt: string
}

export type PatternType =
  | 'recovery_strain'
  | 'sleep_disruption'
  | 'low_energy'
  | 'activity_intolerance'
  | 'autonomic_strain'
  | 'routine_disruption'

export type PatternSeverity = 'low' | 'moderate' | 'high'

export interface SupportingSignal {
  label: string
  change: string
  direction: 'up' | 'down' | 'irregular'
}

export interface PatternEvent {
  id: string
  patternType: PatternType
  startDate: string
  endDate: string | null // null = still active
  durationDays: number
  severity: PatternSeverity
  title: string
  summary: string
  supportingSignals: SupportingSignal[]
  suggestedAction: string
  confidence: number // 0–100
  isActive: boolean
  recurrenceOf?: string // id of earlier same-type pattern
}

export interface ConnectedSource {
  id: string
  name: string
  icon: string
  signals: string[]
  status: 'connected' | 'disconnected'
  connectedAt: string
}

export interface AstraUser {
  name: string
  connectedSources: ConnectedSource[]
  baselinePeriodDays: number
  onboardedAt: string
}

export type PollenLevel = 'low' | 'moderate' | 'high' | 'very_high'
export type PressureTrend = 'rising' | 'stable' | 'falling' | 'dropping_fast'

export interface EnvironmentalReading {
  date: string
  aqi: number              // 0–300 Air Quality Index
  pollenLevel: PollenLevel
  pressureTrend: PressureTrend
  heatIndex: number        // feels-like °C
  humidity: number         // 0–100 %
  uvIndex: number          // 0–11
}
