import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ItemList from './ItemList';

describe('ItemList', () => {
  it('renders a title and subtitle for each row', () => {
    render(
      <ItemList
        rows={[
          { key: 1, title: 'First', subtitle: 'One', onSelect: () => {} },
          { key: 2, title: 'Second', subtitle: 'Two', onSelect: () => {} },
        ]}
      />
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('omits the subtitle element when none is given', () => {
    render(<ItemList rows={[{ key: 1, title: 'Solo', onSelect: () => {} }]} />);

    expect(screen.getByText('Solo')).toBeInTheDocument();
    expect(document.querySelector('.dlc-list-item__content__subtitle')).not.toBeInTheDocument();
  });

  it('calls onSelect when a row is clicked', async () => {
    const onSelect = vi.fn();
    render(<ItemList rows={[{ key: 1, title: 'Click me', onSelect }]} />);

    await userEvent.click(screen.getByText('Click me'));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders an icon only when iconSrc is provided', () => {
    render(
      <ItemList
        rows={[
          { key: 1, title: 'With icon', iconSrc: '/icon.png', iconWidth: 32, iconHeight: 32, onSelect: () => {} },
          { key: 2, title: 'Without icon', onSelect: () => {} },
        ]}
      />
    );

    const icon = screen.getByRole('img');
    expect(icon).toHaveAttribute('src', '/icon.png');
    expect(icon).toHaveAttribute('width', '32');
    expect(icon).toHaveAttribute('height', '32');
  });

  it('applies wide and active modifier classes based on row flags', () => {
    render(
      <ItemList
        rows={[
          { key: 1, title: 'Plain', onSelect: () => {} },
          { key: 2, title: 'Wide', wide: true, onSelect: () => {} },
          { key: 3, title: 'Active', active: true, onSelect: () => {} },
        ]}
      />
    );

    expect(screen.getByText('Plain').closest('li')).toHaveClass('dlc-list-item');
    expect(screen.getByText('Plain').closest('li')).not.toHaveClass('dlc-list-item--wide');
    expect(screen.getByText('Wide').closest('li')).toHaveClass('dlc-list-item--wide');
    expect(screen.getByText('Active').closest('li')).toHaveClass('dlc-list-item--active');
  });

  it('wraps row content in contentWrapperClassName when given', () => {
    render(
      <ItemList
        contentWrapperClassName="custom-wrapper"
        rows={[{ key: 1, title: 'Wrapped', onSelect: () => {} }]}
      />
    );

    expect(document.querySelector('.custom-wrapper .dlc-list-item__content')).toBeInTheDocument();
  });
});