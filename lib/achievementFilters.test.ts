import { describe, expect, it } from 'vitest';
import { filterAchievementsBySearch } from './achievementFilters';

describe('filterAchievementsBySearch', () => {
  it('keeps achievements whose apiname or display name match the search text', () => {
    const achievements = [
      { apiname: 'WIN_GAME', displayName: 'Win the Game' },
      { apiname: 'LOSE_GAME', displayName: 'Lose the Game' },
    ];

    expect(filterAchievementsBySearch(achievements, 'win').map((a) => a.apiname)).toEqual(['WIN_GAME']);
  });

  it('is case-insensitive and ignores surrounding whitespace', () => {
    const achievements = [{ apiname: 'WIN_GAME', displayName: 'Win the Game' }];

    expect(filterAchievementsBySearch(achievements, '  WIN  ')).toEqual(achievements);
  });

  it('returns every achievement when the search is empty', () => {
    const achievements = [
      { apiname: 'one', displayName: 'One' },
      { apiname: 'two', displayName: 'Two' },
    ];

    expect(filterAchievementsBySearch(achievements, '')).toEqual(achievements);
  });
});