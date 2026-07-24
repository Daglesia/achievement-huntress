import { describe, it, expect } from 'vitest';
import {
  FIELDS,
  GRADES,
  DEFAULT_GRADE,
  isValidGrade,
  defaultGrades,
  normalizeGrades,
  gradesToRadarData,
  getAchievementTags,
} from './grades';

describe('grades', () => {
  it('orders grades from lowest to highest', () => {
    expect(GRADES).toEqual(['E', 'D', 'C', 'B', 'A']);
  });

  it('validates known grades only', () => {
    expect(isValidGrade('A')).toBe(true);
    expect(isValidGrade('F')).toBe(false);
    expect(isValidGrade(undefined)).toBe(false);
  });

  it('fills every field with the default grade', () => {
    expect(defaultGrades()).toEqual(
      Object.fromEntries(FIELDS.map((field) => [field, DEFAULT_GRADE]))
    );
  });

  it('keeps valid grades and replaces invalid ones with the default', () => {
    const result = normalizeGrades({ Luck: 'A', Time: 'Z', Consistency: 'E' });
    expect(result.Luck).toBe('A');
    expect(result.Time).toBe(DEFAULT_GRADE);
    expect(result.Consistency).toBe('E');
    expect(Object.keys(result).sort()).toEqual([...FIELDS].sort());
  });

  it('treats missing or non-object input as all defaults', () => {
    expect(normalizeGrades(null)).toEqual(defaultGrades());
    expect(normalizeGrades(undefined)).toEqual(defaultGrades());
    expect(normalizeGrades('nonsense' as unknown as null)).toEqual(defaultGrades());
  });

  it('converts a grades map into radar chart data in field order', () => {
    const data = gradesToRadarData({
      Luck: 'A',
      Time: 'B',
      Skill: 'C',
      Enjoyment: 'D',
      Consistency: 'E',
    });
    expect(data).toEqual([
      { field: 'Luck', grade: 'A' },
      { field: 'Time', grade: 'B' },
      { field: 'Skill', grade: 'C' },
      { field: 'Enjoyment', grade: 'D' },
      { field: 'Consistency', grade: 'E' },
    ]);
  });

  it('generates tags for known grade patterns', () => {
    expect(
      getAchievementTags({
        Luck: 'C',
        Time: 'A',
        Skill: 'D',
        Enjoyment: 'C',
        Consistency: 'C',
      })
    ).toEqual(['Grindfest']);

    expect(
      getAchievementTags({
        Luck: 'A',
        Time: 'A',
        Skill: 'D',
        Enjoyment: 'C',
        Consistency: 'C',
      })
    ).toEqual(['Grindfest', 'RNG Fiesta']);

    expect(
      getAchievementTags({
        Luck: 'E',
        Time: 'C',
        Skill: 'C',
        Enjoyment: 'B',
        Consistency: 'B',
      })
    ).toEqual([]);
  });
});
