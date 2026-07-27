export const HUNTRESS_ROLE = 'achhunt:huntress';
export const USER_ROLE = 'achhunt:user';

export type AchhuntRole = typeof HUNTRESS_ROLE | typeof USER_ROLE;

const KNOWN_ROLES: readonly AchhuntRole[] = [HUNTRESS_ROLE, USER_ROLE];

export function parseAchhuntRoles(groups: unknown): AchhuntRole[] {
  if (!Array.isArray(groups)) return [];
  return KNOWN_ROLES.filter((role) => groups.includes(role));
}

export function isHuntress(roles: AchhuntRole[]): boolean {
  return roles.includes(HUNTRESS_ROLE);
}

export function isAchhuntUser(roles: AchhuntRole[]): boolean {
  return roles.length > 0;
}