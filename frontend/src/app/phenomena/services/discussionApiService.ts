import { Comment } from '@/types/discussion';

// Mock data
let mockComments: Comment[] = [
  {
    id: 'c1',
    blockId: 'b001-heading',
    author: {
      id: 'u1',
      name: 'Alice Scholar',
    },
    text: 'This is a great heading! Sets the context perfectly.',
    createdAt: new Date(Date.now() - 100000).toISOString(),
    children: [
      {
        id: 'c2',
        blockId: 'b001-heading',
        parentId: 'c1',
        author: {
          id: 'u2',
          name: 'Bob Peer',
        },
        text: 'I agree. Very concise.',
        createdAt: new Date(Date.now() - 50000).toISOString(),
      },
    ],
  },
  {
    id: 'c3',
    blockId: 'b001-heading',
    author: {
      id: 'u3',
      name: 'Charlie Critic',
    },
    text: 'Could we maybe use a different word here?',
    createdAt: new Date(Date.now() - 10000).toISOString(),
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchComments(blockId: string): Promise<Comment[]> {
  await delay(500); // Simulate network delay
  return mockComments.filter((c) => c.blockId === blockId);
}

export async function createComment(
  blockId: string,
  text: string,
  parentId?: string
): Promise<Comment> {
  await delay(300);

  const newComment: Comment = {
    id: Math.random().toString(36).substr(2, 9),
    blockId,
    text,
    parentId,
    author: {
      id: 'me',
      name: 'Current User', // Mocked user
    },
    createdAt: new Date().toISOString(),
    children: [],
  };

  if (parentId) {
    // Find parent and attach
    const appendChild = (commentsList: Comment[]): boolean => {
      for (const comment of commentsList) {
        if (comment.id === parentId) {
          if (!comment.children) comment.children = [];
          comment.children.push(newComment);
          return true;
        }
        if (comment.children && appendChild(comment.children)) {
          return true;
        }
      }
      return false;
    };
    appendChild(mockComments);
  } else {
    mockComments.push(newComment);
  }

  return newComment;
}

export async function updateComment(
  commentId: string,
  newText: string
): Promise<Comment | null> {
  await delay(300);

  let updatedComment: Comment | null = null;

  const updateInList = (commentsList: Comment[]) => {
    for (const comment of commentsList) {
      if (comment.id === commentId) {
        comment.text = newText;
        updatedComment = { ...comment };
        return;
      }
      if (comment.children) {
        updateInList(comment.children);
      }
    }
  };

  updateInList(mockComments);
  if (!updatedComment) {
    throw new Error('Comment not found');
  }

  return updatedComment;
}

export async function deleteComment(commentId: string): Promise<void> {
  await delay(300);

  const deleteFromList = (commentsList: Comment[]): boolean => {
    const index = commentsList.findIndex((c) => c.id === commentId);
    if (index !== -1) {
      commentsList.splice(index, 1);
      return true;
    }

    for (const comment of commentsList) {
      if (comment.children && deleteFromList(comment.children)) {
        return true;
      }
    }
    return false;
  };

  const deleted = deleteFromList(mockComments);
  if (!deleted) {
      throw new Error('Comment not found');
  }
}
