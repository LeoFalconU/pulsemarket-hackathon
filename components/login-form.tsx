'use client'

import { signIn } from 'next-auth/react'

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.6 6.1-8.8 6.1-14.9Z" />
      <path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z" />
      <path fill="#4CAF50" d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.8a20 20 0 0 0 0 18Z" />
      <path fill="#1976D2" d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z" />
    </svg>
  )
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.2.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.6-1.3-1.6-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.7 6.3 18.7 6.6 18.7 6.6c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.3.8 1 .8 2v3c0 .4.2.7.8.6A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  )
}

const ERRORS: Record<string, string> = {
  OAuthSignin: 'No se pudo iniciar el proveedor OAuth.',
  OAuthCallback: 'El proveedor rechazó el callback.',
  OAuthCreateAccount: 'No se pudo crear la cuenta.',
  Callback: 'Error al completar el inicio de sesión.',
  AccessDenied: 'Acceso denegado.',
  Configuration: 'Faltan credenciales OAuth en el servidor.',
  Default: 'No se pudo iniciar sesión. Intenta de nuevo.',
}

export function LoginForm({
  error,
  providers,
}: {
  error?: string
  providers: { google: boolean; github: boolean }
}) {
  const message = error ? ERRORS[error] ?? ERRORS.Default : null
  const hasProvider = providers.google || providers.github

  return (
    <div className="motion-rise w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-7 shadow-2xl shadow-indigo-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 sm:p-9">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-600/25">
          P
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            PulseMarket
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
        </div>
      </div>
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Accede a tu centro de analítica e-commerce de forma segura.
      </p>
      {message ? (
        <p
          data-testid="login-error"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {message}
        </p>
      ) : null}
      {hasProvider ? (
        <div className="mt-7 flex flex-col gap-3">
          {providers.google ? (
            <button
              type="button"
              data-testid="login-google"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="group flex h-12 items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <GoogleMark />
              Continuar con Google
            </button>
          ) : null}
          {providers.github ? (
            <button
              type="button"
              data-testid="login-github"
              onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
              className="group flex h-12 items-center justify-center gap-3 rounded-xl bg-zinc-950 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <GitHubMark />
              Continuar con GitHub
            </button>
          ) : null}
        </div>
      ) : (
        <p
          role="status"
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
        >
          El acceso no está listo. Configura la base de datos, NEXTAUTH_SECRET, NEXTAUTH_URL
          y las credenciales de al menos un proveedor OAuth en el servidor.
        </p>
      )}
    </div>
  )
}
