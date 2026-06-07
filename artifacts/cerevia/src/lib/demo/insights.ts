import type {
  AssociationStrength,
  CoachPlan,
  GPSummary,
  MigraineEntry,
  OutcomeSnapshot,
  TodayExposureItem,
  TriggerCheckin,
  TriggerGoal,
  TriggerKey,
  TriggerProfile,
  TriggerScore,
  WearableDay,
  WearableSummary,
} from './types'
import { sarah } from './seed'

// ---------------------------------------------------------------------------
// Rule-based insight engine (no ML). Computes trigger associations, a
// personalised coach plan, an outcome snapshot, a clinician-ready summary and
// grounded Ask Cerevia answers — all from logged check-ins + migraine events.
// Deliberately deterministic and explainable for a clinically-responsible feel.
// ---------------------------------------------------------------------------

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.round((now.getTime() - d.getTime()) / 86400000)
}

function strengthFor(confidence: number): AssociationStrength {
  if (confidence >= 80) return 'Very strong'
  if (confidence >= 65) return 'Strong'
  if (confidence >= 45) return 'Moderate'
  if (confidence >= 25) return 'Weak'
  return 'Unclear'
}

const TRIGGER_LABELS: Record<TriggerKey, string> = {
  sleep: 'Poor sleep',
  stress: 'High stress',
  meals: 'Skipped meals',
  caffeine: 'Caffeine changes',
  screen: 'Screen time',
  hydration: 'Hydration',
}

// Does this check-in show the trigger as "present / bad" that day?
function triggerActive(key: TriggerKey, c: TriggerCheckin): boolean {
  switch (key) {
    case 'sleep': return c.sleepHours < 6
    case 'stress': return c.stressLevel >= 7
    case 'meals': return c.mealsSkipped >= 1
    case 'caffeine': return c.caffeineIntake === 0 || c.caffeineIntake >= 4
    case 'screen': return c.screenTimeHours >= 7.5
    case 'hydration': return c.hydration <= 2
  }
}

function explanationFor(key: TriggerKey, confidence: number): string {
  const lowConf = confidence < 25
  switch (key) {
    case 'sleep':
      return lowConf
        ? 'No clear link between your sleep and migraines in your logs yet.'
        : 'Migraines were more frequently reported after nights with less than 6 hours of sleep.'
    case 'stress':
      return lowConf
        ? 'Stress does not show a clear pattern with your migraines yet.'
        : 'Migraines were more frequently reported on days with high stress.'
    case 'meals':
      return lowConf
        ? 'Skipped meals do not show a strong pattern in your logs yet.'
        : 'Days with skipped meals appear associated with more of your episodes.'
    case 'caffeine':
      return lowConf
        ? 'Your caffeine intake looks consistent and weakly associated so far.'
        : 'Inconsistent caffeine intake appears around some of your episodes.'
    case 'screen':
      return lowConf
        ? 'Screen time shows only a weak pattern with your migraines so far.'
        : 'Longer screen-time days appear associated with some of your reports.'
    case 'hydration':
      return lowConf
        ? 'Hydration does not show a clear pattern in your logs yet.'
        : 'Lower-hydration days appear around some of your episodes.'
  }
}

const ORDER: TriggerKey[] = ['sleep', 'stress', 'meals', 'screen', 'caffeine', 'hydration']

export function generateTriggerProfile(
  checkins: TriggerCheckin[],
  migraines: MigraineEntry[],
): TriggerProfile {
  const checkinByDate = new Map(checkins.map((c) => [c.date, c]))
  const total = migraines.length || 1

  const scores: TriggerScore[] = ORDER.map((key) => {
    let hits = 0
    for (const m of migraines) {
      // look at the same day, falling back to the day before
      const sameDay = checkinByDate.get(m.date)
      const prev = checkinByDate.get(isoOffset(m.date, -1))
      const c = sameDay ?? prev
      if (c && triggerActive(key, c)) hits++
    }
    const confidence = Math.round((hits / total) * 100)
    return {
      key,
      label: TRIGGER_LABELS[key],
      confidence,
      strength: strengthFor(confidence),
      explanation: explanationFor(key, confidence),
    }
  }).sort((a, b) => b.confidence - a.confidence)

  const primary = scores[0]
  const secondary = scores.slice(1, 3)

  // Trigger combination: do the top two together associate with worse episodes?
  const combination = combinationInsight(scores[0].key, scores[1].key, checkins, migraines)
  const whatChanged = whatChangedInsight(checkins, migraines)

  return {
    primary,
    secondary,
    all: scores,
    managementFocus: managementFocusFor(primary.key),
    combination,
    whatChanged,
  }
}

