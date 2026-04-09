import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhenomenonCard from '../PhenomenonCard';
import { MantineProvider } from '@mantine/core';

const properties = [
  {
    property: { text: 'Test Property', slug: 'test-prop' },
    value: { text: 'Test Value', slug: 'test-val' }
  }
];

const renderComponent = (props: any) => render(
  <MantineProvider>
    <PhenomenonCard {...props} />
  </MantineProvider>
);

describe('PhenomenonCard', () => {
  it('renders properties correctly', () => {
    renderComponent({ properties });
    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('opens propose alternative modal', async () => {
    renderComponent({ properties });
    const proposeBtn = screen.getByLabelText('Propose Alternative');
    fireEvent.click(proposeBtn);

    await waitFor(() => {
        expect(screen.getByText('Propose Alternative')).toBeInTheDocument();
        expect(screen.getByText('Propose')).toBeInTheDocument();
    });
  });

  it('opens add property modal', async () => {
    renderComponent({ properties });
    const addBtn = screen.getByLabelText('Add Property');
    fireEvent.click(addBtn);

    await waitFor(() => {
        expect(screen.getByText('Add Property', { selector: 'h2' })).toBeInTheDocument();
        expect(screen.getByText('Add')).toBeInTheDocument();
    });
  });
});
