// User-related types
export type User = {
  id: string;
  name: string;
  vote: number | null;
  hasVoted: boolean;
};

// Session-related types
export interface Session {
  sessionId: string;
  users: User[];
  votesRevealed: boolean;
}

// Event data types
export interface SessionUpdateData {
  users: User[];
  votesRevealed: boolean;
}
