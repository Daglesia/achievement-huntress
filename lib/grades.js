export const FIELDS = ['Luck', 'Time', 'Skill', 'Enjoyment', 'Consistency'];
export const GRADES = ['E', 'D', 'C', 'B', 'A'];
export const DEFAULT_GRADE = 'C';

export const GRADE_VALUE = { E: 1, D: 2, C: 3, B: 4, A: 5 };

export const GRADE_COLOR = {
  E: '#5C8079',
  D: '#7E8A6A',
  C: '#A0945A',
  B: '#C19E4B',
  A: '#E3A83B',
};

export function isValidGrade(value) {
  return GRADES.includes(value);
}

export function defaultGrades() {
  return Object.fromEntries(FIELDS.map((field) => [field, DEFAULT_GRADE]));
}

export function normalizeGrades(input) {
  const source = input && typeof input === 'object' ? input : {};
  return Object.fromEntries(
    FIELDS.map((field) => [field, isValidGrade(source[field]) ? source[field] : DEFAULT_GRADE])
  );
}

export function gradesToRadarData(grades) {
  const normalized = normalizeGrades(grades);
  return FIELDS.map((field) => ({ field, grade: normalized[field] }));
}
