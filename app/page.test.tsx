import { describe, expect, it } from 'vitest';
import { sortAchievements } from '../lib/sortAchievements';

describe('sortAchievements', () => {
  it('puts locked achievements first while preserving the existing order for the rest', () => {
    const achievements = [
      { apiname: 'A', achieved: true, displayName: 'Unlocked A' },
      { apiname: 'B', achieved: false, displayName: 'Locked B' },
      { apiname: 'C', achieved: true, displayName: 'Unlocked C' },
    ];

    expect(sortAchievements(achievements).map((achievement) => achievement.apiname)).toEqual(['B', 'A', 'C']);
  });
});
