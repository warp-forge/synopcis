import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhenomenonCard from '../PhenomenonCard';
import { MantineProvider } from '@mantine/core';
import { voteForProperty, proposeAlternative, addProperty } from '../../services/phenomenaApiService';

jest.mock('../../services/phenomenaApiService', () => ({
  voteForProperty: jest.fn(),
  proposeAlternative: jest.fn(),
  addProperty: jest.fn(),
}));

const properties = [
  {
    property: { text: 'Test Property', slug: 'test-prop' },
    value: { text: 'Test Value', slug: 'test-val' }
  }
];

const renderComponent = (props: any) => render(
  <MantineProvider>
    <PhenomenonCard phenomenonSlug="test-phenomenon" {...props} />
  </MantineProvider>
);

describe('PhenomenonCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders properties correctly', () => {
    renderComponent({ properties });
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('opens propose alternative modal and submits alternative', async () => {
    renderComponent({ properties });
    const proposeBtn = screen.getByLabelText('Propose Alternative');
    fireEvent.click(proposeBtn);

    await waitFor(() => {
        expect(screen.getByText('Propose Alternative', { selector: 'h2' })).toBeInTheDocument();
        expect(screen.getByText('Propose')).toBeInTheDocument();
    });

    const submitBtn = screen.getByText('Propose');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(proposeAlternative).toHaveBeenCalledWith('test-phenomenon', {
        property: { text: 'Test Property', slug: 'test-prop' },
        value: { text: 'Test Value', slug: 'test-val' }
      });
    });
  });

  it('opens add property modal and submits new property', async () => {
    renderComponent({ properties });
    const addBtn = screen.getByLabelText('Add Property');
    fireEvent.click(addBtn);

    await waitFor(() => {
        expect(screen.getByText('Add Property', { selector: 'h2' })).toBeInTheDocument();
        expect(screen.getByText('Add')).toBeInTheDocument();
    });

    const submitBtn = screen.getByText('Add');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(addProperty).toHaveBeenCalledWith('test-phenomenon', {
        property: { text: '', slug: '' },
        value: { text: '', slug: '' }
      });
    });
  });

  it('calls vote api when vote button is clicked', async () => {
    renderComponent({ properties });
    const voteBtn = screen.getByLabelText('Vote');
    fireEvent.click(voteBtn);

    await waitFor(() => {
      expect(voteForProperty).toHaveBeenCalledWith('test-phenomenon', 'test-prop', 'test-val');
    });
  });
});
