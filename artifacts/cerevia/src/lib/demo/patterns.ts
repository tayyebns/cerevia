import type { PatternEvent, PatternType } from './types'

function daysAgoIso(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

// Pre-defined pattern events matching the seeded wearable data
export function getDemoPatterns(): PatternEvent[] {
  return [
    {
      id: 'p1',
      patternType: 'recovery_strain',
      startDate: daysAgoIso(82),
      endDate: daysAgoIso(77),
      durationDays: 6,
      severity: 'moderate',
      title: 'Recovery Strain Pattern',
      summary:
        'Your resting heart rate was elevated and HRV was suppressed below your usual range for 6 days. Sleep was also slightly shorter than your baseline during this period.',
      supportingSignals: [
        { label: 'Resting HR', change: '+11%', direction: 'up' },
        { label: 'HRV',        change: '−19%', direction: 'down' },
        { label: 'Sleep',      change: '−11%', direction: 'down' },
      ],
      suggestedAction:
        'Pattern resolved. Worth monitoring if it reappears.',
      confidence: 84,
      isActive: false,
    },
    {
      id: 'p2',
      patternType: 'sleep_disruption',
      startDate: daysAgoIso(55),
      endDate: daysAgoIso(49),
      durationDays: 7,
      severity: 'high',
      title: 'Sleep Disruption & Recovery Strain',
      summary:
        'Sleep dropped significantly and stayed below your usual baseline for 7 days, accompanied by elevated resting heart rate, lower HRV and increased late-night screen time. This is a recurrence of an earlier pattern.',
      supportingSignals: [
        { label: 'Sleep',       change: '−17%',  direction: 'down' },
        { label: 'Resting HR',  change: '+13%',  direction: 'up' },
        { label: 'HRV',         change: '−24%',  direction: 'down' },
        { label: 'Screen time', change: '+39%',  direction: 'up' },
      ],
      suggestedAction:
        'This pattern has appeared more than once. If it recurs, consider preparing a health note.',
      confidence: 91,
      isActive: false,
      recurrenceOf: 'p1',
    },
    {
      id: 'p3',
      patternType: 'activity_intolerance',
      startDate: daysAgoIso(22),
      endDate: daysAgoIso(17),
      durationDays: 6,
      severity: 'moderate',
      title: 'Activity Intolerance Pattern',
      summary:
        'A high-activity day was followed by several days of sharply reduced movement, elevated resting heart rate and lower HRV — a pattern associated with poor recovery tolerance in some people.',
      supportingSignals: [
        { label: 'Steps',      change: '+82% then −43%', direction: 'irregular' },
        { label: 'Resting HR', change: '+9%',            direction: 'up' },
        { label: 'HRV',        change: '−17%',           direction: 'down' },
      ],
      suggestedAction:
        'You may want to monitor how your body responds after high-activity days. This is not a diagnosis.',
      confidence: 78,
      isActive: false,
    },
    {
      id: 'p4',
      patternType: 'recovery_strain',
      startDate: daysAgoIso(4),
      endDate: null,
      durationDays: 4,
      severity: 'moderate',
      title: 'Recovery Strain Pattern',
      summary:
        'Your resting heart rate, HRV and sleep duration have all shifted away from your usual baseline and have been outside your normal range for 4 days. This pattern has appeared twice before.',
      supportingSignals: [
        { label: 'Resting HR', change: '+15%', direction: 'up' },
        { label: 'HRV',        change: '−21%', direction: 'down' },
        { label: 'Sleep',      change: '−14%', direction: 'down' },
      ],
      suggestedAction:
        'Protect sleep tonight. Reduce intense activity if possible. This may be worth monitoring if it continues beyond a few more days.',
      confidence: 88,
      isActive: true,
      recurrenceOf: 'p2',
    },
  ]
}

export function getActivePattern(patterns: PatternEvent[]): PatternEvent | null {
  return patterns.find((p) => p.isActive) ?? null
}

// Count how many times the same pattern type has occurred (including current)
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
  recovery_strain:    'Recovery Strain',
  sleep_disruption:   'Sleep Disruption',
  low_energy:         'Low Energy',
  activity_intolerance: 'Activity Intolerance',
  autonomic_strain:   'Autonomic Strain',
  routine_disruption: 'Routine Disruption',
}

export const PATTERN_DESCRIPTIONS: Record<PatternType, string> = {
  recovery_strain:    'Resting HR and HRV signals indicate your body may be under strain',
  sleep_disruption:   'Sleep duration and consistency have shifted from your usual pattern',
  low_energy:         'Movement and activity are lower than your usual baseline',
  activity_intolerance: 'High-activity periods are followed by significant recovery drops',
  autonomic_strain:   'HRV and resting HR signals are deviating together',
  routine_disruption: 'Your sleep-wake timing and daily routine have shifted',
}
