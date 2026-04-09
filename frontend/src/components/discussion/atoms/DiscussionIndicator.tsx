'use client';

import React from 'react';
import { ActionIcon, Indicator, Tooltip } from '@mantine/core';

// We don't have Tabler icons installed but let's use a simple SVG icon for Message
const MessageCircleIcon = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

interface DiscussionIndicatorProps {
  count: number;
  onClick: () => void;
}

export default function DiscussionIndicator({
  count,
  onClick,
}: DiscussionIndicatorProps) {
  return (
    <Tooltip label="Discussions">
      <Indicator label={count} size={16} disabled={count === 0} color="blue">
        <ActionIcon variant="subtle" onClick={onClick} aria-label="Open Discussions">
          <MessageCircleIcon />
        </ActionIcon>
      </Indicator>
    </Tooltip>
  );
}