function managementFocusFor(key: TriggerKey): string {
  switch (key) {
    case 'sleep': return 'Improve sleep consistency this week.'
    case 'stress': return 'Build in short stress resets this week.'
    case 'meals': return 'Keep meals regular this week.'
    case 'caffeine': return 'Keep caffeine intake steady this week.'
    case 'screen': return 'Add regular screen breaks this week.'
    case 'hydration': return 'Stay consistently hydrated this week.'
  }
}

function combinationInsight(
  a: TriggerKey,
  b: TriggerKey,
  checkins: TriggerCheckin[],
  migraines: MigraineEntry[],
): string | null {
  const byDate = new Map(checkins.map((c) => [c.date, c]))
  let bothSev = 0, bothN = 0, singleSev = 0, singleN = 0
  for (const m of migraines) {
    const c = byDate.get(m.date) ?? byDate.get(isoOffset(m.date, -1))
    if (!c) continue
    const av = triggerActive(a, c)
    const bv = triggerActive(b, c)
    if (av && bv) { bothSev += m.severity; bothN++ }
    else if (av || bv) { singleSev += m.severity; singleN++ }
  }
  if (bothN < 2 || singleN < 1) return null
  const bothAvg = bothSev / bothN
  const singleAvg = singleSev / singleN
  if (bothAvg <= singleAvg) return null
  return `${TRIGGER_LABELS[a]} + ${TRIGGER_LABELS[b].toLowerCase()} together appears associated with higher-severity migraines (avg ${bothAvg.toFixed(1)}/10) than either factor alone (avg ${singleAvg.toFixed(1)}/10).`
}

function whatChangedInsight(checkins: TriggerCheckin[], migraines: MigraineEntry[]): string | null {
  const recent = checkins.filter((c) => daysAgo(c.date) <= 30)
  const prev = checkins.filter((c) => daysAgo(c.date) > 30 && daysAgo(c.date) <= 60)
  if (recent.length < 3 || prev.length < 3) return null
  const avgSleepRecent = avg(recent.map((c) => c.sleepHours))
  const avgSleepPrev = avg(prev.map((c) => c.sleepHours))
  const mRecent = migraines.filter((m) => daysAgo(m.date) <= 30).length
  const mPrev = migraines.filter((m) => daysAgo(m.date) > 30 && daysAgo(m.date) <= 60).length
  if (avgSleepRecent < avgSleepPrev - 0.3 && mRecent >= mPrev) {
    return `Your migraine frequency rose (${mPrev} → ${mRecent} in the last two 30-day windows) over the same period your average sleep fell from ${avgSleepPrev.toFixed(1)}h to ${avgSleepRecent.toFixed(1)}h.`
  }
  if (mRecent < mPrev) {
    return `Your migraine frequency has eased recently (${mPrev} → ${mRecent} across the last two 30-day windows).`
  }
  if (mRecent > mPrev) {
    return `Your migraine frequency has risen recently (${mPrev} → ${mRecent} across the last two 30-day windows) — a good moment to focus on your strongest trigger.`
  }
  return `Across the last 60 days your migraine frequency has stayed broadly steady (${mPrev} then ${mRecent} per 30-day window).`
}

