'use client';
import React, { useState } from 'react';
import { Button, Modal, Stack, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AlternativeView from '../molecules/AlternativeView';
import { AlternativeWithContent } from '@/types/phenomenon';

interface BlockAlternativesProps {
  blockId: string;
  slug: string;
  alternatives: AlternativeWithContent[];
  winningAlternativeFile: string;
}

export default function BlockAlternatives({ blockId, slug, alternatives, winningAlternativeFile }: BlockAlternativesProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [proposeOpened, { open: openPropose, close: closePropose }] = useDisclosure(false);
  const [newContent, setNewContent] = useState('');

  const [currentAlternatives, setCurrentAlternatives] = useState<AlternativeWithContent[]>(alternatives);

  const handleVote = async (alternativeFile: string) => {
    try {
      const response = await fetch(`/api/phenomena/${slug}/blocks/${blockId}/alternatives/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alternativeFile })
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      // Optimistically update the UI
      setCurrentAlternatives(prev => prev.map(a => {
        if (a.alternative.file === alternativeFile) {
          return {
            ...a,
            alternative: {
              ...a.alternative,
              votes: a.alternative.votes + 1
            }
          };
        }
        return a;
      }));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handlePropose = async () => {
    try {
      const response = await fetch(`/api/phenomena/${slug}/blocks/${blockId}/alternatives/propose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });

      if (!response.ok) {
        throw new Error('Failed to propose alternative');
      }

      const data = await response.json();
      setCurrentAlternatives(prev => [...prev, data.alternative]);
      closePropose();
      setNewContent('');
    } catch (error) {
      console.error('Error proposing alternative:', error);
    }
  };

  return (
    <div>
      <Button variant="subtle" size="xs" onClick={open}>
        View Alternatives ({currentAlternatives.length})
      </Button>

      <Modal opened={opened} onClose={close} title={`Alternatives for Block ${blockId}`} size="lg">
        <Stack>
          <Button onClick={openPropose} variant="outline">Propose New Alternative</Button>
          {currentAlternatives.map(({ alternative, content }) => (
            <AlternativeView
              key={alternative.file}
              alternative={alternative}
              content={content}
              onVote={handleVote}
              isWinning={alternative.file === winningAlternativeFile}
            />
          ))}
        </Stack>
      </Modal>

      <Modal opened={proposeOpened} onClose={closePropose} title={`Propose New Alternative for Block ${blockId}`}>
        <Stack>
          <Textarea
            label="Content"
            placeholder="Enter your proposed content in Markdown"
            value={newContent}
            onChange={(event) => setNewContent(event.currentTarget.value)}
            minRows={4}
          />
          <Button onClick={handlePropose} disabled={!newContent.trim()}>Submit Proposal</Button>
        </Stack>
      </Modal>
    </div>
  );
}
