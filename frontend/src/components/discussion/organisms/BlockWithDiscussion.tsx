'use client';

import React, { useState } from 'react';
import { Box, Group } from '@mantine/core';
import DiscussionIndicator from '../atoms/DiscussionIndicator';
import DiscussionSidebar from './DiscussionSidebar';

interface BlockWithDiscussionProps {
  blockId: string;
  initialCommentsCount?: number;
  children: React.ReactNode;
}

export default function BlockWithDiscussion({
  blockId,
  initialCommentsCount = 0,
  children,
}: BlockWithDiscussionProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);

  return (
    <Box style={{ position: 'relative' }} mb="md">
      <Group align="flex-start" wrap="nowrap">
        {/* Render the actual block content */}
        <Box style={{ flex: 1 }}>{children}</Box>

        {/* Discussion Indicator */}
        <Box ml="sm">
          <DiscussionIndicator
            count={commentsCount}
            onClick={() => setIsSidebarOpen(true)}
          />
        </Box>
      </Group>

      {/* Discussion Sidebar */}
      <DiscussionSidebar
        blockId={blockId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCommentsCountChange={setCommentsCount}
      />
    </Box>
  );
}
