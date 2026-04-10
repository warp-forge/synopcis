'use client';

import React, { useState } from 'react';
import { RenderablePhenomenon, RenderableBlock, Manifest, Alternative } from '@/types/phenomenon';
import { Box, TypographyStylesProvider, Group, Badge, Drawer, Stack, Paper, Text, Anchor } from '@mantine/core';
import BlockWithDiscussion from '../../discussion/organisms/BlockWithDiscussion';
import ReactMarkdown from 'react-markdown';

// We inline IconLayersLinked and IconExternalLink to avoid adding more dependencies
const IconLayersLinked = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19 8.268a2 2 0 0 1 1 1.732v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2h3" /><path d="M5 15.732a2 2 0 0 1 -1 -1.732v-8a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-3" /></svg>
);

const IconExternalLink = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" /><path d="M11 13l9 -9" /><path d="M15 4h5v5" /></svg>
);

interface PhenomenonViewProps {
  phenomenon: RenderablePhenomenon;
  manifest?: Manifest;
}

export default function PhenomenonView({ phenomenon, manifest }: PhenomenonViewProps) {
  return (
    <Box>
      {phenomenon.blocks.map((block) => (
        <PhenomenonBlock key={block.id} block={block} phenomenonSlug={phenomenon.slug} manifest={manifest} />
      ))}
    </Box>
  );
}

function PhenomenonBlock({ block, phenomenonSlug, manifest }: { block: RenderableBlock; phenomenonSlug: string; manifest?: Manifest }) {
  const [opened, setOpened] = useState(false);
  const [alternativesData, setAlternativesData] = useState<Alternative[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedContents, setLoadedContents] = useState<Record<string, string>>({});

  const handleOpenAlternatives = async () => {
    setOpened(true);
    if (!manifest) return;

    setLoading(true);
    try {
      const blockData = manifest.blocks[block.id];
      if (blockData && blockData.alternatives) {
        // Sort alternatives by votes descending
        const sortedAlts = [...blockData.alternatives].sort((a, b) => b.votes - a.votes);
        setAlternativesData(sortedAlts);

        // Fetch contents for alternatives not yet loaded
        const newContents = { ...loadedContents };
        for (const alt of sortedAlts) {
          if (!newContents[alt.file]) {
            try {
              // The static files should be available at /slug/file.md
              const res = await fetch(`/${phenomenonSlug}/${alt.file}`);
              if (res.ok) {
                newContents[alt.file] = await res.text();
              } else {
                newContents[alt.file] = "Failed to load content from cache/server.";
              }
            } catch (e) {
              newContents[alt.file] = "Error loading content.";
            }
          }
        }
        setLoadedContents(newContents);
      }
    } catch (e) {
      console.error("Failed to load alternatives", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mb="xl" pos="relative">
      <BlockWithDiscussion blockId={block.id}>
        <Group align="flex-start" wrap="nowrap">
          <Box style={{ flexGrow: 1 }}>
            <TypographyStylesProvider>
              <ReactMarkdown>{block.content}</ReactMarkdown>
            </TypographyStylesProvider>
          </Box>

          {block.alternativesCount > 1 && (
            <Box mt="xs" ml="sm" style={{ flexShrink: 0 }}>
              <Badge
                variant="light"
                color="blue"
                style={{ cursor: 'pointer', textTransform: 'none' }}
                onClick={handleOpenAlternatives}
                leftSection={<IconLayersLinked size={12} />}
                title="View alternatives"
              >
                +{block.alternativesCount - 1}
              </Badge>
            </Box>
          )}
        </Group>
      </BlockWithDiscussion>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Text fw={500}>Alternatives ({block.alternativesCount})</Text>}
        position="right"
        size="md"
        padding="md"
      >
        {loading && Object.keys(loadedContents).length === 0 ? (
          <Text c="dimmed">Loading alternatives...</Text>
        ) : (
          <Stack>
            {alternativesData.length > 0 ? (
              alternativesData.map((alt, idx) => (
                <Paper key={idx} p="md" shadow="sm" withBorder>
                  <Group justify="space-between" mb="md">
                    <Badge color={idx === 0 ? "green" : "gray"} variant={idx === 0 ? "filled" : "light"}>
                      {alt.votes} votes
                    </Badge>
                    {alt.source?.url && (
                      <Anchor href={alt.source.url} target="_blank" size="sm" c="blue">
                        <Group gap={4}>
                          Source <IconExternalLink size={14} />
                        </Group>
                      </Anchor>
                    )}
                  </Group>
                  <TypographyStylesProvider>
                    <ReactMarkdown>{loadedContents[alt.file] || "Loading..."}</ReactMarkdown>
                  </TypographyStylesProvider>
                </Paper>
              ))
            ) : (
              <Text c="dimmed">Detailed alternative data not available (manifest missing or invalid).</Text>
            )}
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}
