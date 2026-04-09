'use client';

import React, { useState } from 'react';
import { CardProperty } from '@/types/phenomenon';
import { Card, Table, Text, Anchor, Group, ActionIcon, Tooltip, Modal, TextInput, Button, Stack } from '@mantine/core';
import { IconEdit, IconThumbUp, IconPlus } from '@tabler/icons-react';

interface PhenomenonCardProps {
  properties: CardProperty[];
}

export default function PhenomenonCard({ properties: initialProperties }: PhenomenonCardProps) {
  const [properties, setProperties] = useState<CardProperty[]>(initialProperties || []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [propText, setPropText] = useState('');
  const [propSlug, setPropSlug] = useState('');
  const [valText, setValText] = useState('');
  const [valSlug, setValSlug] = useState('');

  if (!properties || properties.length === 0) return null;

  const handleVote = (index: number) => {
    // Implement API call to handle vote
    console.log(`Voted for property at index ${index}`);
  };

  const handleEditClick = (index: number) => {
    const prop = properties[index];
    setPropText(prop.property.text);
    setPropSlug(prop.property.slug);
    setValText(prop.value.text);
    setValSlug(prop.value.slug);
    setEditingIndex(index);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const updatedProps = [...properties];
      updatedProps[editingIndex] = {
        property: { text: propText, slug: propSlug },
        value: { text: valText, slug: valSlug }
      };
      setProperties(updatedProps);
      setIsEditModalOpen(false);
    }
  };

  const handleAddClick = () => {
    setPropText('');
    setPropSlug('');
    setValText('');
    setValSlug('');
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = () => {
    setProperties([...properties, {
        property: { text: propText, slug: propSlug },
        value: { text: valText, slug: valSlug }
    }]);
    setIsAddModalOpen(false);
  };

  return (
    <>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Text fw={500}>Phenomenon Data</Text>
            <Tooltip label="Add Property">
              <ActionIcon aria-label="Add Property" variant="subtle" color="blue" onClick={handleAddClick}>
                <IconPlus size="1rem" />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Card.Section>

        <Table striped highlightOnHover>
          <Table.Tbody>
            {properties.map((prop, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>
                  <Text fw={500} size="sm">
                    {prop.property.text}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Anchor href={`/phenomena/${prop.value.slug}`} size="sm">
                    {prop.value.text}
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end" gap="xs">
                    <Tooltip label="Vote">
                      <ActionIcon aria-label="Vote" variant="subtle" color="green" onClick={() => handleVote(idx)}>
                        <IconThumbUp size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Propose Alternative">
                      <ActionIcon aria-label="Propose Alternative" variant="subtle" color="blue" onClick={() => handleEditClick(idx)}>
                        <IconEdit size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Propose Alternative">
        <Stack gap="md">
          <TextInput label="Property Text" value={propText} onChange={(e) => setPropText(e.currentTarget.value)} />
          <TextInput label="Property Slug" value={propSlug} onChange={(e) => setPropSlug(e.currentTarget.value)} />
          <TextInput label="Value Text" value={valText} onChange={(e) => setValText(e.currentTarget.value)} />
          <TextInput label="Value Slug" value={valSlug} onChange={(e) => setValSlug(e.currentTarget.value)} />
          <Button onClick={handleSaveEdit}>Propose</Button>
        </Stack>
      </Modal>

      <Modal opened={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Property">
        <Stack gap="md">
          <TextInput label="Property Text" value={propText} onChange={(e) => setPropText(e.currentTarget.value)} />
          <TextInput label="Property Slug" value={propSlug} onChange={(e) => setPropSlug(e.currentTarget.value)} />
          <TextInput label="Value Text" value={valText} onChange={(e) => setValText(e.currentTarget.value)} />
          <TextInput label="Value Slug" value={valSlug} onChange={(e) => setValSlug(e.currentTarget.value)} />
          <Button onClick={handleSaveAdd}>Add</Button>
        </Stack>
      </Modal>
    </>
  );
}
