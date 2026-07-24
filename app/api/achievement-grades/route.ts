import { NextRequest, NextResponse } from 'next/server';
import { getAchievementGrade, saveAchievementGrade } from '../../../lib/db';
import { normalizeGrades, defaultGrades } from '../../../lib/grades';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appid = searchParams.get('appid');
  const apiname = searchParams.get('apiname');

  if (!appid || !apiname) {
    return NextResponse.json({ error: 'Missing appid or apiname' }, { status: 400 });
  }

  const steamId = request.cookies.get('steamid')?.value;
  if (!steamId) {
    return NextResponse.json({ grades: defaultGrades() });
  }

  const stored = await getAchievementGrade(steamId, appid, apiname);
  return NextResponse.json({ grades: stored ? normalizeGrades(stored) : defaultGrades() });
}

export async function POST(request: NextRequest) {
  const steamId = request.cookies.get('steamid')?.value;
  if (!steamId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    appid?: string;
    apiname?: string;
    grades?: Record<string, unknown>;
  } | null;
  const appid = body?.appid;
  const apiname = body?.apiname;

  if (!appid || !apiname) {
    return NextResponse.json({ error: 'Missing appid or apiname' }, { status: 400 });
  }

  const grades = normalizeGrades(body?.grades);
  await saveAchievementGrade(steamId, appid, apiname, grades);

  return NextResponse.json({ grades });
}
