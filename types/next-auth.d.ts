import { DefaultSession } from 'next-auth';
import type { AchhuntRole } from './lib/roles';

declare module 'next-auth' {
  interface Session {
    user: {
      available_services: string[];
    } & DefaultSession['user'];
  }
}