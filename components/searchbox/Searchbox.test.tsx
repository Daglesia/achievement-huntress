import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBox from './Searchbox';

describe('SearchBox', () => {
  it('renders a magnifying-glass icon', () => {
    render(<SearchBox id="game-search" value="" onChange={() => {}} />);

    expect(screen.getByText('Search games')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onChange with the typed value', async () => {
    const onChange = vi.fn();
    render(
      <SearchBox id="game-search" value="" onChange={onChange} placeholder="Search games" />
    );

    await userEvent.type(screen.getByPlaceholderText('Search games'), 'a');

    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('reflects the current value in the input', () => {
    render(<SearchBox id="game-search" value="halo" onChange={() => {}} />);

    expect(screen.getByLabelText('Search games')).toHaveValue('halo');
  });
});