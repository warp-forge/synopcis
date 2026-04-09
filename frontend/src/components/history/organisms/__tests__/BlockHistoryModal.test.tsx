import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import BlockHistoryModal from '../BlockHistoryModal';

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock;

const mockCommits = [
  {
    hash: 'commit1',
    author: 'Alice',
    date: '2023-10-25T14:30:00Z',
    message: 'Update text',
  },
  {
    hash: 'commit2',
    author: 'Bob',
    date: '2023-10-20T09:15:00Z',
    message: 'Fix typo',
  },
];

const mockDiff = {
  diff: '--- a/file\n+++ b/file\n-Old text\n+New text',
};

describe('BlockHistoryModal', () => {
  const renderComponent = (props: any) => {
    return render(
      <MantineProvider>
        <BlockHistoryModal {...props} />
      </MantineProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays history when opened', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCommits,
    });

    renderComponent({ opened: true, onClose: jest.fn(), file: 'test-file' });

    // Ensure it shows the title
    expect(screen.getByText('Block History')).toBeInTheDocument();

    // Wait for fetch to complete and commits to render
    await waitFor(() => {
      expect(screen.getByText('Update text')).toBeInTheDocument();
      expect(screen.getByText('Fix typo')).toBeInTheDocument();
      expect(screen.getByText('By Alice')).toBeInTheDocument();
      expect(screen.getByText('By Bob')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/git/history?file=test-file');
  });

  it('allows comparing two commits', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommits,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDiff,
      });

    renderComponent({ opened: true, onClose: jest.fn(), file: 'test-file' });

    await waitFor(() => {
      expect(screen.getByText('Update text')).toBeInTheDocument();
    });

    // Check two checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);

    // Click compare button
    const compareBtn = screen.getByRole('button', { name: /Compare Selected/i });
    expect(compareBtn).not.toBeDisabled();
    fireEvent.click(compareBtn);

    // Wait for diff to load
    await waitFor(() => {
      expect(screen.getByText('Difference:')).toBeInTheDocument();
    });

    // We can just check that the diff lines are rendered.
    // The exact text rendering splits by newline
    expect(screen.getByText('-Old text')).toBeInTheDocument();
    expect(screen.getByText('+New text')).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenLastCalledWith(
      'http://localhost:3000/api/git/diff?file=test-file&commit1=commit2&commit2=commit1'
    );
  });
});
