import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RadarChart from './RadarChart';

describe('RadarChart', () => {
  it('renders a label and grade letter for every field', () => {
    const data: Array<{ field: 'Luck' | 'Time' | 'Skill' | 'Enjoyment' | 'Consistency'; grade: 'E' | 'D' | 'C' | 'B' | 'A' }> = [
      { field: 'Luck', grade: 'B' },
      { field: 'Time', grade: 'D' },
      { field: 'Skill', grade: 'A' },
      { field: 'Enjoyment', grade: 'C' },
      { field: 'Consistency', grade: 'E' },
    ];
    render(<RadarChart data={data} />);

    data.forEach(({ field }) => {
      expect(screen.getAllByText(field).length).toBeGreaterThan(0);
    });
  });
});
