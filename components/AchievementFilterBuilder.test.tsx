import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AchievementFilterBuilder from './AchievementFilterBuilder';
import type { FilterCondition } from '../lib/achievementFilterConditions';

describe('AchievementFilterBuilder', () => {
  it('shows only the Add filter button when there are no conditions', () => {
    render(<AchievementFilterBuilder conditions={[]} onChange={() => {}} />);

    expect(screen.getByText('+ Add filter')).toBeInTheDocument();
    expect(screen.queryByText('Save Filter')).not.toBeInTheDocument();
  });

  it('renders the Add filter button before any saved tags', () => {
    const conditions: FilterCondition[] = [{ identifier: 'grade', field: 'Luck', relative: 'eq', value: 'C' }];
    const { container } = render(<AchievementFilterBuilder conditions={conditions} onChange={() => {}} />);

    const addButtonIndex = container.textContent!.indexOf('+ Add filter');
    const tagIndex = container.textContent!.indexOf('Luck equal to C');

    expect(addButtonIndex).toBeGreaterThanOrEqual(0);
    expect(tagIndex).toBeGreaterThan(addButtonIndex);
  });

  it('renders each saved condition as a tag', () => {
    const conditions: FilterCondition[] = [
      { identifier: 'grade', field: 'Luck', relative: 'eq', value: 'C' },
      { identifier: 'tag', relative: 'eq', value: 'Grindfest' },
    ];
    render(<AchievementFilterBuilder conditions={conditions} onChange={() => {}} />);

    expect(screen.getByText('Luck equal to C')).toBeInTheDocument();
    expect(screen.getByText('Tag: Grindfest')).toBeInTheDocument();
  });

  it('opens the filter editor and hides Add filter when clicked', async () => {
    render(<AchievementFilterBuilder conditions={[]} onChange={() => {}} />);

    await userEvent.click(screen.getByText('+ Add filter'));

    expect(screen.queryByText('+ Add filter')).not.toBeInTheDocument();
    expect(screen.getByText('Save Filter')).toBeInTheDocument();
    expect(screen.getByLabelText('Grade field')).toBeInTheDocument();
  });

  it('does not call onChange while editing a draft filter', async () => {
    const onChange = vi.fn();
    render(<AchievementFilterBuilder conditions={[]} onChange={onChange} />);

    await userEvent.click(screen.getByText('+ Add filter'));
    await userEvent.selectOptions(screen.getByLabelText('Grade value'), 'A');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange with the drafted filter added when Save Filter is clicked', async () => {
    const onChange = vi.fn();
    render(<AchievementFilterBuilder conditions={[]} onChange={onChange} />);

    await userEvent.click(screen.getByText('+ Add filter'));
    await userEvent.selectOptions(screen.getByLabelText('Grade value'), 'A');
    await userEvent.click(screen.getByText('Save Filter'));

    expect(onChange).toHaveBeenCalledWith([{ identifier: 'grade', field: 'Luck', relative: 'eq', value: 'A' }]);
  });

  it('shows the Add filter button again after saving', async () => {
    render(<AchievementFilterBuilder conditions={[]} onChange={() => {}} />);

    await userEvent.click(screen.getByText('+ Add filter'));
    await userEvent.click(screen.getByText('Save Filter'));

    expect(screen.getByText('+ Add filter')).toBeInTheDocument();
    expect(screen.queryByText('Save Filter')).not.toBeInTheDocument();
  });

  it('switches fields when the filter identifier changes', async () => {
    render(<AchievementFilterBuilder conditions={[]} onChange={() => {}} />);

    await userEvent.click(screen.getByText('+ Add filter'));
    await userEvent.selectOptions(screen.getByLabelText('Filter identifier'), 'tag');

    expect(screen.getByLabelText('Tag value')).toBeInTheDocument();
    expect(screen.queryByLabelText('Grade field')).not.toBeInTheDocument();
  });

  it('removes a saved condition when its tag is removed', async () => {
    const conditions: FilterCondition[] = [
      { identifier: 'achievement', relative: 'eq', value: true },
      { identifier: 'tag', relative: 'eq', value: 'Grindfest' },
    ];
    const onChange = vi.fn();
    render(<AchievementFilterBuilder conditions={conditions} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove Achieved filter' }));

    expect(onChange).toHaveBeenCalledWith([conditions[1]]);
  });
});