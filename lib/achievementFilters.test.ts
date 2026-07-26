import { describe, expect, it } from 'vitest';
import { filterAchievements, getAvailableGrades } from './achievementFilters';
import type { GradeMap } from './grades';

function makeGrades(overrides: Partial<GradeMap> = {}): GradeMap {
  return {
    Luck: 'C',
    Time: 'C',
    Skill: 'C',
    Enjoyment: 'C',
    Consistency: 'C',
    ...overrides,
  } as GradeMap;
}

describe('filterAchievements', () => {
  it('filters by completion state and grade presence', () => {
    const achievements = [
      { apiname: 'one', achieved: true, displayName: 'One' },
      { apiname: 'two', achieved: false, displayName: 'Two' },
      { apiname: 'three', achieved: true, displayName: 'Three' },
    ];

    const achievementGradesByApiname = {
      one: makeGrades({ Luck: 'A' }),
      two: makeGrades({ Time: 'B' }),
      three: makeGrades({ Skill: 'D' }),
    };

    expect(
      filterAchievements(achievements, {
        status: 'complete',
        grade: 'A',
        achievementGradesByApiname,
      }).map((achievement) => achievement.apiname)
    ).toEqual(['one']);

    expect(
      filterAchievements(achievements, {
        status: 'incomplete',
        grade: 'B',
        achievementGradesByApiname,
      }).map((achievement) => achievement.apiname)
    ).toEqual(['two']);
  });

  it('lists the available grades from the loaded achievement data', () => {
    const achievementGradesByApiname = {
      one: makeGrades({ Luck: 'A' }),
      two: makeGrades({ Time: 'B' }),
      three: makeGrades({ Skill: 'D' }),
    };

    expect(getAvailableGrades(achievementGradesByApiname)).toEqual(['A', 'B', 'D']);
  });
});
