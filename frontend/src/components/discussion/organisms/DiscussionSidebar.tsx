'use client';

import React, { useEffect, useState } from 'react';
import { Drawer, Loader, Text, Box, ScrollArea, Divider } from '@mantine/core';
import { Comment } from '@/types/discussion';
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from '@/app/phenomena/services/discussionApiService';
import CommentItem from './CommentItem';
import CommentForm from '../molecules/CommentForm';

interface DiscussionSidebarProps {
  blockId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentsCountChange?: (count: number) => void;
}

export default function DiscussionSidebar({
  blockId,
  isOpen,
  onClose,
  onCommentsCountChange,
}: DiscussionSidebarProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchComments(blockId);
      setComments(data);
      if (onCommentsCountChange) {
        onCommentsCountChange(data.length); // Top level count or total? Let's use top level for simple mock
      }
    } catch (err) {
      setError('Failed to load comments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, blockId]);

  const handleCreateComment = async (text: string) => {
    await createComment(blockId, text);
    await loadComments(); // Reload to get fresh tree
  };

  const handleReply = async (parentId: string, text: string) => {
    await createComment(blockId, text, parentId);
    await loadComments();
  };

  const handleEdit = async (commentId: string, text: string) => {
    await updateComment(commentId, text);
    await loadComments();
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    await loadComments();
  };

  return (
    <Drawer
      opened={isOpen}
      onClose={onClose}
      title={<Text fw={600}>Discussions for Block</Text>}
      position="right"
      size="md"
      padding="md"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Box mb="xl">
        <CommentForm onSubmit={handleCreateComment} />
      </Box>

      <Divider mb="md" />

      {isLoading ? (
        <Box display="flex" style={{ justifyContent: 'center' }} p="xl">
          <Loader size="md" />
        </Box>
      ) : error ? (
        <Text c="red" ta="center">
          {error}
        </Text>
      ) : comments.length === 0 ? (
        <Text c="dimmed" ta="center" mt="xl">
          No comments yet. Start the discussion!
        </Text>
      ) : (
        <Box>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}
    </Drawer>
  );
}
