import { describe, it, expect } from 'vitest';
import { getAchievementGrade, saveAchievementGrade } from './db';

function uniqueSteamId() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

describe('achievement grade storage', () => {
  it('returns null before anything has been saved', async () => {
    const steamid = uniqueSteamId();
    const result = await getAchievementGrade(steamid, '440', 'WIN_THE_GAME');
    expect(result).toBeNull();
  });

  it('saves and then reads back the same grades', async () => {
    const steamid = uniqueSteamId();
    const grades = { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' };

    await saveAchievementGrade(steamid, '440', 'WIN_THE_GAME', grades);
    const result = await getAchievementGrade(steamid, '440', 'WIN_THE_GAME');

    expect(result).toEqual(grades);
  });

  it('overwrites a previously saved grade for the same achievement', async () => {
    const steamid = uniqueSteamId();

    await saveAchievementGrade(steamid, '440', 'WIN_THE_GAME', { A: 'E', B: 'E', C: 'E', D: 'E', E: 'E' });
    await saveAchievementGrade(steamid, '440', 'WIN_THE_GAME', { A: 'A', B: 'A', C: 'A', D: 'A', E: 'A' });

    const result = await getAchievementGrade(steamid, '440', 'WIN_THE_GAME');
    expect(result).toEqual({ A: 'A', B: 'A', C: 'A', D: 'A', E: 'A' });
  });

  it('keeps grades for different achievements of the same game separate', async () => {
    const steamid = uniqueSteamId();

    await saveAchievementGrade(steamid, '440', 'WIN_THE_GAME', { A: 'A', B: 'A', C: 'A', D: 'A', E: 'A' });
    await saveAchievementGrade(steamid, '440', 'LOSE_THE_GAME', { A: 'E', B: 'E', C: 'E', D: 'E', E: 'E' });

    const win = await getAchievementGrade(steamid, '440', 'WIN_THE_GAME');
    const lose = await getAchievementGrade(steamid, '440', 'LOSE_THE_GAME');

    expect(win.A).toBe('A');
    expect(lose.A).toBe('E');
  });
});
