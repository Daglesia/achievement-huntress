import { NextResponse } from 'next/server';
import { getSchemaForGame } from '../../../lib/schemaCache';

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

  if (!res.ok || data?.playerstats?.success === false) {
    return NextResponse.json({
      achievements: [],
      message:
        data?.playerstats?.error ||
        'No achievement data (game may have none, or profile is private).',
    });
  }

  const playerAchievements = data?.playerstats?.achievements || [];

  // Schema gives us display name / description / icon for each achievement.
  // getSchemaForGame only calls Steam the first time this appid is ever
  // requested; after that it's served from the local DB cache.
  const { schema, gameName: schemaGameName, source } = await getSchemaForGame(appId);
  const schemaByName = new Map(schema.map((s) => [s.name, s]));

  const merged = playerAchievements.map((a) => {
    const meta = schemaByName.get(a.apiname);
    return {
      apiname: a.apiname,
      achieved: !!a.achieved,
      unlocktime: a.unlocktime,
      displayName: meta?.displayName || a.apiname,
      description: meta?.description || '',
      icon: a.achieved ? meta?.icon : meta?.icongray,
    };
  });

  return NextResponse.json({
    achievements: merged,
    gameName: data?.playerstats?.gameName || schemaGameName,
    schemaSource: source, // 'cache' or 'steam' -- shows the caching in action
  });
}
