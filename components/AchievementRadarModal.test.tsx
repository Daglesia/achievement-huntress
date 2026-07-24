import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AchievementRadarModal from './AchievementRadarModal';

const achievement = { apiname: 'WIN_THE_GAME', displayName: 'Win the game' };

describe('AchievementRadarModal', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ grades: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' } }),
    });
  });

  it('shows edit controls once loaded when logged in', async () => {
    render(<AchievementRadarModal steamId="123" appid={440} achievement={achievement} onClose={() => {}} />);

    await waitFor(() => expect(screen.getByText('Save')).toBeInTheDocument());
  });

  it('hides edit controls and shows a login prompt when logged out', async () => {
    render(<AchievementRadarModal steamId={null} appid={440} achievement={achievement} onClose={() => {}} />);

    await waitFor(() => expect(screen.getByText(/log in to edit/i)).toBeInTheDocument());
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('fetches grades for the right game and achievement', async () => {
    render(<AchievementRadarModal steamId="123" appid={440} achievement={achievement} onClose={() => {}} />);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/achievement-grades?appid=440&apiname=WIN_THE_GAME')
    );
  });

  it('posts the edited grades when Save is clicked', async () => {
    render(<AchievementRadarModal steamId="123" appid={440} achievement={achievement} onClose={() => {}} />);
    await waitFor(() => screen.getByText('Save'));

    const unpressedEButtons = screen.getAllByRole('button', { name: 'E', pressed: false });
    await userEvent.click(unpressedEButtons[0]);
    await userEvent.click(screen.getByText('Save'));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith(
        '/api/achievement-grades',
        expect.objectContaining({ method: 'POST' })
      )
    );
  });

  it('closes when the backdrop is clicked but not when the panel is clicked', async () => {
    const onClose = vi.fn();
    render(<AchievementRadarModal steamId="123" appid={440} achievement={achievement} onClose={onClose} />);
    await waitFor(() => screen.getByText('Save'));

    await userEvent.click(screen.getByText('Save'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
