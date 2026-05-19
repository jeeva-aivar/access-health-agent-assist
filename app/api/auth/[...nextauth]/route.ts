import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'IDFC FIRST',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        if (credentials.email === 'demo@accesshealthcare.com' && credentials.password === 'demo') {
          // Demo auth — no DB lookup needed, credentials are fixed for this demo
          return { id: 'rm-priya-sharma-001', name: 'Priya Sharma', email: 'priya.sharma@idfcfirst.com' }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.rmId = user.id
      return token
    },
    async session({ session, token }) {
      if (token.rmId) session.user.rmId = token.rmId as string
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 24 * 60 * 60 },
})

export { handler as GET, handler as POST }
