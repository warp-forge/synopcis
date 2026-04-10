import { Phenomenon, CardProperty } from '@/types/phenomenon';

// Existing stubbed methods to prevent build errors in create/page.tsx
export const createPhenomenon = async (title: string): Promise<Phenomenon> => {
    return {} as Phenomenon;
};
export const generateAIDraft = async (title: string): Promise<Phenomenon> => {
    return {} as Phenomenon;
};

// --- Backend Blocker explicitly marked here ---
// NOTE: As of now, there is no canonical merged backend contract for the phenomenon card editing flow (Task 012).
// The edit/add/vote flows below are isolated behind this service boundary and use stubbed implementations.
// Once a dedicated backend contract for the article-to-value-concept relationship (where the parent concept is the property)
// is merged, replace these stubs with actual fetch calls.

export const voteForProperty = async (phenomenonSlug: string, propertySlug: string, valueSlug: string): Promise<void> => {
  console.log(`[STUB] API Call: Voted for property ${propertySlug} -> ${valueSlug} in phenomenon ${phenomenonSlug}`);
  return Promise.resolve();
};

export const proposeAlternative = async (phenomenonSlug: string, property: CardProperty): Promise<void> => {
  console.log(`[STUB] API Call: Proposing alternative for ${property.property.slug} in phenomenon ${phenomenonSlug}`);
  return Promise.resolve();
};

export const addProperty = async (phenomenonSlug: string, property: CardProperty): Promise<void> => {
  console.log(`[STUB] API Call: Adding new property ${property.property.slug} to phenomenon ${phenomenonSlug}`);
  return Promise.resolve();
};
