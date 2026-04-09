import React from 'react';
import { Container } from '@mantine/core';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Container>{children}</Container>;
}
