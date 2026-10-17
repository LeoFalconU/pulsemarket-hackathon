import { z } from 'zod'
import { env } from '@/lib/env'

const emailSchema = z.string().email()

export function isAuthorizedEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (!emailSchema.safeParse(normalizedEmail).success) {
    return false
  }

  return normalizedEmail.endsWith(env.AUTHORIZED_EMAIL_DOMAIN.toLowerCase())
}
