import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

const getAchievementGrade = vi.fn();
const saveAchievementGrade = vi.fn();

vi.mock('../../../lib/db', () => ({
  getAchievementGrade: (...args) => getAchievementGrade(...args),
  saveAchievementGrade: (...args) => saveAchievementGrade(...args),
}));

function buildRequest(url, steamId, init) {
  const headers = steamId ? { cookie: `steamid=${steamId}` } : {};
  return new NextRequest(url, { ...init, headers });
}

describe('GET /api/achievement-grades', () => {
  beforeEach(() => {
    getAchievementGrade.mockReset();
    saveAchievementGrade.mockReset();
  });

  it('rejects requests missing appid or apiname', async () => {
    const req = buildRequest('http://localhost/api/achievement-grades');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns default grades for a logged out visitor without touching the DB', async () => {
    const req = buildRequest('http://localhost/api/achievement-grades?appid=440&apiname=WIN_THE_GAME');
    const res = await GET(req);
    const body = await res.json();
    expect(body.grades).toEqual({ A: 'C', B: 'C', C: 'C', D: 'C', E: 'C' });
    expect(getAchievementGrade).not.toHaveBeenCalled();
  });

  it('returns stored grades for the logged in user', async () => {
    getAchievementGrade.mockResolvedValue({ A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' });
    const req = buildRequest('http://localhost/api/achievement-grades?appid=440&apiname=WIN_THE_GAME', '123');
    const res = await GET(req);
    const body = await res.json();
    expect(body.grades).toEqual({ A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' });
    expect(getAchievementGrade).toHaveBeenCalledWith('123', '440', 'WIN_THE_GAME');
  });

  it('falls back to defaults when nothing has been saved yet', async () => {
    getAchievementGrade.mockResolvedValue(null);
    const req = buildRequest('http://localhost/api/achievement-grades?appid=440&apiname=WIN_THE_GAME', '123');
    const res = await GET(req);
    const body = await res.json();
    expect(body.grades).toEqual({ A: 'C', B: 'C', C: 'C', D: 'C', E: 'C' });
  });
});

describe('POST /api/achievement-grades', () => {
  beforeEach(() => {
    getAchievementGrade.mockReset();
    saveAchievementGrade.mockReset();
  });

  it('rejects saves when not logged in', async () => {
    const req = buildRequest('http://localhost/api/achievement-grades', null, {
      method: 'POST',
      body: JSON.stringify({ appid: '440', apiname: 'WIN_THE_GAME', grades: {} }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(saveAchievementGrade).not.toHaveBeenCalled();
  });

  it('rejects saves missing appid or apiname', async () => {
    const req = buildRequest('http://localhost/api/achievement-grades', '123', {
      method: 'POST',
      body: JSON.stringify({ grades: { A: 'A' } }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(saveAchievementGrade).not.toHaveBeenCalled();
  });

  it('normalizes grades before saving, using the cookie steamid rather than any client-supplied one', async () => {
    const req = buildRequest('http://localhost/api/achievement-grades', '123', {
      method: 'POST',
      body: JSON.stringify({
        steamid: 'someone-else',
        appid: '440',
        apiname: 'WIN_THE_GAME',
        grades: { A: 'A', B: 'not-a-grade' },
      }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(saveAchievementGrade).toHaveBeenCalledWith('123', '440', 'WIN_THE_GAME', body.grades);
    expect(body.grades.A).toBe('A');
    expect(body.grades.B).toBe('C');
  });
});
