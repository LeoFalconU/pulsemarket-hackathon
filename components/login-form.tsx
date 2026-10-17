'use client'

import { signIn } from 'next-auth/react'

const ERRORS: Record<string, string> = {
  OAuthSignin: 'No se pudo iniciar el proveedor OAuth.',
  OAuthCallback: 'El proveedor rechazó el callback.',
  OAuthCreateAccount: 'No se pudo crear la cuenta.',
  Callback: 'Error al completar el inicio de sesión.',
  AccessDenied: 'Acceso denegado.',
  Configuration: 'Faltan credenciales OAuth en el servidor.',
  Default: 'No se pudo iniciar sesión. Intenta de nuevo.',
}

export function LoginForm({ error }: { error?: string }) {
  const message = error ? ERRORS[error] ?? ERRORS.Default : null

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-2xl font-semibold tracking-tight">PulseMarket</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Acceso exclusivo con Google o GitHub.
      </p>
      {message ? (
        <p
          data-testid="login-error"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {message}
        </p>
      ) : null}
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          data-testid="login-google"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="h-11 rounded-full bg-zinc-950 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Continuar con Google
        </button>
        <button
          type="button"
          data-testid="login-github"
          onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          className="h-11 rounded-full border border-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Continuar con GitHub
        </button>
      </div>
    </div>
  )
}
