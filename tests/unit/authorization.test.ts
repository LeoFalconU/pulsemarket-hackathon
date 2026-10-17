import { describe, expect, it } from 'vitest'
import { isAuthorizedEmail } from '@/lib/authorization'

describe('email domain authorization', () => {
  it('allows valid email addresses from the configured domain', () => {
    expect(isAuthorizedEmail('persona@utez.edu.mx')).toBe(true)
    expect(isAuthorizedEmail(' Persona@UTEZ.EDU.MX ')).toBe(true)
  })

  it.each([
    null,
    undefined,
    '',
    'not-an-email',
    'persona@example.com',
    'persona@utez.edu.mx.attacker.test',
    'persona@sub.utez.edu.mx',
  ])('rejects an email outside the exact allowed domain: %s', (email) => {
    expect(isAuthorizedEmail(email)).toBe(false)
  })
})
