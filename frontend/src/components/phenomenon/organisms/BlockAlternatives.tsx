'use client';
import React, { useState } from 'react';
import { Button, Modal, Stack, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AlternativeView from '../molecules/AlternativeView';
import { AlternativeWithContent } from '@/types/phenomenon';

interface BlockAlternativesProps {
  blockId: string;
  alternatives: AlternativeWithContent[];
  winningAlternativeFile: string;
}

export default function BlockAlternatives({ blockId, alternatives, winningAlternativeFile }: BlockAlternativesProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [proposeOpened, { open: openPropose, close: closePropose }] = useDisclosure(false);
  const [newContent, setNewContent] = useState('');

  const [currentAlternatives, setCurrentAlternatives] = useState<AlternativeWithContent[]>(alternatives);

  const handleVote = async (alternativeFile: string) => {
    // Simulated API call to vote for an alternative
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
  };

  const handlePropose = async () => {
    // Simulated API call to propose a new alternative
    const newAlternative: AlternativeWithContent = {
      content: newContent,
      alternative: {
        file: `proposed-${Date.now()}.md`,
        lang: 'en',
        votes: 1,
        source: null,
        trust_score: 0,
      }
    };
    setCurrentAlternatives(prev => [...prev, newAlternative]);
    closePropose();
    setNewContent('');
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
