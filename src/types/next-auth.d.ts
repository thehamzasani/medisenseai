import { DefaultSession, DefaultJWT } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
    // DefaultSession['user'] already includes name, email, image (all optional strings)
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
  }
}