import type { PatternEvent, PatternType } from './types'

function daysAgoIso(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function monthAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

// Ahmad's 4 pattern events - matching seed.ts windows A/B/C/D
export function getDemoPatterns(): PatternEvent[] {
  return [
    {
      id: 'evt_001',
      patternType: 'autonomic_strain',
      startDate: daysAgoIso(82),
      endDate: daysAgoIso(77),
      durationDays: 6,
      severity: 'moderate',
      title: 'Your body worked harder than usual',
      summary:
        'High pollen and shifting barometric pressure put extra strain on your system, elevating your resting heart rate and shortening your sleep for 6 days.',
      supportingSignals: [
        { label: 'Resting heart rate', change: '+8 bpm',  direction: 'up' },
        { label: 'Heart rate variability', change: '−12 ms', direction: 'down' },
        { label: 'Sleep duration',     change: '−1.5 hrs', direction: 'down' },
      ],
      suggestedAction:
        'Run your HEPA filter overnight and consider an antihistamine before bed when pollen is high.',
      confidence: 88,
      isActive: false,
    },
    {
      id: 'evt_002',
      patternType: 'low_energy',
      startDate: daysAgoIso(55),
      endDate: daysAgoIso(49),
      durationDays: 7,
      severity: 'high',
      title: 'Poor air quality triggered extreme fatigue',
      summary:
        'Wildfire smoke pushed air quality into unhealthy levels for a week. Your daily steps and active minutes dropped sharply - your body conserved energy to protect your lungs.',
      supportingSignals: [
        { label: 'Daily steps',    change: '−4,500',   direction: 'down' },
        { label: 'Active minutes', change: '−35 mins',  direction: 'down' },
        { label: 'Screen time',    change: '+2.5 hrs',  direction: 'up' },
      ],
      suggestedAction:
        'Keep windows closed and prioritise rest over exercise when the Air Quality Index exceeds 100.',
      confidence: 94,
      isActive: false,
    },
    {
      id: 'evt_003',
      patternType: 'activity_intolerance',
      startDate: daysAgoIso(22),
      endDate: daysAgoIso(17),
      durationDays: 6,
      severity: 'moderate',
      title: 'Weather shift reduced your stamina',
      summary:
        'A fast-moving cold front combined with high humidity irritated your airways, causing a noticeable drop in your nervous system recovery and daily movement.',
      supportingSignals: [
        { label: 'Heart rate variability', change: '−15 ms',   direction: 'down' },
        { label: 'Daily steps',            change: '−3,000',   direction: 'down' },
        { label: 'Active minutes',         change: '−20 mins', direction: 'down' },
      ],
      suggestedAction:
        'Pace your physical activity on cold-front days and use your maintenance inhaler before going outside.',
      confidence: 82,
      isActive: false,
    },
    {
      id: 'evt_004',
      patternType: 'autonomic_strain',
      startDate: daysAgoIso(4),
      endDate: null,
      durationDays: 5,
      severity: 'moderate',
      title: 'Astra caught the same pattern early',
      summary: `The same combination of high pollen and falling pressure that caused your 6-day strain in ${monthAgo(82)} is happening again. Your heart rate is starting to climb - Astra noticed before you felt it.`,
      supportingSignals: [
        { label: 'Resting heart rate',     change: '+6 bpm',    direction: 'up' },
        { label: 'Heart rate variability', change: '−10 ms',    direction: 'down' },
        { label: 'Pollen level',           change: 'Very High', direction: 'up' },
      ],
      suggestedAction:
        'Start your allergy routine tonight. Acting now can prevent this becoming a multi-day crash.',
      confidence: 91,
      isActive: true,
      recurrenceOf: 'evt_001',
    },
  ]
}

export function getActivePattern(patterns: PatternEvent[]): PatternEvent | null {
  return patterns.find((p) => p.isActive) ?? null
}

export function countRecurrences(pattern: PatternEvent, allPatterns: PatternEvent[]): number {
  return allPatterns.filter(
    (p) =>
      p.patternType === pattern.patternType ||
      p.id === pattern.recurrenceOf ||
      p.recurrenceOf === pattern.id ||
      p.recurrenceOf === pattern.recurrenceOf,
  ).length
}

export const PATTERN_LABELS: Record<PatternType, string> = {
  recovery_strain:      'Recovery Strain',
  sleep_disruption:     'Sleep Disruption',
  low_energy:           'Low Energy',
  activity_intolerance: 'Activity Intolerance',
  autonomic_strain:     'Autonomic Strain',
  routine_disruption:   'Routine Disruption',
}

export const PATTERN_DESCRIPTIONS: Record<PatternType, string> = {
  recovery_strain:      'Resting HR and HRV signals indicate your body may be under strain',
  sleep_disruption:     'Sleep duration and consistency have shifted from your usual pattern',
  low_energy:           'Movement and activity are lower than your usual baseline',
  activity_intolerance: 'High-activity periods are followed by significant recovery drops',
  autonomic_strain:     'HRV and resting HR signals are deviating together',
  routine_disruption:   'Your sleep-wake timing and daily routine have shifted',
}
