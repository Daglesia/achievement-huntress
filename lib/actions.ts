'use server';

import { redirect } from 'next/navigation';

export async function signInWithAuthentik() {
  redirect('/api/auth/signin/authentik');
}