/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/auth/client'
import type { GpAccess, LinkedPatient, MigraineEvent, MedicationLog, Patient, GPProfile } from './types'

function sb() {
  return createClient() as any
}

export async function getPatientRecord(userId: string): Promise<Patient | null> {
  const { data } = await sb().from('patients').select('*').eq('user_id', userId).maybeSingle()
  return data as Patient | null
}

export async function getGPProfileRecord(userId: string): Promise<GPProfile | null> {
  const { data } = await sb().from('gp_profiles').select('*').eq('user_id', userId).maybeSingle()
  return data as GPProfile | null
}

export async function ensurePatientRecord(userId: string): Promise<Patient | null> {
  const { data } = await sb()
    .from('patients')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select()
    .maybeSingle()
  return data as Patient | null
}

export async function ensureGPProfileRecord(userId: string): Promise<GPProfile | null> {
  const { data } = await sb()
    .from('gp_profiles')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select()
    .maybeSingle()
  return data as GPProfile | null
}

function generateCode(): string {
  return `CER-${Math.floor(1000 + Math.random() * 9000)}`
}

export async function createAccessCode(patientId: string): Promise<GpAccess | null> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  const { data } = await sb()
    .from('gp_access')
    .insert({
      patient_id: patientId,
      access_code: generateCode(),
      access_status: 'active',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .maybeSingle()
  return data as GpAccess | null
}

export async function getActiveAccessCodes(patientId: string): Promise<GpAccess[]> {
  const { data } = await sb()
    .from('gp_access')
    .select('*')
    .eq('patient_id', patientId)
    .eq('access_status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  return (data ?? []) as GpAccess[]
}

export async function revokeAccessCode(codeId: string): Promise<void> {
  await sb().from('gp_access').update({ access_status: 'revoked' }).eq('id', codeId)
}

export async function linkPatientByCode(code: string): Promise<{ error?: string; patientId?: string }> {
  const { data, error } = await sb().rpc('link_patient_by_code', { p_code: code.toUpperCase() })
  if (error) return { error: error.message }
  const result = data as { error?: string; patient_id?: string } | null
  if (result?.error) return { error: result.error }
  return { patientId: result?.patient_id }
}

export async function getLinkedPatients(): Promise<LinkedPatient[]> {
  const { data } = await sb().rpc('get_linked_patients')
  return (data ?? []) as LinkedPatient[]
}

export async function getPatientMigraineEvents(patientId: string): Promise<MigraineEvent[]> {
  const { data } = await sb()
    .from('migraine_events')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
  return (data ?? []) as MigraineEvent[]
}

export async function getPatientMedicationLogs(patientId: string): Promise<MedicationLog[]> {
  const { data } = await sb()
    .from('medication_logs')
    .select('*')
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: false })
  return (data ?? []) as MedicationLog[]
}

export async function getTodaysMedicationLogs(patientId: string): Promise<MedicationLog[]> {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
  const { data } = await sb()
    .from('medication_logs')
    .select('*')
    .eq('patient_id', patientId)
    .gte('scheduled_at', startOfDay)
    .lt('scheduled_at', endOfDay)
    .order('scheduled_at', { ascending: true })
  return (data ?? []) as MedicationLog[]
}

export async function insertMigraineEvent(
  patientId: string,
  event: Pick<MigraineEvent, 'date' | 'severity' | 'duration' | 'triggers' | 'aura' | 'notes'>,
): Promise<MigraineEvent | null> {
  const { data } = await sb()
    .from('migraine_events')
    .insert({ patient_id: patientId, ...event })
    .select()
    .maybeSingle()
  return data as MigraineEvent | null
}

export async function insertMedicationLog(
  patientId: string,
  log: Pick<MedicationLog, 'medication_name' | 'taken' | 'scheduled_at'>,
): Promise<MedicationLog | null> {
  const { data } = await sb()
    .from('medication_logs')
    .insert({ patient_id: patientId, ...log })
    .select()
    .maybeSingle()
  return data as MedicationLog | null
}

export async function updateMedicationLogTaken(logId: string, taken: boolean): Promise<void> {
  await sb().from('medication_logs').update({ taken }).eq('id', logId)
}

export async function deleteMigraineEvent(eventId: string): Promise<void> {
  await sb().from('migraine_events').delete().eq('id', eventId)
}
