import { getGameSchema, saveGameSchema, dbBackend } from './db';

const STEAM_SCHEMA_URL = 'https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/';

type SteamSchemaAchievement = {
  name: string;
  displayName?: string;
  description?: string;
  icon?: string;
  icongray?: string;
};

// Returns { schema, gameName, source } where source is 'cache' or 'steam'.
// Steam is only called the first time a given appid is requested; every
// call after that is served from the database.
export async function getSchemaForGame(appid: string | number) {
  const cached = await getGameSchema(appid);
  if (cached) {
    return { schema: cached.data as SteamSchemaAchievement[], gameName: cached.gameName, source: 'cache' as const };
  }

  const key = process.env.STEAM_API_KEY;
  const url = `${STEAM_SCHEMA_URL}?key=${key}&appid=${appid}`;

  const res = await fetch(url);
  const json = (await res.json().catch(() => ({}))) as {
    game?: {
      availableGameStats?: { achievements?: SteamSchemaAchievement[] };
      gameName?: string | null;
    };
  };

  const achievements = json?.game?.availableGameStats?.achievements || [];
  const gameName = json?.game?.gameName || null;

  await saveGameSchema(appid, gameName, achievements);

  return { schema: achievements, gameName, source: 'steam' as const };
}

export { dbBackend };