export function getTodayExposure(checkins: TriggerCheckin[]): TodayExposureItem[] {
  const latest = [...checkins].sort((a, b) => daysAgo(a.date) - daysAgo(b.date))[0]
  if (!latest) return []
  const sleep: TodayExposureItem = {
    key: 'sleep', label: 'Sleep',
    level: latest.sleepHours < 6 ? 'High risk' : latest.sleepHours < 6.8 ? 'Moderate' : 'Good',
    detail: `${latest.sleepHours}h logged`,
  }
  const stress: TodayExposureItem = {
    key: 'stress', label: 'Stress',
    level: latest.stressLevel >= 7 ? 'High risk' : latest.stressLevel >= 5 ? 'Moderate' : 'Good',
    detail: `${latest.stressLevel}/10`,
  }
  const hydration: TodayExposureItem = {
    key: 'hydration', label: 'Hydration',
    level: latest.hydration <= 2 ? 'Needs attention' : latest.hydration >= 4 ? 'Good' : 'Moderate',
    detail: `${latest.hydration}/5`,
  }
  const meals: TodayExposureItem = {
    key: 'meals', label: 'Meals',
    level: latest.mealsSkipped >= 1 ? 'Needs attention' : 'Good',
    detail: latest.mealsSkipped >= 1 ? `${latest.mealsSkipped} skipped` : 'On track',
  }
  const screen: TodayExposureItem = {
    key: 'screen', label: 'Screen time',
    level: latest.screenTimeHours >= 7.5 ? 'Rising' : latest.screenTimeHours >= 5.5 ? 'Moderate' : 'Good',
    detail: `${latest.screenTimeHours}h`,
  }
  return [sleep, stress, hydration, meals, screen]
}

export function getOutcomeSnapshot(migraines: MigraineEntry[]): OutcomeSnapshot {
  const thisPeriod = migraines.filter((m) => daysAgo(m.date) <= 30)
  const prevPeriod = migraines.filter((m) => daysAgo(m.date) > 30 && daysAgo(m.date) <= 60)
  const changePct = prevPeriod.length === 0
    ? 0
    : Math.round(((thisPeriod.length - prevPeriod.length) / prevPeriod.length) * 100)
  const avgSeverity = thisPeriod.length ? round1(avg(thisPeriod.map((m) => m.severity))) : 0
  const daysDisrupted = thisPeriod.filter((m) => m.impact.length > 0).length
  // Direction reflects the 30-day frequency change so it stays consistent with
  // the headline numbers shown alongside it.
  let direction: OutcomeSnapshot['direction'] = 'steady'
  if (changePct <= -10) direction = 'improving'
  else if (changePct >= 10) direction = 'worsening'
  return {
    migraineDaysThisPeriod: thisPeriod.length,
    migraineDaysPrevPeriod: prevPeriod.length,
    changePct,
    avgSeverity,
    daysDisrupted,
    direction,
  }
}

// Trigger-management progress for the primary trigger this week vs last week.
export function getProgress(profileKey: TriggerKey, checkins: TriggerCheckin[]): { pct: number; label: string } {
  const thisWeek = checkins.filter((c) => daysAgo(c.date) <= 7)
  const lastWeek = checkins.filter((c) => daysAgo(c.date) > 7 && daysAgo(c.date) <= 14)
  const bad = (arr: TriggerCheckin[]) => arr.filter((c) => triggerActive(profileKey, c)).length
  const thisBad = bad(thisWeek)
  const lastBad = bad(lastWeek)
  if (lastBad === 0) return { pct: 0, label: `${TRIGGER_LABELS[profileKey]} stayed low this week — keep it up.` }
  const reduction = Math.round(((lastBad - thisBad) / lastBad) * 100)
  if (reduction > 0) {
    return { pct: reduction, label: `${TRIGGER_LABELS[profileKey]} days reduced by ${reduction}% this week.` }
  }
  if (reduction < 0) {
    return { pct: 0, label: `${TRIGGER_LABELS[profileKey]} days rose by ${Math.abs(reduction)}% this week — worth a closer look.` }
  }
  return { pct: 0, label: `${TRIGGER_LABELS[profileKey]} exposure is similar to last week — a good focus area.` }
}

