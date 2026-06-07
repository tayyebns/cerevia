export interface Profile {
  id: string
  role: 'patient' | 'gp'
  full_name: string | null
  created_at: string
}

export interface Patient {
  id: string
  user_id: string
  created_at: string
}

export interface GPProfile {
  id: string
  user_id: string
  practice: string | null
  created_at: string
}

export interface MigraineEvent {
  id: string
  patient_id: string
  date: string
  severity: number
  duration: number | null
  triggers: string[] | null
  aura: boolean
  notes: string | null
  created_at: string
}

export interface MedicationLog {
  id: string
  patient_id: string
  medication_name: string
  taken: boolean
  scheduled_at: string
  created_at: string
}

export interface GpAccess {
  id: string
  patient_id: string
  gp_id: string | null
  access_code: string
  access_status: 'active' | 'revoked' | 'expired'
  expires_at: string
  created_at: string
}

export interface LinkedPatient {
  patient_id: string
  full_name: string | null
  linked_at: string
  access_id: string
}
