import React from 'react';
import { CardProperty } from '@/types/phenomenon';

export default function PhenomenonCard({ properties }: { properties: CardProperty[] }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
        <h3>Card properties:</h3>
        <ul>
          {properties.map(p => (
            <li key={p.property.slug}>{p.property.text}: {p.value.text}</li>
          ))}
        </ul>
    </div>
  );
}
