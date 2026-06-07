import { createContext, useContext } from 'react'

export interface PatientAuth {
  userName: string | null
  firstName: string | null
  patientId: string | null
  userId: string | null
  hasSupabase: boolean
}

export const PatientAuthContext = createContext<PatientAuth>({
  userName: null,
  firstName: null,
  patientId: null,
  userId: null,
  hasSupabase: false,
})

export function usePatientAuth(): PatientAuth {
  return useContext(PatientAuthContext)
}
