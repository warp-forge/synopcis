import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlockAlternatives from '../BlockAlternatives';
import { MantineProvider } from '@mantine/core';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

const mockAlternatives = [
  {
    alternative: {
      file: 'alt1.md',
      lang: 'en',
      votes: 10,
      source: null,
      trust_score: 95,
    },
    content: 'Content 1',
  },
  {
    alternative: {
      file: 'alt2.md',
      lang: 'en',
      votes: 5,
      source: null,
      trust_score: 80,
    },
    content: 'Content 2',
  },
];

describe('BlockAlternatives', () => {
  it('renders button with correct alternative count', () => {
    render(
      <MantineProvider>
        <BlockAlternatives
          blockId="block1"
          alternatives={mockAlternatives}
          winningAlternativeFile="alt1.md"
        />
      </MantineProvider>
    );

    expect(screen.getByRole('button', { name: /View Alternatives \(2\)/i })).toBeInTheDocument();
  });

  it('opens modal and displays alternatives', async () => {
    render(
      <MantineProvider>
        <BlockAlternatives
          blockId="block1"
          alternatives={mockAlternatives}
          winningAlternativeFile="alt1.md"
        />
      </MantineProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /View Alternatives/i }));

    await waitFor(() => {
      expect(screen.getByText('Alternatives for Block block1')).toBeInTheDocument();
    });

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.getByText('Winning')).toBeInTheDocument();
  });

  it('handles voting for an alternative', async () => {
    render(
      <MantineProvider>
        <BlockAlternatives
          blockId="block1"
          alternatives={mockAlternatives}
          winningAlternativeFile="alt1.md"
        />
      </MantineProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /View Alternatives/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Vote \(10\)/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Vote \(10\)/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Vote \(11\)/i })).toBeInTheDocument();
    });
  });

  it('handles proposing a new alternative', async () => {
    render(
      <MantineProvider>
        <BlockAlternatives
          blockId="block1"
          alternatives={mockAlternatives}
          winningAlternativeFile="alt1.md"
        />
      </MantineProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /View Alternatives/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Propose New Alternative/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Propose New Alternative/i }));

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /Content/i })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('textbox', { name: /Content/i }), { target: { value: 'New Proposed Content' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit Proposal/i }));

    await waitFor(() => {
      expect(screen.getByText('New Proposed Content')).toBeInTheDocument();
    });

    // Check if the count has incremented to 3 in the main button text
    expect(screen.getByRole('button', { name: /View Alternatives \(3\)/i })).toBeInTheDocument();
  });
});
