import { createClient } from '@/lib/auth/client'

// ── Exact migraine events from the provided dataset ───────────────────────────

const MIGRAINE_EVENTS = [
  {
    date: '2026-06-01',
    severity: 3,
    duration: 1,
    triggers: ['Stress'],
    aura: false,
    notes: 'Mild tightness after work.',
  },
  {
    date: '2026-06-05',
    severity: 6,
    duration: 4,
    triggers: ['Bright light'],
    aura: true,
    notes: 'Aura and light sensitivity.',
  },
  {
    date: '2026-06-08',
    severity: 7,
    duration: 5,
    triggers: ['Nausea'],
    aura: true,
    notes: 'Nausea and aura.',
  },
  {
    date: '2026-06-12',
    severity: 4,
    duration: 2,
    triggers: ['Stress'],
    aura: false,
    notes: 'Stress-related context.',
  },
  {
    date: '2026-06-15',
    severity: 8,
    duration: 7,
    triggers: ['Bright light', 'Dizziness'],
    aura: false,
    notes: 'Dizziness and light sensitivity.',
  },
  {
    date: '2026-06-18',
    severity: 3,
    duration: 2,
    triggers: ['Poor sleep'],
    aura: false,
    notes: 'Associated with poor sleep.',
  },
  {
    date: '2026-06-22',
    severity: 7,
    duration: 6,
    triggers: ['Nausea'],
    aura: true,
    notes: 'Strong nausea, aura present.',
  },
  {
    date: '2026-06-25',
    severity: 6,
    duration: 4,
    triggers: ['Stress', 'Screen time'],
    aura: false,
    notes: 'High screen time and work stress.',
  },
  {
    date: '2026-06-28',
    severity: 9,
    duration: 8,
    triggers: ['Stress'],
    aura: false,
    notes: 'Significant work impact, dizziness.',
  },
]

// ── Acute medication logs (from the dataset) + preventive meds ─────────────────

// Acute Sumatriptan logs from the CSV
const ACUTE_LOGS = [
  { date: '2026-06-05', medication_name: 'Sumatriptan 50mg',  taken: true },
  { date: '2026-06-08', medication_name: 'Sumatriptan 50mg',  taken: true },
  { date: '2026-06-15', medication_name: 'Sumatriptan 100mg', taken: true },
  { date: '2026-06-22', medication_name: 'Sumatriptan 100mg', taken: true },
  { date: '2026-06-28', medication_name: 'Sumatriptan 100mg', taken: true },
]

// Preventive medications — daily schedule across the demo period
const PREVENTIVE_MEDS = [
  { name: 'Topiramate 25mg',          slots: ['morning', 'evening'] },
  { name: 'Propranolol 40mg',         slots: ['morning', 'evening'] },
  { name: 'Riboflavin 400mg',         slots: ['morning'] },
  { name: 'Magnesium glycinate 400mg', slots: ['afternoon'] },
]

function slotHour(slot: string) {
  return slot === 'morning' ? 8 : slot === 'afternoon' ? 14 : 21
}

function dateRange(startStr: string, endStr: string): string[] {
  const dates: string[] = []
  const cur = new Date(startStr)
  const end = new Date(endStr)
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

export async function seedDemoData(): Promise<{ error?: string }> {
  try {
    const sb = createClient() as any

    const { data: { user } } = await sb.auth.getUser()
    if (!user) return { error: 'not_authenticated' }

    // Get or create the patient row (handles cases where the DB trigger hasn't run)
    let { data: patient } = await sb
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!patient?.id) {
      const { data: created } = await sb
        .from('patients')
        .upsert({ user_id: user.id }, { onConflict: 'user_id' })
        .select('id')
        .maybeSingle()
      patient = created
    }

    if (!patient?.id) return { error: 'no_patient_record' }

    const patientId: string = patient.id

    // Guard: don't seed if data already exists
    const { data: existingCheck } = await sb
      .from('migraine_events')
      .select('id')
      .eq('patient_id', patientId)
      .limit(1)
      .maybeSingle()

    if (existingCheck) return { error: 'already_seeded' }

    // Insert migraine events
    const migraineRows = MIGRAINE_EVENTS.map((e) => ({ ...e, patient_id: patientId }))
    const { error: migraineErr } = await sb.from('migraine_events').insert(migraineRows)
    if (migraineErr) return { error: migraineErr.message }

    // Build medication logs
    const medRows: Array<{
      patient_id: string
      medication_name: string
      taken: boolean
      scheduled_at: string
    }> = []

    // Acute logs from dataset
    for (const acute of ACUTE_LOGS) {
      medRows.push({
        patient_id: patientId,
        medication_name: acute.medication_name,
        taken: acute.taken,
        scheduled_at: new Date(`${acute.date}T10:00:00`).toISOString(),
      })
    }

    // Preventive logs across June 1–28
    const days = dateRange('2026-06-01', '2026-06-28')
    for (const day of days) {
      for (const med of PREVENTIVE_MEDS) {
        for (const slot of med.slots) {
          // Realistic adherence: ~80% taken
          const taken = Math.random() > 0.2
          const scheduled = new Date(`${day}T${String(slotHour(slot)).padStart(2, '0')}:00:00`)
          medRows.push({
            patient_id: patientId,
            medication_name: med.name,
            taken,
            scheduled_at: scheduled.toISOString(),
          })
        }
      }
    }

    // Insert in batches of 200
    const BATCH = 200
    for (let i = 0; i < medRows.length; i += BATCH) {
      const { error: medErr } = await sb.from('medication_logs').insert(medRows.slice(i, i + BATCH))
      if (medErr) return { error: medErr.message }
    }

    return {}
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'unknown_error' }
  }
}
