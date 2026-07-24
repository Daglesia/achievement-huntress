import { getGameSchema, saveGameSchema, dbBackend } from './db';

const STEAM_SCHEMA_URL = 'https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/';

// Returns { schema, gameName, source } where source is 'cache' or 'steam'.
// Steam is only called the first time a given appid is requested; every
// call after that is served from the database.
export async function getSchemaForGame(appid) {
  const cached = await getGameSchema(appid);
  if (cached) {
    return { schema: cached.data, gameName: cached.gameName, source: 'cache' };
  }

  const key = process.env.STEAM_API_KEY;
  const url = `${STEAM_SCHEMA_URL}?key=${key}&appid=${appid}`;

  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));

  // Games with no achievements return an empty/absent achievements array --
  // that's a valid result and still gets cached so we don't re-check Steam
  // for it every time.
  const achievements = json?.game?.availableGameStats?.achievements || [];
  const gameName = json?.game?.gameName || null;

  await saveGameSchema(appid, gameName, achievements);

  return { schema: achievements, gameName, source: 'steam' };
}

export { dbBackend };
