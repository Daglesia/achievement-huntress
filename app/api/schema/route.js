import { NextResponse } from 'next/server';
import { getSchemaForGame, dbBackend } from '../../../lib/schemaCache';

// GET /api/schema?appid=440
// Useful for demonstrating the cache: call it twice with the same appid --
// the first response has source:"steam", the second has source:"cache".
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appid');

  if (!appId) {
    return NextResponse.json({ error: 'Missing appid' }, { status: 400 });
  }

  const { schema, gameName, source } = await getSchemaForGame(appId);

  return NextResponse.json({
    appid: appId,
    gameName,
    source,
    dbBackend,
    achievementCount: schema.length,
    schema,
  });
}
