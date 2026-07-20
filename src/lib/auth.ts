import { getCurrentUser } from './anonymous'

export async function auth() {
  const user = await getCurrentUser()
  if (!user) return null

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    },
  }
}
