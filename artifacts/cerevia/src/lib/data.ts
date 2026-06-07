export const patient = {
  name: 'Maria',
  condition: 'Chronic Migraine with Aura',
  age: 34,
  medications: ['Topiramate 25mg', 'Propranolol 40mg', 'Sumatriptan 50mg'],
  adherenceToday: 43,
}

export const migraineEvents = [
  { date: '2026-04-29', severity: 7, duration: 18, triggers: ['Bright light', 'Stress'], aura: true, notes: 'Started with visual disturbance' },
  { date: '2026-05-03', severity: 5, duration: 12, triggers: ['Poor sleep'], aura: false, notes: 'Woke with headache' },
  { date: '2026-05-06', severity: 8, duration: 24, triggers: ['Hormonal', 'Stress', 'Skipped meal'], aura: true, notes: 'Worst episode this month' },
  { date: '2026-05-10', severity: 4, duration: 8, triggers: ['Screen time'], aura: false, notes: 'Resolved with Sumatriptan' },
  { date: '2026-05-14', severity: 6, duration: 14, triggers: ['Weather change', 'Stress'], aura: true, notes: '' },
  { date: '2026-05-18', severity: 3, duration: 6, triggers: ['Bright light'], aura: false, notes: 'Mild, caught early' },
  { date: '2026-05-22', severity: 5, duration: 10, triggers: ['Poor sleep', 'Dehydration'], aura: false, notes: '' },
  { date: '2026-05-26', severity: 2, duration: 4, triggers: ['Screen time'], aura: false, notes: 'Improving trend' },
]

export const symptomTrendData = [
  { label: 'Apr 29', headache: 7, nausea: 5, lightSensitivity: 6, aura: 4 },
  { label: 'May 3',  headache: 5, nausea: 4, lightSensitivity: 5, aura: 0 },
  { label: 'May 6',  headache: 8, nausea: 7, lightSensitivity: 8, aura: 7 },
  { label: 'May 10', headache: 4, nausea: 3, lightSensitivity: 4, aura: 0 },
  { label: 'May 14', headache: 6, nausea: 5, lightSensitivity: 6, aura: 5 },
  { label: 'May 18', headache: 3, nausea: 2, lightSensitivity: 3, aura: 0 },
  { label: 'May 22', headache: 5, nausea: 3, lightSensitivity: 4, aura: 0 },
  { label: 'May 26', headache: 2, nausea: 1, lightSensitivity: 2, aura: 0 },
]

export const medicationData = [
  { name: 'Sumatriptan 50mg', taken: 6, skipped: 0, effectiveness: 82, time: 'Acute (as needed)' },
  { name: 'Topiramate 25mg', taken: 24, skipped: 8, effectiveness: 74, time: 'Preventive (twice daily)' },
  { name: 'Propranolol 40mg', taken: 22, skipped: 10, effectiveness: 68, time: 'Preventive (twice daily)' },
]

export const frequencyData = [
  { month: 'Feb', count: 6 },
  { month: 'Mar', count: 9 },
  { month: 'Apr', count: 7 },
  { month: 'May', count: 8 },
  { month: 'Jun', count: 3 },
]

export const triggerData = [
  { trigger: 'Stress', count: 6 },
  { trigger: 'Poor sleep', count: 5 },
  { trigger: 'Bright light', count: 4 },
  { trigger: 'Hormonal', count: 3 },
  { trigger: 'Weather change', count: 3 },
  { trigger: 'Screen time', count: 3 },
  { trigger: 'Skipped meal', count: 2 },
  { trigger: 'Dehydration', count: 2 },
]

export const recentSymptoms = [
  { symptom: 'Postdrome fatigue', severity: 2, label: 'Very mild', date: '26 May 2026', description: 'Mild fatigue the day after the headache resolved. Feeling much better overall.', notes: 'Good sleep last two nights.' },
  { symptom: 'Headache', severity: 5, label: 'Mild', date: '22 May 2026', description: 'Dull pressure behind the eyes, manageable without triptan. No aura.', notes: '' },
  { symptom: 'Nausea', severity: 3, label: 'Mild', date: '18 May 2026', description: 'Brief nausea accompanying the migraine, resolved within an hour of lying down.', notes: '' },
]

export const medications = [
  { name: 'Topiramate',  dose: '25mg',  time: 'morning', status: 'taken' },
  { name: 'Propranolol', dose: '40mg',  time: 'morning', status: 'taken' },
  { name: 'Riboflavin',  dose: '400mg', time: 'morning', status: 'skipped' },
  { name: 'Magnesium glycinate', dose: '400mg', time: 'afternoon', status: 'taken' },
  { name: 'Topiramate',  dose: '25mg',  time: 'evening', status: 'pending' },
  { name: 'Propranolol', dose: '40mg',  time: 'evening', status: 'pending' },
  { name: 'Amitriptyline', dose: '10mg', time: 'evening', status: 'pending' },
]

export const aiSummary = `Maria's migraine frequency has decreased from 9 episodes in March to 8 in May, with a notable reduction in severity over the past two weeks (average 3.5 vs 6.8 the prior two weeks). No aura events have occurred since 14 May.

Key concerns for this consultation:
• Topiramate and Propranolol adherence are both around 75% — she reports difficulty remembering the evening dose
• Three high-severity episodes (7-8/10) clustered around 6 May coincided with a reported work deadline and the onset of her hormonal cycle, suggesting a menstrual migraine pattern
• Sumatriptan has been used 6 times in the past 4 weeks — within guidelines but worth monitoring to avoid exceeding 10 treatment days per month, at which point medication overuse headache becomes a risk

Suggested discussion points: review evening dose adherence, explore whether a menstrual migraine prevention protocol is appropriate, consider referral for stress management support.`
