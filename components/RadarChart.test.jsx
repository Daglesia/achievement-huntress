import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RadarChart from './RadarChart';

describe('RadarChart', () => {
  it('renders a label and grade letter for every field', () => {
    const data = [
      { field: 'A', grade: 'B' },
      { field: 'B', grade: 'D' },
      { field: 'C', grade: 'A' },
      { field: 'D', grade: 'C' },
      { field: 'E', grade: 'E' },
    ];
    render(<RadarChart data={data} />);

    data.forEach(({ field }) => {
      expect(screen.getAllByText(field).length).toBeGreaterThan(0);
    });
  });
});