export function generateTriggerCoach(
  profile: TriggerProfile,
  checkins: TriggerCheckin[],
): CoachPlan {
  const key = profile.primary.key
  const thisWeek = checkins.filter((c) => daysAgo(c.date) <= 7)
  const protectionDays = (() => {
    switch (key) {
      case 'sleep': return thisWeek.filter((c) => c.sleepHours >= 7).length
      case 'stress': return thisWeek.filter((c) => c.stressLevel <= 5).length
      case 'meals': return thisWeek.filter((c) => c.mealsSkipped === 0).length
      case 'caffeine': return thisWeek.filter((c) => c.caffeineIntake >= 1 && c.caffeineIntake <= 3).length
      case 'screen': return thisWeek.filter((c) => c.screenTimeHours < 7.5).length
      case 'hydration': return thisWeek.filter((c) => c.hydration >= 4).length
    }
  })()
  const plans: Record<TriggerKey, { target: string; action: string; word: string }> = {
    sleep: { target: `Aim for ${sarah.sleepTarget} hours of sleep tonight.`, action: 'Set a screen wind-down reminder 45 minutes before bed.', word: 'sleep-protection' },
    stress: { target: 'Keep stress at 5/10 or below today.', action: 'Add one 5-minute stress reset between tasks.', word: 'low-stress' },
    meals: { target: 'Eat three regular meals today.', action: 'Set a midday meal reminder so lunch is not skipped.', word: 'regular-meal' },
    caffeine: { target: 'Keep caffeine to 1–3 cups, consistently.', action: 'Have your usual coffee at the same time each day.', word: 'steady-caffeine' },
    screen: { target: 'Take a screen break every 60–90 minutes.', action: 'Turn on a screen-break reminder for the afternoon.', word: 'screen-break' },
    hydration: { target: 'Reach 4–5 glasses of water today.', action: 'Set a mid-afternoon hydration reminder.', word: 'hydration' },
  }
  const p = plans[key]
  const total = 7
  const done = Math.min(protectionDays, total)
  return {
    triggerLabel: profile.primary.label,
    triggerKey: key,
    why: profile.primary.explanation,
    target: p.target,
    action: p.action,
    progressDone: done,
    progressTotal: total,
    progressLabel: `${done} of ${total} ${p.word} days this week.`,
  }
}

export function getTriggerGoals(profile: TriggerProfile, checkins: TriggerCheckin[]): TriggerGoal[] {
  const thisWeek = checkins.filter((c) => daysAgo(c.date) <= 7)
  const avgSleep = thisWeek.length ? round1(avg(thisWeek.map((c) => c.sleepHours))) : 0
  const avgStress = thisWeek.length ? Math.round(avg(thisWeek.map((c) => c.stressLevel))) : 0
  const goals: TriggerGoal[] = [
    {
      triggerKey: 'sleep', triggerLabel: 'Sleep',
      goalType: 'Nightly sleep', targetValue: `${sarah.sleepTarget}h`, currentValue: `${avgSleep}h avg`,
      status: avgSleep >= 7 ? 'met' : avgSleep >= 6.3 ? 'on_track' : 'behind',
    },
    {
      triggerKey: 'stress', triggerLabel: 'Stress',
      goalType: 'Daily stress', targetValue: '≤ 5/10', currentValue: `${avgStress}/10 avg`,
      status: avgStress <= 5 ? 'met' : avgStress <= 6 ? 'on_track' : 'behind',
    },
    {
      triggerKey: 'meals', triggerLabel: 'Meals',
      goalType: 'No skipped meals', targetValue: '0 skipped', currentValue: `${thisWeek.filter((c) => c.mealsSkipped >= 1).length} day(s) skipped`,
      status: thisWeek.every((c) => c.mealsSkipped === 0) ? 'met' : 'on_track',
    },
  ]
  return goals.filter((g) => profile.all.find((s) => s.key === g.triggerKey && s.confidence >= 25) || g.triggerKey === profile.primary.key)
}

