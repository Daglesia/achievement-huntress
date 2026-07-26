import { DEFAULT_GRADE, type Grade, type GradeMap } from './grades';

export type AchievementStatusFilter = 'all' | 'complete' | 'incomplete';

export type AchievementFilterState = {
  status: AchievementStatusFilter;
  grade: Grade | 'all';
  search: string;
};

export type AchievementGradesByApiname = Record<string, GradeMap>;

export function filterAchievements<T extends { apiname: string; achieved: boolean }>(
  achievements: T[],
  filters: AchievementFilterState & { achievementGradesByApiname: AchievementGradesByApiname }
): T[] {
  return achievements.filter((achievement) => {
    if (filters.status === 'complete' && !achievement.achieved) return false;
    if (filters.status === 'incomplete' && achievement.achieved) return false;

    if (filters.grade !== 'all') {
      const grades = filters.achievementGradesByApiname[achievement.apiname];
      const hasGrade = grades
        ? Object.values(grades).some((value) => value === filters.grade)
        : false;
      if (!hasGrade) return false;
    }

    const searchValue = filters.search ?? '';
    if (searchValue.trim()) {
      const query = searchValue.trim().toLowerCase();
      const haystack = `${achievement.apiname} ${achievement.displayName}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

export function getAvailableGrades(achievementGradesByApiname: AchievementGradesByApiname): Grade[] {
  const uniqueGrades = new Set<Grade>();

  Object.values(achievementGradesByApiname).forEach((grades) => {
    Object.values(grades).forEach((grade) => {
      if (grade !== DEFAULT_GRADE) {
        uniqueGrades.add(grade);
      }
    });
  });

  return Array.from(uniqueGrades).sort((a, b) => {
    const order: Record<Grade, number> = { E: 0, D: 1, C: 2, B: 3, A: 4 };
    return order[b] - order[a];
  });
}
