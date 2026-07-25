export function sortAchievements<T extends { achieved: boolean }>(achievements: T[]): T[] {
  return [...achievements].sort((a, b) => {
    if (a.achieved === b.achieved) return 0;
    return a.achieved ? 1 : -1;
  });
}
