import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoginForm } from '@/components/login-form'

describe('login form provider configuration', () => {
  it('explains when no OAuth provider is configured', () => {
    render(createElement(LoginForm, { providers: { google: false, github: false } }))

    expect(screen.getByRole('status').textContent).toContain(
      'El acceso no está listo.',
    )
    expect(screen.queryByTestId('login-google')).toBeNull()
    expect(screen.queryByTestId('login-github')).toBeNull()
  })

  it('only renders configured OAuth providers', () => {
    render(createElement(LoginForm, { providers: { google: false, github: true } }))

    expect(screen.getByTestId('login-github')).toBeTruthy()
    expect(screen.queryByTestId('login-google')).toBeNull()
  })
})
