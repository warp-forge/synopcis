import React, { useState, useEffect } from 'react';
import { Modal, Text, Loader, Stack, Group, Checkbox, Button, Paper, ScrollArea, Divider } from '@mantine/core';
import { Commit, DiffResult } from '@/types/history';

interface BlockHistoryModalProps {
  opened: boolean;
  onClose: () => void;
  file: string; // The file path or identifier for the block
}

export default function BlockHistoryModal({ opened, onClose, file }: BlockHistoryModalProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [diff, setDiff] = useState<string | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  useEffect(() => {
    if (opened && file) {
      fetchHistory();
    } else {
      // Reset state when closed
      setCommits([]);
      setSelectedCommits([]);
      setDiff(null);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, file]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/git/history?file=${encodeURIComponent(file)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await res.json();
      setCommits(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommit = (hash: string) => {
    if (selectedCommits.includes(hash)) {
      setSelectedCommits(selectedCommits.filter((h) => h !== hash));
      setDiff(null); // Clear diff if selection changes
    } else {
      if (selectedCommits.length < 2) {
        setSelectedCommits([...selectedCommits, hash]);
      } else {
        // Replace the second selection
        setSelectedCommits([selectedCommits[0], hash]);
      }
      setDiff(null); // Clear diff if selection changes
    }
  };

  const handleCompare = async () => {
    if (selectedCommits.length !== 2) return;

    setLoadingDiff(true);
    try {
      // Sort so older commit is first (assuming list is newest first)
      const commit1 = selectedCommits[1];
      const commit2 = selectedCommits[0];

      const res = await fetch(
        `/api/git/diff?file=${encodeURIComponent(file)}&commit1=${commit1}&commit2=${commit2}`
      );
      if (!res.ok) {
        throw new Error('Failed to fetch diff');
      }
      const data: DiffResult = await res.json();
      setDiff(data.diff);
    } catch (err: any) {
      setError(err.message || 'Failed to load comparison.');
    } finally {
      setLoadingDiff(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Block History" size="lg" scrollAreaComponent={ScrollArea.Autosize}>
      {loading ? (
        <Group justify="center" p="xl">
          <Loader />
        </Group>
      ) : error ? (
        <Text c="red">{error}</Text>
      ) : (
        <Stack>
          <Text size="sm" c="dimmed" mb="xs">
            Select up to two commits to compare them.
          </Text>
          <Stack gap="xs">
            {commits.map((commit) => (
              <Paper key={commit.hash} p="sm" withBorder>
                <Group wrap="nowrap" align="flex-start">
                  <Checkbox
                    mt={4}
                    checked={selectedCommits.includes(commit.hash)}
                    onChange={() => handleSelectCommit(commit.hash)}
                    disabled={!selectedCommits.includes(commit.hash) && selectedCommits.length >= 2}
                    aria-label={`Select commit ${commit.hash}`}
                  />
                  <div>
                    <Group justify="space-between" mb={4}>
                      <Text fw={500} size="sm">{commit.message}</Text>
                      <Text size="xs" c="dimmed">
                        {new Date(commit.date).toLocaleString()}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">
                        By {commit.author}
                      </Text>
                      <Text size="xs" ff="monospace" c="dimmed">
                        {commit.hash.substring(0, 8)}
                      </Text>
                    </Group>
                  </div>
                </Group>
              </Paper>
            ))}
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button
              onClick={handleCompare}
              disabled={selectedCommits.length !== 2 || loadingDiff}
              loading={loadingDiff}
            >
              Compare Selected
            </Button>
          </Group>

          {diff && (
            <>
              <Divider my="sm" />
              <Text fw={500} mb="xs">Difference:</Text>
              <Paper p="sm" withBorder bg="gray.0">
                <Text component="pre" size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {diff.split('\n').map((line, index) => {
                    let color = 'inherit';
                    let bgColor = 'transparent';
                    if (line.startsWith('+')) {
                      color = 'green';
                      bgColor = 'var(--mantine-color-green-0)';
                    } else if (line.startsWith('-')) {
                      color = 'red';
                      bgColor = 'var(--mantine-color-red-0)';
                    } else if (line.startsWith('@@')) {
                      color = 'dimmed';
                    }
                    return (
                      <div key={index} style={{ color: color !== 'inherit' && color !== 'dimmed' ? `var(--mantine-color-${color}-filled)` : (color === 'dimmed' ? 'var(--mantine-color-dimmed)' : 'inherit'), backgroundColor: bgColor, padding: '0 4px' }}>
                        {line}
                      </div>
                    );
                  })}
                </Text>
              </Paper>
            </>
          )}
        </Stack>
      )}
    </Modal>
  );
}
