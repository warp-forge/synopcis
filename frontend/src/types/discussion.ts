export interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  blockId: string;
  author: CommentAuthor;
  text: string;
  createdAt: string;
  parentId?: string;
  children?: Comment[];
}

export interface DiscussionState {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
}
