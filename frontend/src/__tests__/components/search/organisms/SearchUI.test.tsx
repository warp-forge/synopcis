import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import SearchUI from '@/components/search/organisms/SearchUI';
import '@testing-library/jest-dom';

// Mock the mock data
jest.mock('@/app/mock-data', () => ({
  mockPhenomena: [
    {
      id: '1',
      slug: 'test-phenomenon',
      title: 'Test Phenomenon',
      blocks: [{ id: 'b1', content: 'This is a test block' }]
    },
    {
      id: '2',
      slug: 'another-phenomenon',
      title: 'Another Phenomenon',
      blocks: [{ id: 'b2', content: 'This is another test block' }]
    }
  ]
}));

describe('SearchUI', () => {
  const renderComponent = () => {
    return render(
      <MantineProvider>
        <SearchUI />
      </MantineProvider>
    );
  };

  it('renders search input', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/Search for phenomena, concepts, or blocks.../i)).toBeInTheDocument();
  });

  it('shows results when typing a matching query', async () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/Search for phenomena, concepts, or blocks.../i);

    fireEvent.change(input, { target: { value: 'Test Phenomenon' } });

    await waitFor(() => {
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
      expect(screen.getByText('Test Phenomenon')).toBeInTheDocument();
    });
  });

  it('shows no results message for non-matching query', async () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/Search for phenomena, concepts, or blocks.../i);

    fireEvent.change(input, { target: { value: 'xyz123' } });

    await waitFor(() => {
      expect(screen.getByTestId('no-results')).toBeInTheDocument();
      expect(screen.getByText(/No results found for "xyz123"/i)).toBeInTheDocument();
    });
  });

  it('filters by block content', async () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/Search for phenomena, concepts, or blocks.../i);

    fireEvent.change(input, { target: { value: 'another test block' } });

    await waitFor(() => {
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
      expect(screen.getByText('Another Phenomenon')).toBeInTheDocument();
    });
  });
});
