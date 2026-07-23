import { NextResponse } from 'next/server';
import { verifySteamAssertion } from '../../../../../lib/steamAuth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const steamId = await verifySteamAssertion(searchParams);

  if (!steamId) {
    return NextResponse.redirect(`${baseUrl}/?error=auth_failed`);
  }

  const response = NextResponse.redirect(`${baseUrl}/`);
  // Not httpOnly so the demo page can read it client-side. In a real app,
  // keep this httpOnly and expose the steamid via an authenticated /api/me
  // route instead of a readable cookie.
  response.cookies.set('steamid', steamId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  });
  return response;
}
