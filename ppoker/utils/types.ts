// User-related types
export type User = {
  id: string;
  name: string;
  vote: number | null;
};

// Session-related types
export interface Session {
  id: string;
  users: User[];
  votesRevealed: boolean;
}

// Event data types
export interface VoteData {
  userId: string;
  vote: number;
}

export interface SessionUpdateData {
  users: User[];
  votesRevealed: boolean;
}
