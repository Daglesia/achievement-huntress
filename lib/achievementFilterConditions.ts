import { DEFAULT_GRADE, GRADE_VALUE, TAG_LABELS, defaultGrades, getAchievementTags } from './grades';
import type { Grade, GradeField, GradeMap } from './grades';

export type FilterRelative = 'gt' | 'lt' | 'eq';

export type GradeFilterCondition = {
  identifier: 'grade';
  field: GradeField;
  relative: FilterRelative;
  value: Grade;
};

export type TagFilterCondition = {
  identifier: 'tag';
  relative: 'eq';
  value: string;
};

export type AchievementFilterCondition = {
  identifier: 'achievement';
  relative: 'eq';
  value: boolean;
};

export type FilterCondition = GradeFilterCondition | TagFilterCondition | AchievementFilterCondition;

export type AchievementGradesByApiname = Record<string, GradeMap>;

export const RELATIVE_LABEL: Record<FilterRelative, string> = {
  gt: 'greater than',
  lt: 'less than',
  eq: 'equal to',
};

export function createDefaultCondition(identifier: FilterCondition['identifier']): FilterCondition {
  if (identifier === 'grade') {
    return { identifier: 'grade', field: 'Luck', relative: 'eq', value: DEFAULT_GRADE };
  }
  if (identifier === 'tag') {
    return { identifier: 'tag', relative: 'eq', value: TAG_LABELS[0] };
  }
  return { identifier: 'achievement', relative: 'eq', value: true };
}

export function describeFilterCondition(condition: FilterCondition): string {
  if (condition.identifier === 'grade') {
    return `${condition.field} ${RELATIVE_LABEL[condition.relative]} ${condition.value}`;
  }
  if (condition.identifier === 'tag') {
    return `Tag: ${condition.value}`;
  }
  return condition.value ? 'Achieved' : 'Locked';
}

function gradeMatches(actual: Grade, relative: FilterRelative, expected: Grade): boolean {
  const actualValue = GRADE_VALUE[actual];
  const expectedValue = GRADE_VALUE[expected];

  if (relative === 'gt') return actualValue > expectedValue;
  if (relative === 'lt') return actualValue < expectedValue;
  return actualValue === expectedValue;
}

export function matchesFilterCondition(
  achievement: { achieved: boolean },
  grades: GradeMap,
  condition: FilterCondition
): boolean {
  if (condition.identifier === 'grade') {
    return gradeMatches(grades[condition.field], condition.relative, condition.value);
  }
  if (condition.identifier === 'tag') {
    return getAchievementTags(grades).includes(condition.value);
  }
  return achievement.achieved === condition.value;
}

export function filterAchievementsByConditions<T extends { apiname: string; achieved: boolean }>(
  achievements: T[],
  conditions: FilterCondition[],
  gradesByApiname: AchievementGradesByApiname
): T[] {
  return achievements.filter((achievement) => {
    const grades = gradesByApiname[achievement.apiname] ?? defaultGrades();
    return conditions.every((condition) => matchesFilterCondition(achievement, grades, condition));
  });
}