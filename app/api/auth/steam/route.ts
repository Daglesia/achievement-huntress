import { NextResponse } from 'next/server';
import { buildSteamLoginUrl } from '../../../../lib/steamAuth';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const loginUrl = buildSteamLoginUrl(baseUrl);
  return NextResponse.redirect(loginUrl);
}
