import { describe, expect, it } from 'vitest';
import { HUNTRESS_ROLE, USER_ROLE, isAchhuntUser, isHuntress, parseAchhuntRoles } from './roles';

describe('parseAchhuntRoles', () => {
  it('keeps only recognized achhunt roles, in a fixed order', () => {
    expect(parseAchhuntRoles(['some-other-group', 'achhunt:user', 'achhunt:huntress'])).toEqual([
      HUNTRESS_ROLE,
      USER_ROLE,
    ]);
  });

  it('returns an empty list for non-array input', () => {
    expect(parseAchhuntRoles(undefined)).toEqual([]);
    expect(parseAchhuntRoles(null)).toEqual([]);
    expect(parseAchhuntRoles('achhunt:huntress')).toEqual([]);
  });

  it('returns an empty list when no achhunt roles are present', () => {
    expect(parseAchhuntRoles(['unrelated-group'])).toEqual([]);
  });
});

describe('isHuntress', () => {
  it('is true only when the huntress role is present', () => {
    expect(isHuntress([HUNTRESS_ROLE])).toBe(true);
    expect(isHuntress([USER_ROLE])).toBe(false);
    expect(isHuntress([])).toBe(false);
  });
});

describe('isAchhuntUser', () => {
  it('is true for any recognized role, false otherwise', () => {
    expect(isAchhuntUser([USER_ROLE])).toBe(true);
    expect(isAchhuntUser([HUNTRESS_ROLE])).toBe(true);
    expect(isAchhuntUser([])).toBe(false);
  });
});