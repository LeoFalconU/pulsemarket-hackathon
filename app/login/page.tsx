import { LoginForm } from '@/components/login-form'
import { authProviders } from '@/lib/env'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <LoginForm error={params.error} providers={authProviders} />
    </main>
  )
}
