import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAuthorizedEmail } from '@/lib/authorization'

export async function getAuthSession() {
  const session = await getServerSession(authOptions)
  if (!isAuthorizedEmail(session?.user?.email)) {
    return null
  }

  return session
}
