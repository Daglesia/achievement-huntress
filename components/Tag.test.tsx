import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tag from './Tag';

describe('Tag', () => {
  it('renders the label text', () => {
    render(<Tag label="Luck equal to C" onRemove={() => {}} />);

    expect(screen.getByText('Luck equal to C')).toBeInTheDocument();
  });

  it('calls onRemove when the remove button is clicked', async () => {
    const onRemove = vi.fn();
    render(<Tag label="Luck equal to C" onRemove={onRemove} />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove Luck equal to C filter' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});