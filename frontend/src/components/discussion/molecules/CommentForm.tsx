'use client';

import React, { useState } from 'react';
import { Button, Group, Textarea } from '@mantine/core';

interface CommentFormProps {
  onSubmit: (text: string) => Promise<void>;
  onCancel?: () => void;
  initialText?: string;
  placeholder?: string;
  buttonLabel?: string;
}

export default function CommentForm({
  onSubmit,
  onCancel,
  initialText = '',
  placeholder = 'Write a comment...',
  buttonLabel = 'Submit',
}: CommentFormProps) {
  const [text, setText] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText('');
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Failed to submit comment', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        placeholder={placeholder}
        minRows={2}
        maxRows={6}
        autosize
        disabled={isSubmitting}
        data-testid="comment-textarea"
      />
      <Group mt="sm">
        {onCancel && (
          <Button variant="subtle" onClick={onCancel} disabled={isSubmitting} data-testid="cancel-comment-button">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!text.trim() || isSubmitting}
          data-testid="submit-comment-button"
        >
          {buttonLabel}
        </Button>
      </Group>
    </form>
  );
}
