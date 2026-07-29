import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AchievementFilterBuilder from './AchievementFilterBuilder';
import type { FilterCondition } from '../lib/achievementFilterConditions';

describe('AchievementFilterBuilder', () => {
  it('adds a default grade condition when Add filter is clicked', async () => {
    const onChange = vi.fn();
    render(<AchievementFilterBuilder conditions={[]} onChange={onChange} onSave={() => {}} />);

    await userEvent.click(screen.getByText('+ Add filter'));

    expect(onChange).toHaveBeenCalledWith([{ identifier: 'grade', field: 'Luck', relative: 'eq', value: 'C' }]);
  });

  it('calls onSave, without touching conditions, when Save Filter is clicked', async () => {
    const condition: FilterCondition = { identifier: 'grade', field: 'Luck', relative: 'eq', value: 'C' };
    const onChange = vi.fn();
    const onSave = vi.fn();
    render(<AchievementFilterBuilder conditions={[condition]} onChange={onChange} onSave={onSave} />);

    await userEvent.click(screen.getByText('Save Filter'));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows only Add filter when there are no conditions', () => {
    render(<AchievementFilterBuilder conditions={[]} onChange={() => {}} onSave={() => {}} />);

    expect(screen.getByText('+ Add filter')).toBeInTheDocument();
    expect(screen.queryByText('Save Filter')).not.toBeInTheDocument();
  });

  it('shows only Save Filter once a condition is being edited', () => {
    const condition: FilterCondition = { identifier: 'grade', field: 'Luck', relative: 'eq', value: 'C' };
    render(<AchievementFilterBuilder conditions={[condition]} onChange={() => {}} onSave={() => {}} />);

    expect(screen.getByText('Save Filter')).toBeInTheDocument();
    expect(screen.queryByText('+ Add filter')).not.toBeInTheDocument();
  });
  it('renders the field, comparison, and value selects for a grade condition', () => {
    const condition: FilterCondition = { identifier: 'grade', field: 'Skill', relative: 'gt', value: 'B' };
    render(<AchievementFilterBuilder conditions={[condition]} onChange={() => {}} onSave={() => {}} />);

    expect(screen.getByLabelText('Grade field')).toHaveValue('Skill');
    expect(screen.getByLabelText('Comparison')).toHaveValue('gt');
    expect(screen.getByLabelText('Grade value')).toHaveValue('B');
  });

  it('calls onChange with the updated condition when the grade value changes', async () => {
    const condition: FilterCondition = { identifier: 'grade', field: 'Luck', relative: 'eq', value: 'C' };
    const onChange = vi.fn();
    render(<AchievementFilterBuilder conditions={[condition]} onChange={onChange} onSave={() => {}} />);

    await userEvent.selectOptions(screen.getByLabelText('Grade value'), 'A');

    expect(onChange).toHaveBeenCalledWith([{ identifier: 'grade', field: 'Luck', relative: 'eq', value: 'A' }]);
  });

  it('resets to a default condition when the identifier changes', async () => {
    const condition: FilterCondition = { identifier: 'grade', field: 'Luck', relative: 'eq', value: 'C' };
    const onChange = vi.fn();
    render(<AchievementFilterBuilder conditions={[condition]} onChange={onChange} onSave={() => {}} />);

    await userEvent.selectOptions(screen.getByLabelText('Filter identifier'), 'tag');

    expect(onChange).toHaveBeenCalledWith([{ identifier: 'tag', relative: 'eq', value: 'Grindfest' }]);
  });

  it('renders a tag value select listing every known tag', () => {
    const condition: FilterCondition = { identifier: 'tag', relative: 'eq', value: 'RNG Fiesta' };
    render(<AchievementFilterBuilder conditions={[condition]} onChange={() => {}} onSave={() => {}} />);

    expect(screen.getByLabelText('Tag value')).toHaveValue('RNG Fiesta');
    expect(screen.getByRole('option', { name: 'Grindfest' })).toBeInTheDocument();
  });

  it('renders an achieved/locked select for an achievement condition', () => {
    const condition: FilterCondition = { identifier: 'achievement', relative: 'eq', value: false };
    render(<AchievementFilterBuilder conditions={[condition]} onChange={() => {}} onSave={() => {}} />);

    expect(screen.getByLabelText('Achievement value')).toHaveValue('false');
  });

  it('removes a condition when its remove button is clicked', async () => {
    const conditions: FilterCondition[] = [
      { identifier: 'achievement', relative: 'eq', value: true },
      { identifier: 'tag', relative: 'eq', value: 'Grindfest' },
    ];
    const onChange = vi.fn();
    render(<AchievementFilterBuilder conditions={conditions} onChange={onChange} onSave={() => {}} />);

    await userEvent.click(screen.getAllByLabelText('Remove filter')[0]);

    expect(onChange).toHaveBeenCalledWith([conditions[1]]);
  });

  it('adds a default grade condition when Add filter is clicked', async () => {
    const onChange = vi.fn();
    render(<AchievementFilterBuilder conditions={[]} onChange={onChange} onSave={() => {}} />);

    await userEvent.click(screen.getByText('+ Add filter'));

    expect(onChange).toHaveBeenCalledWith([{ identifier: 'grade', field: 'Luck', relative: 'eq', value: 'C' }]);
  });

  it('calls onSave, without touching conditions, when Save Filter is clicked', async () => {
    const onChange = vi.fn();
    const onSave = vi.fn();
    render(<AchievementFilterBuilder conditions={[]} onChange={onChange} onSave={onSave} />);

    await userEvent.click(screen.getByText('Save Filter'));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});