export function generateGPSummary(
  checkins: TriggerCheckin[],
  migraines: MigraineEntry[],
): GPSummary {
  const profile = generateTriggerProfile(checkins, migraines)
  const snap = getOutcomeSnapshot(migraines)
  const window = migraines.filter((m) => daysAgo(m.date) <= 60)
  const migraineDays = window.length
  const avgSeverity = migraineDays ? round1(avg(window.map((m) => m.severity))) : 0
  const medEpisodes = window.filter((m) => m.medicationTaken)
  const medRelief = medEpisodes.filter((m) => m.reliefLevel === 'moderate' || m.reliefLevel === 'strong').length
  const reducedProd = window.filter((m) => m.impact.includes('Reduced productivity')).length
  const missedWork = window.filter((m) => m.impact.includes('Missed work/study')).length
  const top = profile.all.filter((s) => s.confidence >= 25).slice(0, 3)

  const changeVsPrev = snap.migraineDaysPrevPeriod === 0
    ? 'No prior comparison period available'
    : `Frequency went from ${snap.migraineDaysPrevPeriod} episodes in the previous 30 days to ${snap.migraineDaysThisPeriod} in the most recent 30 days`

  const rangeStart = isoOffset(new Date().toISOString().slice(0, 10), -60)
  const rangeEnd = new Date().toISOString().slice(0, 10)

  const hasTriggerSignal = profile.primary.confidence >= 25

  const text = migraineDays === 0
    ? `Over the last 60 days, ${sarah.firstName} logged no migraine days. ` +
      `There is not yet enough recent data to describe trigger associations or trends. ` +
      `Continuing daily trigger check-ins will build a clearer picture over time. ` +
      `This summary organises self-reported data and is not a diagnosis.`
    : `Over the last 60 days, ${sarah.firstName} logged ${migraineDays} migraine days. ` +
      `${changeVsPrev}. ` +
      (hasTriggerSignal
        ? `Migraines were more commonly reported around ${profile.primary.label.toLowerCase()}` +
          `${profile.secondary[0] ? ` and ${profile.secondary[0].label.toLowerCase()}` : ''} days, based on logged data. `
        : `No single trigger shows a clear association yet, based on logged data. `) +
      `${sarah.medication.split(' ')[0]} was logged during ${medEpisodes.length} episodes and was associated with moderate-to-strong relief in ${medRelief} cases. ` +
      `${sarah.firstName} reported reduced productivity on ${reducedProd} days and missed work ${missedWork === 1 ? 'once' : `${missedWork} times`}. ` +
      `Average reported severity was ${avgSeverity}/10. ` +
      `Suggested discussion focus: migraine frequency change, the sleep/stress pattern, and medication effectiveness. ` +
      `This summary organises self-reported data and is not a diagnosis.`

  return {
    rangeStart,
    rangeEnd,
    text,
    structured: {
      migraineDays,
      avgSeverity,
      changeVsPrev,
      topTriggers: top.map((t) => ({ label: t.label, confidence: t.confidence })),
      medication: `${sarah.medication} — logged in ${medEpisodes.length} episodes, moderate-to-strong relief in ${medRelief}.`,
      qualityOfLife: `Reduced productivity on ${reducedProd} days; missed work ${missedWork === 1 ? 'once' : `${missedWork} times`}.`,
      mainConcern: sarah.mainConcern,
      discussionAreas: [
        'Change in migraine frequency over the last 60 days',
        'Sleep and stress pattern around severe episodes',
        'Medication effectiveness and use frequency',
        'Impact on work and daily life',
      ],
    },
  }
}

export function answerAskCerevia(
  question: string,
  checkins: TriggerCheckin[],
  migraines: MigraineEntry[],
): string {
  const q = question.toLowerCase()
  const profile = generateTriggerProfile(checkins, migraines)
  const snap = getOutcomeSnapshot(migraines)

  if (q.includes('strongest') || q.includes('what are my trigger') || q.includes('main trigger')) {
    return `Based on your logs, ${profile.primary.label.toLowerCase()} appears to be your strongest associated trigger (${profile.primary.confidence}% confidence), followed by ${profile.secondary[0]?.label.toLowerCase()} (${profile.secondary[0]?.confidence}%). ${profile.primary.explanation} This may be worth discussing with your GP.`
  }
  if (q.includes('sleep')) {
    const s = profile.all.find((x) => x.key === 'sleep')!
    return `${s.explanation} In your logs, sleep shows a ${s.strength.toLowerCase()} association (${s.confidence}%). Protecting your sleep routine is a sensible management focus.`
  }
  if (q.includes('worse') || q.includes('changed') || q.includes('increase')) {
    return profile.whatChanged ?? 'There is not yet enough logged data to describe a clear change over time.'
  }
  if (q.includes('focus') || q.includes('this week') || q.includes('what should i do')) {
    return `This week, a good focus is ${profile.primary.label.toLowerCase()}. ${profile.managementFocus} Small, consistent changes tend to help more than large ones.`
  }
  if (q.includes('medication') || q.includes('sumatriptan') || q.includes('help')) {
    const med = migraines.filter((m) => m.medicationTaken)
    const relief = med.filter((m) => m.reliefLevel === 'moderate' || m.reliefLevel === 'strong').length
    return `You logged medication during ${med.length} episodes, with moderate-to-strong relief reported in ${relief}. Relief looks mixed — this may be worth discussing with your GP. Cerevia does not make medication recommendations.`
  }
  if (q.includes('gp') || q.includes('doctor') || q.includes('appointment')) {
    return `For your GP, the most useful points from your data are: ${snap.migraineDaysThisPeriod} migraine days in the last 30 days, an average severity of ${snap.avgSeverity}/10, and ${profile.primary.label.toLowerCase()} as your strongest associated trigger. You can generate a full summary from the Care tab.`
  }
  return `Based on your logged data, your strongest associated trigger appears to be ${profile.primary.label.toLowerCase()} (${profile.primary.confidence}%). Ask me about your sleep, stress, medication, what changed, or what to focus on this week. Cerevia organises your data and does not provide diagnosis.`
}

