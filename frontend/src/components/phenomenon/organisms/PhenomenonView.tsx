import React from 'react';
import { RenderablePhenomenon } from '@/types/phenomenon';
import ReactMarkdown from 'react-markdown';
import BlockAlternatives from './BlockAlternatives';
import { Paper } from '@mantine/core';

export default function PhenomenonView({ phenomenon }: { phenomenon: RenderablePhenomenon }) {
  return (
    <div>
      {phenomenon.blocks.map((block) => (
        <Paper key={block.id} p="md" mb="md" withBorder style={{ position: 'relative' }}>
          <ReactMarkdown>{block.content}</ReactMarkdown>

          <div style={{ position: 'absolute', top: 5, right: 5 }}>
             {block.alternativesCount > 0 && (
              <BlockAlternatives
                blockId={block.id}
                alternatives={block.alternatives || []}
                winningAlternativeFile={block.winningAlternativeFile || ""}
              />
            )}
          </div>
        </Paper>
      ))}
    </div>
  );
}
