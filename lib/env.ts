import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  GITHUB_ID: z.string().min(1).optional(),
  GITHUB_SECRET: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  AUTHORIZED_EMAIL_DOMAIN: z
    .string()
    .regex(/^@[a-z0-9.-]+\.[a-z]{2,}$/i)
    .default('@utez.edu.mx'),
})

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  AUTHORIZED_EMAIL_DOMAIN: process.env.AUTHORIZED_EMAIL_DOMAIN,
})

export const authProviders = {
  github: Boolean(
    env.DATABASE_URL &&
      env.NEXTAUTH_SECRET &&
      env.NEXTAUTH_URL &&
      env.GITHUB_ID &&
      env.GITHUB_SECRET,
  ),
  google: Boolean(
    env.DATABASE_URL &&
      env.NEXTAUTH_SECRET &&
      env.NEXTAUTH_URL &&
      env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET,
  ),
}
