import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const steamId = searchParams.get('steamid');
  const appId = searchParams.get('appid');

  if (!steamId || !appId) {
    return NextResponse.json(
      { error: 'Missing steamid or appid' },
      { status: 400 }
    );
  }

  const key = process.env.STEAM_API_KEY;
  const url =
    `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/` +
    `?key=${key}&steamid=${steamId}&appid=${appId}`;

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));

  // Steam returns a 4xx body with a "success: false" message when the game
  // has no achievements or the profile/game is private -- surface that
  // instead of throwing, since it's a very common case.
  if (!res.ok || data?.playerstats?.success === false) {
    return NextResponse.json({
      achievements: [],
      message:
        data?.playerstats?.error ||
        'No achievement data (game may have none, or profile is private).',
    });
  }

  return NextResponse.json({
    achievements: data?.playerstats?.achievements || [],
    gameName: data?.playerstats?.gameName,
  });
}
