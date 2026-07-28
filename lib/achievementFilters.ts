export function filterAchievementsBySearch<T extends { apiname: string; displayName?: string }>(
  achievements: T[],
  search: string
): T[] {
  const query = search.trim().toLowerCase();
  if (!query) return achievements;

  return achievements.filter((achievement) => {
    const haystack = `${achievement.apiname} ${achievement.displayName}`.toLowerCase();
    return haystack.includes(query);
  });
}