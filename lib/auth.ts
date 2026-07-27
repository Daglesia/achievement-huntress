import NextAuth from 'next-auth';
import Authentik from 'next-auth/providers/authentik';
import { parseAchhuntRoles } from './roles';

const authentikIssuer = process.env.AUTH_AUTHENTIK_ISSUER?.replace(/\/+$/, '');

const auth = NextAuth({
  providers: [
    Authentik({
      clientId: process.env.AUTH_AUTHENTIK_ID,
      clientSecret: process.env.AUTH_AUTHENTIK_SECRET,
      issuer: authentikIssuer,
      authorization: {
        params: {
          scope: 'openid email profile available_services',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          available_services: parseAchhuntRoles(profile.available_services),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.available_services = (user as { available_services?: string[] }).available_services ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      session.user.available_services = (token.available_services as string[]) ?? [];
      return session;
    },
  },
});

export default auth;