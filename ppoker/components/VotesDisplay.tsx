import { User } from '@/utils/types';

const VotesDisplay = ({
  users,
  votesRevealed,
}: {
  users: User[];
  votesRevealed: boolean;
}) => {
  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>
          {user.name || user.id}: {votesRevealed ? user.vote : '?'}
        </div>
      ))}
    </div>
  );
};

export default VotesDisplay;
