import { describe, it, expect } from 'vitest';
import {
  createDefaultCondition,
  matchesFilterCondition,
  filterAchievementsByConditions,
  type FilterCondition,
} from './achievementFilterConditions';
import type { GradeMap } from './grades';

function makeGrades(overrides: Partial<GradeMap> = {}): GradeMap {
  return {
    Luck: 'C',
    Time: 'C',
    Skill: 'C',
    Enjoyment: 'C',
    Consistency: 'C',
    ...overrides,
  };
}

import { describeFilterCondition } from './achievementFilterConditions';

describe('describeFilterCondition', () => {
  it('describes a grade condition', () => {
    expect(describeFilterCondition({ identifier: 'grade', field: 'Luck', relative: 'gt', value: 'B' })).toBe(
      'Luck greater than B'
    );
  });

  it('describes a tag condition', () => {
    expect(describeFilterCondition({ identifier: 'tag', relative: 'eq', value: 'Grindfest' })).toBe(
      'Tag: Grindfest'
    );
  });

  it('describes an achievement condition', () => {
    expect(describeFilterCondition({ identifier: 'achievement', relative: 'eq', value: true })).toBe('Achieved');
    expect(describeFilterCondition({ identifier: 'achievement', relative: 'eq', value: false })).toBe('Locked');
  });
});

describe('createDefaultCondition', () => {
  it('creates a default grade condition', () => {
    expect(createDefaultCondition('grade')).toEqual({ identifier: 'grade', field: 'Luck', relative: 'eq', value: 'C' });
  });

  it('creates a default tag condition', () => {
    expect(createDefaultCondition('tag')).toEqual({ identifier: 'tag', relative: 'eq', value: 'Grindfest' });
  });

  it('creates a default achievement condition', () => {
    expect(createDefaultCondition('achievement')).toEqual({ identifier: 'achievement', relative: 'eq', value: true });
  });
});

describe('matchesFilterCondition', () => {
  it('matches a grade condition using greater than', () => {
    const condition: FilterCondition = { identifier: 'grade', field: 'Luck', relative: 'gt', value: 'C' };
    expect(matchesFilterCondition({ achieved: true }, makeGrades({ Luck: 'B' }), condition)).toBe(true);
    expect(matchesFilterCondition({ achieved: true }, makeGrades({ Luck: 'C' }), condition)).toBe(false);
    expect(matchesFilterCondition({ achieved: true }, makeGrades({ Luck: 'D' }), condition)).toBe(false);
  });

  it('matches a grade condition using less than', () => {
    const condition: FilterCondition = { identifier: 'grade', field: 'Skill', relative: 'lt', value: 'C' };
    expect(matchesFilterCondition({ achieved: true }, makeGrades({ Skill: 'D' }), condition)).toBe(true);
    expect(matchesFilterCondition({ achieved: true }, makeGrades({ Skill: 'C' }), condition)).toBe(false);
  });

  it('matches a grade condition using equal to', () => {
    const condition: FilterCondition = { identifier: 'grade', field: 'Time', relative: 'eq', value: 'A' };
    expect(matchesFilterCondition({ achieved: true }, makeGrades({ Time: 'A' }), condition)).toBe(true);
    expect(matchesFilterCondition({ achieved: true }, makeGrades({ Time: 'B' }), condition)).toBe(false);
  });

  it('matches a tag condition against the tags derived from the grades', () => {
    const condition: FilterCondition = { identifier: 'tag', relative: 'eq', value: 'Grindfest' };
    expect(matchesFilterCondition({ achieved: true }, makeGrades({ Time: 'A', Skill: 'D' }), condition)).toBe(true);
    expect(matchesFilterCondition({ achieved: true }, makeGrades(), condition)).toBe(false);
  });

  it('matches an achievement condition against whether it has been achieved', () => {
    const achievedCondition: FilterCondition = { identifier: 'achievement', relative: 'eq', value: true };
    const lockedCondition: FilterCondition = { identifier: 'achievement', relative: 'eq', value: false };

    expect(matchesFilterCondition({ achieved: true }, makeGrades(), achievedCondition)).toBe(true);
    expect(matchesFilterCondition({ achieved: false }, makeGrades(), achievedCondition)).toBe(false);
    expect(matchesFilterCondition({ achieved: false }, makeGrades(), lockedCondition)).toBe(true);
  });
});

describe('filterAchievementsByConditions', () => {
  const achievements = [
    { apiname: 'one', achieved: true },
    { apiname: 'two', achieved: false },
    { apiname: 'three', achieved: true },
  ];

  const gradesByApiname = {
    one: makeGrades({ Luck: 'A' }),
    two: makeGrades({ Luck: 'A' }),
    three: makeGrades({ Luck: 'E' }),
  };

  it('keeps only achievements matching every condition', () => {
    const conditions: FilterCondition[] = [
      { identifier: 'grade', field: 'Luck', relative: 'eq', value: 'A' },
      { identifier: 'achievement', relative: 'eq', value: true },
    ];

    expect(filterAchievementsByConditions(achievements, conditions, gradesByApiname).map((a) => a.apiname)).toEqual([
      'one',
    ]);
  });

  it('returns every achievement when there are no conditions', () => {
    expect(filterAchievementsByConditions(achievements, [], gradesByApiname)).toEqual(achievements);
  });

  it('treats achievements missing from the grades map as having default grades', () => {
    const conditions: FilterCondition[] = [{ identifier: 'grade', field: 'Luck', relative: 'eq', value: 'C' }];

    expect(filterAchievementsByConditions([{ apiname: 'missing', achieved: true }], conditions, {})).toEqual([
      { apiname: 'missing', achieved: true },
    ]);
  });
});