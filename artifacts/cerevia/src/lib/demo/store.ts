import { useSyncExternalStore } from 'react'
import type { DailyReading, PatternEvent, UserBaseline, AstraUser, EnvironmentalReading } from './types'
import { generateSeedData, SEED_USER } from './seed'
import { calculateBaseline } from './baseline'
import { getDemoPatterns } from './patterns'
import { generateEnvironmentalData } from './env'

interface AstraState {
  isDemoLoaded: boolean
  user: AstraUser
  readings: DailyReading[]
  baseline: UserBaseline
  patterns: PatternEvent[]
  env: EnvironmentalReading[]
}

const EMPTY_BASELINE: UserBaseline = {
  sleepDuration:   { mean: 0, low: 0, high: 0 },
  restingHR:       { mean: 0, low: 0, high: 0 },
  hrv:             { mean: 0, low: 0, high: 0 },
  steps:           { mean: 0, low: 0, high: 0 },
  activeMinutes:   { mean: 0, low: 0, high: 0 },
  screenTimeHours: { mean: 0, low: 0, high: 0 },
  windowDays: 0,
  calculatedAt: '',
}

let state: AstraState = {
  isDemoLoaded: false,
  user: SEED_USER,
  readings: [],
  baseline: EMPTY_BASELINE,
  patterns: [],
  env: [],
}

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export function loadDemoData() {
  const readings  = generateSeedData()
  const baseline  = calculateBaseline(readings, 30)
  const patterns  = getDemoPatterns()
  const env       = generateEnvironmentalData()
  state = { isDemoLoaded: true, user: SEED_USER, readings, baseline, patterns, env }
  notify()
}

export function useAstraStore(): AstraState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => state,
  )
}
