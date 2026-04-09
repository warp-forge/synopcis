export interface Commit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface DiffResult {
  diff: string;
}
