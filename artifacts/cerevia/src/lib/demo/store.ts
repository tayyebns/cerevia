import { useSyncExternalStore } from 'react'
import type { MigraineEntry, TriggerCheckin, TriggerReminder, WearableDay } from './types'
import { buildSarahData, buildWearable } from './seed'

// ---------------------------------------------------------------------------
// In-memory demo store. Seeded with Sarah Ahmed's data so the entire product
// is fully usable without any backend. New check-ins / migraine logs are added
// live during a session (resets on reload). Structured so a Supabase-backed
// implementation can replace these functions later without touching screens.
// ---------------------------------------------------------------------------

interface DemoState {
  checkins: TriggerCheckin[]
  migraines: MigraineEntry[]
  reminders: TriggerReminder[]
  wearable: WearableDay[]
  demoLoaded: boolean
}

const DEFAULT_REMINDERS: TriggerReminder[] = [
  { id: 'r-sleep', type: 'sleep', title: 'Sleep wind-down', time: '22:15', linkedTrigger: 'Poor sleep', rationale: 'Nights under 6 hours appear associated with your migraine reports.', active: true },
  { id: 'r-checkin', type: 'checkin', title: 'Daily trigger check-in', time: '20:00', linkedTrigger: 'All triggers', rationale: 'A quick daily check-in keeps your trigger profile accurate.', active: true },
  { id: 'r-meals', type: 'meals', title: 'Meal consistency', time: '12:30', linkedTrigger: 'Skipped meals', rationale: 'Skipped meals appear associated with several of your episodes.', active: true },
  { id: 'r-hydration', type: 'hydration', title: 'Hydration reminder', time: '15:00', linkedTrigger: 'Hydration', rationale: 'Staying hydrated supports your overall trigger management.', active: false },
  { id: 'r-screen', type: 'screen', title: 'Screen break', time: '17:30', linkedTrigger: 'Screen time', rationale: 'Long screen sessions are worth monitoring alongside your reports.', active: false },
  { id: 'r-med', type: 'medication', title: 'Sumatriptan on hand', time: '08:00', linkedTrigger: 'Medication', rationale: 'A reminder to keep your prescribed medication accessible.', active: true },
]

let state: DemoState = {
  checkins: [],
  migraines: [],
  reminders: DEFAULT_REMINDERS,
  wearable: [],
  demoLoaded: false,
}

const listeners = new Set<() => void>()
function emit() {
  state = { ...state }
  listeners.forEach((l) => l())
}
function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
function getSnapshot() {
  return state
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

// Keep the simulated wearable stream in sync with the (possibly mutated)
// check-ins / migraines. Derivation is deterministic per date, so existing
// days stay stable and only the changed day updates.
function rebuildWearable() {
  state.wearable = buildWearable(state.checkins, state.migraines)
}

export function addCheckin(input: Omit<TriggerCheckin, 'id' | 'date'> & { date?: string }) {
  const date = input.date ?? todayIso()
  const next: TriggerCheckin = { ...input, id: `c-new-${Date.now()}`, date }
  state.checkins = [...state.checkins.filter((c) => c.date !== date), next]
  rebuildWearable()
  emit()
  return next
}

export function addMigraine(input: Omit<MigraineEntry, 'id' | 'date'> & { date?: string }) {
  const date = input.date ?? todayIso()
  const next: MigraineEntry = { ...input, id: `m-new-${Date.now()}`, date }
  state.migraines = [next, ...state.migraines]
  rebuildWearable()
  emit()
  return next
}

export function loadDemoData() {
  const seed = buildSarahData()
  state = { ...state, checkins: seed.checkins, migraines: seed.migraines, wearable: seed.wearable, demoLoaded: true }
  emit()
}

export function toggleReminder(id: string) {
  state.reminders = state.reminders.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
  emit()
}

export function useDemoData(): DemoState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
