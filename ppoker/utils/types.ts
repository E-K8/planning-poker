export type User = {
  id: string;
  name: string;
  vote: number | null;
};

export type Session = {
  id: string;
  users: User[];
  votesRevealed: boolean;
};
