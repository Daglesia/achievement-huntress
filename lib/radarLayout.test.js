import { describe, it, expect } from 'vitest';
import { polarPoint, axisAngle, gradeRadius } from './radarLayout';
import { GRADE_VALUE } from './grades';

describe('radarLayout', () => {
  it('places the first axis pointing straight up', () => {
    expect(axisAngle(0, 5)).toBeCloseTo(-Math.PI / 2);
  });

  it('spaces five axes evenly around the circle', () => {
    const angles = [0, 1, 2, 3, 4].map((i) => axisAngle(i, 5));
    for (let i = 1; i < angles.length; i++) {
      expect(angles[i] - angles[i - 1]).toBeCloseTo((2 * Math.PI) / 5);
    }
  });

  it('converts polar coordinates to cartesian ones', () => {
    const [x, y] = polarPoint(100, 100, 50, 0);
    expect(x).toBeCloseTo(150);
    expect(y).toBeCloseTo(100);
  });

  it('scales grade radius linearly with grade value', () => {
    expect(gradeRadius('E', 100, GRADE_VALUE)).toBeCloseTo(20);
    expect(gradeRadius('C', 100, GRADE_VALUE)).toBeCloseTo(60);
    expect(gradeRadius('A', 100, GRADE_VALUE)).toBeCloseTo(100);
  });
});
