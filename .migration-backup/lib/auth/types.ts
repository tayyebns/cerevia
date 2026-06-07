export type UserRole = 'patient' | 'gp' | 'carer'

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    role?: UserRole
  }
}

export interface Session {
  user: AuthUser
  access_token: string
  refresh_token?: string
}

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  created_at: string
}

export interface PatientProfile extends Profile {
  patient_id: string
  date_of_birth?: string
  primary_language: string
  diagnosis: string
}

export interface GPProfile extends Profile {
  gp_id: string
  practice_name?: string
  role_title: string
}
