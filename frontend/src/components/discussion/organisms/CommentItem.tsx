'use client';

import React, { useState } from 'react';
import { Avatar, Group, Text, Box, Button, Stack } from '@mantine/core';
import { Comment } from '@/types/discussion';
import CommentForm from '../molecules/CommentForm';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, text: string) => Promise<void>;
  onEdit: (commentId: string, text: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  currentUserId?: string;
  depth?: number;
}

export default function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  currentUserId = 'me', // Default to 'me' for mock
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isAuthor = currentUserId === comment.author.id;

  const handleReplySubmit = async (text: string) => {
    await onReply(comment.id, text);
    setIsReplying(false);
  };

  const handleEditSubmit = async (text: string) => {
    await onEdit(comment.id, text);
    setIsEditing(false);
  };

  return (
    <Box pl={depth * 16} mt="sm" data-testid={`comment-${comment.id}`}>
      <Group align="flex-start" wrap="nowrap">
        <Avatar src={comment.author.avatarUrl} radius="xl" size="sm" />
        <Box style={{ flex: 1 }}>
          <Group gap="xs" align="center">
            <Text size="sm" fw={500}>
              {comment.author.name}
            </Text>
            <Text size="xs" c="dimmed">
              {new Date(comment.createdAt).toLocaleString()}
            </Text>
          </Group>

          {isEditing ? (
            <Box mt="xs">
              <CommentForm
                initialText={comment.text}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditing(false)}
                buttonLabel="Save"
              />
            </Box>
          ) : (
            <Text size="sm" mt="xs">
              {comment.text}
            </Text>
          )}

          {!isEditing && (
            <Group gap="xs" mt="xs">
              <Button variant="subtle" size="xs" onClick={() => setIsReplying(!isReplying)} data-testid={`reply-button-${comment.id}`}>
                <Text size="xs">Reply</Text>
              </Button>
              {isAuthor && (
                <>
                  <Button variant="subtle" size="xs" onClick={() => setIsEditing(true)} data-testid={`edit-button-${comment.id}`}>
                    <Text size="xs">Edit</Text>
                  </Button>
                  <Button variant="subtle" size="xs" color="red" onClick={() => onDelete(comment.id)} data-testid={`delete-button-${comment.id}`}>
                    <Text size="xs">Delete</Text>
                  </Button>
                </>
              )}
            </Group>
          )}

          {isReplying && (
            <Box mt="xs">
              <CommentForm
                onSubmit={handleReplySubmit}
                onCancel={() => setIsReplying(false)}
                placeholder="Write a reply..."
                buttonLabel="Reply"
              />
            </Box>
          )}
        </Box>
      </Group>

      {comment.children && comment.children.length > 0 && (
        <Stack gap="xs" mt="sm">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
