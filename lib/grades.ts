export const FIELDS = ['Luck', 'Time', 'Skill', 'Enjoyment', 'Consistency'] as const;
export type GradeField = (typeof FIELDS)[number];

export const GRADES = ['E', 'D', 'C', 'B', 'A'] as const;
export type Grade = (typeof GRADES)[number];

export type GradeMap = Record<GradeField, Grade>;
export type GradeInput = Partial<Record<GradeField, unknown>>;

export const DEFAULT_GRADE: Grade = 'C';

export const GRADE_VALUE: Record<Grade, number> = { E: 1, D: 2, C: 3, B: 4, A: 5 };

export const GRADE_COLOR: Record<Grade, string> = {
  E: '#5C8079',
  D: '#7E8A6A',
  C: '#A0945A',
  B: '#C19E4B',
  A: '#E3A83B',
};

export function isValidGrade(value: unknown): value is Grade {
  return typeof value === 'string' && GRADES.includes(value as Grade);
}

export function defaultGrades(): GradeMap {
  return Object.fromEntries(FIELDS.map((field) => [field, DEFAULT_GRADE])) as GradeMap;
}

export function normalizeGrades(input: GradeInput | null | undefined): GradeMap {
  const source = input && typeof input === 'object' ? input : {};
  return Object.fromEntries(
    FIELDS.map((field) => [field, isValidGrade(source[field]) ? source[field] : DEFAULT_GRADE])
  ) as GradeMap;
}

export function gradesToRadarData(grades: GradeInput | null | undefined) {
  const normalized = normalizeGrades(grades);
  return FIELDS.map((field) => ({ field, grade: normalized[field] }));
}
