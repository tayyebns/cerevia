export type UserRole = 'patient' | 'gp' | 'carer'

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    role?: UserRole
  }
}
