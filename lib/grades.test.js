import { describe, it, expect } from 'vitest';
import {
  FIELDS,
  GRADES,
  DEFAULT_GRADE,
  isValidGrade,
  defaultGrades,
  normalizeGrades,
  gradesToRadarData,
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
    const result = normalizeGrades({ A: 'A', B: 'Z', E: 'E' });
    expect(result.A).toBe('A');
    expect(result.B).toBe(DEFAULT_GRADE);
    expect(result.E).toBe('E');
    expect(Object.keys(result).sort()).toEqual([...FIELDS].sort());
  });

  it('treats missing or non-object input as all defaults', () => {
    expect(normalizeGrades(null)).toEqual(defaultGrades());
    expect(normalizeGrades(undefined)).toEqual(defaultGrades());
    expect(normalizeGrades('nonsense')).toEqual(defaultGrades());
  });

  it('converts a grades map into radar chart data in field order', () => {
    const data = gradesToRadarData({ A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' });
    expect(data).toEqual([
      { field: 'A', grade: 'A' },
      { field: 'B', grade: 'B' },
      { field: 'C', grade: 'C' },
      { field: 'D', grade: 'D' },
      { field: 'E', grade: 'E' },
    ]);
  });
});
