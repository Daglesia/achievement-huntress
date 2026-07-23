import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get('steamid');

  if (!steamId) {
    return NextResponse.json({ error: 'Missing steamid' }, { status: 400 });
  }

  const key = process.env.STEAM_API_KEY;
  const url =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/` +
    `?key=${key}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: 'Steam API request failed' },
      { status: res.status }
    );
  }

  const data = await res.json();
  // Will be empty/undefined if the user's "Game details" privacy is not public.
  const games = data?.response?.games || [];
  return NextResponse.json({ games });
}
