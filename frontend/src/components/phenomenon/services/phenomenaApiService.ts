import { Phenomenon, CardProperty } from '@/types/phenomenon';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Existing stubbed methods to prevent build errors in create/page.tsx
export const createPhenomenon = async (title: string): Promise<Phenomenon> => {
    return {} as Phenomenon;
};
export const generateAIDraft = async (title: string): Promise<Phenomenon> => {
    return {} as Phenomenon;
};

// New methods for PhenomenonCard using fetch
export const voteForProperty = async (phenomenonSlug: string, propertySlug: string, valueSlug: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/phenomena/${phenomenonSlug}/properties/${propertySlug}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ valueSlug }),
  });

  if (!response.ok) {
    throw new Error('Failed to vote for property');
  }
};

export const proposeAlternative = async (phenomenonSlug: string, property: CardProperty): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/phenomena/${phenomenonSlug}/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(property),
  });

  if (!response.ok) {
    throw new Error('Failed to propose alternative property');
  }
};

export const addProperty = async (phenomenonSlug: string, property: CardProperty): Promise<void> => {
  // Adding a new property is technically the same as proposing an alternative to a non-existent one
  // or depends on specific backend routing. We will use a standard POST.
  const response = await fetch(`${API_BASE_URL}/phenomena/${phenomenonSlug}/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(property),
  });

  if (!response.ok) {
    throw new Error('Failed to add new property');
  }
};
