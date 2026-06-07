export interface MigraineEvent {
  id: string;
  patient_id: string;
  date: string;
  severity: number;
  duration: number | null;
  triggers: string[] | null;
  aura: boolean;
  notes: string | null;
  created_at: string;
}

export interface MedicationLog {
  id: string;
  patient_id: string;
  medication_name: string;
  taken: boolean;
  scheduled_at: string;
  created_at: string;
}
