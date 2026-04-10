import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhenomenonView from '../PhenomenonView';
import { MantineProvider } from '@mantine/core';

// Mock matchMedia and ResizeObserver for Mantine components
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

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock react-markdown due to ESM issues in Jest
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: React.ReactNode }) {
    return <div data-testid="react-markdown-mock">{children}</div>;
  };
});

const mockManifest = {
  article_slug: "test-slug",
  title: "Test Title",
  last_updated: "2024-01-01",
  default_lang: "en",
  structure: [{ block_id: "b1", level: 1 }],
  blocks: {
    "b1": {
      type: "text",
      alternatives: [
        { file: "en/b1-v1.md", lang: "en", votes: 10, source: null, trust_score: 1 },
        { file: "en/b1-v2.md", lang: "en", votes: 5, source: null, trust_score: 0.8 }
      ]
    }
  }
} as any;

const mockPhenomenon = {
  slug: "test-slug",
  title: "Test Title",
  blocks: [
    {
      id: "b1",
      type: "text",
      level: 1,
      content: "Main Content",
      source: null,
      alternativesCount: 2
    }
  ]
} as any;

describe('PhenomenonView', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
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
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <MantineProvider>
        {ui}
      </MantineProvider>
    );
  };

  it('renders the main block content', () => {
    renderWithProvider(<PhenomenonView phenomenon={mockPhenomenon} manifest={mockManifest} />);
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('renders a badge with the number of alternatives (+1)', () => {
    renderWithProvider(<PhenomenonView phenomenon={mockPhenomenon} manifest={mockManifest} />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('opens the alternatives drawer and fetches content when the badge is clicked', async () => {
    // Mock the fetch responses
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/test-slug/en/b1-v1.md') {
        return Promise.resolve({ ok: true, text: () => Promise.resolve('Alt Content 1') });
      }
      if (url === '/test-slug/en/b1-v2.md') {
        return Promise.resolve({ ok: true, text: () => Promise.resolve('Alt Content 2') });
      }
      return Promise.resolve({ ok: false });
    });

    renderWithProvider(<PhenomenonView phenomenon={mockPhenomenon} manifest={mockManifest} />);

    // Drawer should not be open initially
    expect(screen.queryByText('Alternatives (2)')).not.toBeInTheDocument();

    // Click the badge
    fireEvent.click(screen.getByText('+1'));

    // Verify Drawer title appears
    await waitFor(() => {
      expect(screen.getByText('Alternatives (2)')).toBeInTheDocument();
    });

    // Verify loading state finishes and content is rendered
    await waitFor(() => {
      expect(screen.getByText('Alt Content 1')).toBeInTheDocument();
      expect(screen.getByText('Alt Content 2')).toBeInTheDocument();
    });

    // Verify fetch was called with correct URLs
    expect(global.fetch).toHaveBeenCalledWith('/test-slug/en/b1-v1.md');
    expect(global.fetch).toHaveBeenCalledWith('/test-slug/en/b1-v2.md');
  });
});
