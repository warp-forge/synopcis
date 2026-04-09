import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import DiscussionSidebar from '../organisms/DiscussionSidebar';
import * as apiService from '@/app/phenomena/services/discussionApiService';

jest.mock('@/app/phenomena/services/discussionApiService');

const mockComments = [
  {
    id: 'c1',
    blockId: 'b001',
    author: { id: 'u1', name: 'Alice' },
    text: 'Test comment 1',
    createdAt: new Date().toISOString(),
    children: [
      {
        id: 'c2',
        blockId: 'b001',
        parentId: 'c1',
        author: { id: 'u2', name: 'Bob' },
        text: 'Test reply 1',
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const renderWithMantine = (component: React.ReactNode) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('DiscussionSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiService.fetchComments as jest.Mock).mockResolvedValue(mockComments);
  });

  it('loads and displays comments when opened', async () => {
    renderWithMantine(
      <DiscussionSidebar blockId="b001" isOpen={true} onClose={() => {}} />
    );

    // Initial load state
    expect(apiService.fetchComments).toHaveBeenCalledWith('b001');

    // Wait for comments to display
    await waitFor(() => {
      expect(screen.getByText('Test comment 1')).toBeInTheDocument();
    });

    // Check tree structure (child is also displayed)
    expect(screen.getByText('Test reply 1')).toBeInTheDocument();
  });

  it('can create a new comment', async () => {
    (apiService.createComment as jest.Mock).mockResolvedValue({});

    renderWithMantine(
      <DiscussionSidebar blockId="b001" isOpen={true} onClose={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Test comment 1')).toBeInTheDocument();
    });

    const textarea = screen.getAllByTestId('comment-textarea')[0];
    fireEvent.change(textarea, { target: { value: 'A new comment' } });

    const submitBtn = screen.getAllByTestId('submit-comment-button')[0];
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiService.createComment).toHaveBeenCalledWith('b001', 'A new comment');
    });
  });
});
