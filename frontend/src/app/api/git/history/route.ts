import { NextResponse } from 'next/server';
import { Commit } from '@/types/history';

const mockCommits: Commit[] = [
  {
    hash: 'a1b2c3d4',
    author: 'Alice Smith',
    date: '2023-10-25T14:30:00Z',
    message: 'Update definition to include recent findings',
  },
  {
    hash: 'f5e4d3c2',
    author: 'Bob Jones',
    date: '2023-10-20T09:15:00Z',
    message: 'Fix typo in introductory paragraph',
  },
  {
    hash: '8a7b6c5d',
    author: 'Charlie Brown',
    date: '2023-10-15T11:00:00Z',
    message: 'Initial draft of the phenomenon block',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file) {
    return NextResponse.json({ error: 'File parameter is required' }, { status: 400 });
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockCommits);
}
