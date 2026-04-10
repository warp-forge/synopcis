"use client";

import React, { useState, useEffect } from 'react';
import { TextInput, Title, Box, Text, Paper, UnstyledButton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Phenomenon } from '@/types/phenomenon';
import Link from 'next/link';

export default function SearchUI() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [results, setResults] = useState<Phenomenon[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const { mockPhenomena } = await import('@/app/mock-data');
        const searchResults = mockPhenomena.filter((p) =>
            p.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            p.blocks.some(b => b.content.toLowerCase().includes(debouncedQuery.toLowerCase()))
        );
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return (
    <>
      <Title order={2} mb="md">Search Content</Title>
      <TextInput
        placeholder="Search for phenomena, concepts, or blocks..."
        size="lg"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
        mb="md"
        data-testid="search-input"
      />

      {isSearching && <Text size="sm" c="dimmed">Searching...</Text>}

      {!isSearching && results.length > 0 && (
        <Box data-testid="search-results">
            <Text mb="xs" fw={500}>Results:</Text>
            {results.map((result) => (
                <Paper key={result.id} shadow="xs" p="md" mb="sm" withBorder>
                    <UnstyledButton component={Link} href={`/phenomena/${result.slug}`}>
                        <Title order={4}>{result.title}</Title>
                        <Text size="sm" c="dimmed" mt="xs" lineClamp={2}>
                            {result.blocks[0]?.content}
                        </Text>
                    </UnstyledButton>
                </Paper>
            ))}
        </Box>
      )}

      {!isSearching && debouncedQuery && results.length === 0 && (
          <Text c="dimmed" data-testid="no-results">No results found for &quot;{debouncedQuery}&quot;</Text>
      )}
    </>
  );
}
