'use server';

import { signIn } from './auth';

export async function signInWithAuthentik() {
  await signIn('authentik');
}