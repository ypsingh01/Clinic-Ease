export type Role = 'patient' | 'doctor' | 'admin'

export type AuthUser = {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  whatsappLinked: boolean
}

export type AuthSession = {
  user: AuthUser
  token: string
}
