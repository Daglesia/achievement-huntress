import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GradeSelector from './GradeSelector';

describe('GradeSelector', () => {
  it('calls onChange with the clicked grade', async () => {
    const onChange = vi.fn();
    render(<GradeSelector value="C" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'A' }));

    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('marks only the current value as pressed', () => {
    render(<GradeSelector value="B" onChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'false');
  });
});
