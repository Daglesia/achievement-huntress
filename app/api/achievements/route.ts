import { NextRequest, NextResponse } from 'next/server';
import { getSchemaForGame } from '../../../lib/schemaCache';

type SteamPlayerAchievement = {
  apiname: string;
  achieved?: boolean;
  unlocktime?: number;
};

type SchemaEntry = {
  name: string;
  displayName?: string;
  description?: string;
  icon?: string;
  icongray?: string;
};

export async function GET(request: NextRequest) {
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
  const data = (await res.json().catch(() => ({}))) as {
    playerstats?: {
      success?: boolean;
      error?: string;
      achievements?: SteamPlayerAchievement[];
      gameName?: string;
    };
  };

  if (!res.ok || data?.playerstats?.success === false) {
    return NextResponse.json({
      achievements: [],
      message:
        data?.playerstats?.error ||
        'No achievement data (game may have none, or profile is private).',
    });
  }

  const playerAchievements = data?.playerstats?.achievements || [];

  const { schema, gameName: schemaGameName, source } = await getSchemaForGame(appId);
  const schemaByName = new Map<string, SchemaEntry>(schema.map((s: SchemaEntry) => [s.name, s]));

  const merged = playerAchievements.map((a: SteamPlayerAchievement) => {
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
    schemaSource: source,
  });
}
