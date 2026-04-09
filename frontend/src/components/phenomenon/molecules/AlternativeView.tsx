import React from 'react';
import { Group, Button, Text, Paper, Badge } from '@mantine/core';
import { Alternative } from '@/types/phenomenon';
import ReactMarkdown from 'react-markdown';

interface AlternativeViewProps {
  alternative: Alternative;
  content: string;
  onVote: (alternativeId: string) => void;
  isWinning?: boolean;
}

export default function AlternativeView({
  alternative,
  content,
  onVote,
  isWinning = false,
}: AlternativeViewProps) {
  return (
    <Paper shadow="xs" p="md" withBorder style={{ marginBottom: '1rem', borderColor: isWinning ? 'green' : undefined }}>
      <Group justify="space-between" mb="sm">
        <Group>
           {isWinning && <Badge color="green">Winning</Badge>}
           <Text size="sm" c="dimmed">Trust Score: {alternative.trust_score}</Text>
        </Group>
        <Button variant="light" size="xs" onClick={() => onVote(alternative.file)}>
          Vote ({alternative.votes})
        </Button>
      </Group>
      <div>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </Paper>
  );
}