// Simulated Apple Watch / wearable summary — sleep, heart rate and activity,
// framed to support trigger intelligence (no diagnosis, no clinical claims).
export function getWearableSummary(wearable: WearableDay[]): WearableSummary {
  const thisWeek = wearable.filter((w) => daysAgo(w.date) <= 7)
  const prevMonth = wearable.filter((w) => daysAgo(w.date) > 7 && daysAgo(w.date) <= 37)
  const avgSleepThisWeek = thisWeek.length ? round1(avg(thisWeek.map((w) => w.sleepHours))) : 0
  const avgSleepPrev = prevMonth.length ? round1(avg(prevMonth.map((w) => w.sleepHours))) : 0
  const avgRestingHR = thisWeek.length ? Math.round(avg(thisWeek.map((w) => w.restingHR))) : 0
  const avgRestingHRPrev = prevMonth.length ? Math.round(avg(prevMonth.map((w) => w.restingHR))) : 0
  const avgSteps = thisWeek.length ? Math.round(avg(thisWeek.map((w) => w.steps))) : 0
  const activeMinutesAvg = thisWeek.length ? Math.round(avg(thisWeek.map((w) => w.activeMinutes))) : 0
  const target = sarah.sleepTarget
  const sleepMeetingTarget = avgSleepThisWeek >= target - 0.3

  const sleepNarrative = sleepMeetingTarget
    ? `Apple Watch sleep suggests ${sarah.firstName} averaged ${avgSleepThisWeek}h this week — now meeting her ${target}h target, up from ${avgSleepPrev}h over the prior month.`
    : `Apple Watch sleep suggests ${sarah.firstName} averaged ${avgSleepThisWeek}h this week, below her personal target of ${target}h. Protecting sleep is her strongest trigger-management lever.`

  const hrDelta = avgRestingHR - avgRestingHRPrev
  const hrNarrative = hrDelta <= -2
    ? `Resting heart rate eased to ${avgRestingHR} bpm this week (from ${avgRestingHRPrev} bpm), consistent with lower reported stress.`
    : hrDelta >= 2
      ? `Resting heart rate rose to ${avgRestingHR} bpm this week (from ${avgRestingHRPrev} bpm), which tends to track higher-stress periods in your logs.`
      : `Resting heart rate held around ${avgRestingHR} bpm this week, in line with the prior month.`

  const activityNarrative = `Activity averaged ${avgSteps.toLocaleString()} steps and ${activeMinutesAvg} active minutes a day; movement tends to dip on migraine days.`

  return {
    avgSleepThisWeek,
    avgSleepPrev,
    sleepTarget: target,
    sleepMeetingTarget,
    avgRestingHR,
    avgRestingHRPrev,
    avgSteps,
    activeMinutesAvg,
    sleepNarrative,
    hrNarrative,
    activityNarrative,
  }
}

// --- helpers ----------------------------------------------------------------
function avg(arr: number[]): number {
  if (!arr.length) return 0
  return arr.reduce((s, n) => s + n, 0) / arr.length
}
function round1(n: number): number {
  return Math.round(n * 10) / 10
}
function isoOffset(dateStr: string, deltaDays: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + deltaDays)
  return d.toISOString().slice(0, 10)
}

export const ASK_SUGGESTIONS = [
  'What are my strongest triggers?',
  'Does sleep seem linked to my migraines?',
  'What changed before my migraines got worse?',
  'Which triggers should I focus on this week?',
  'Has my medication helped?',
  'What should I discuss with my GP?',
]
