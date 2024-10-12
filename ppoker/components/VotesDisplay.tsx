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
          {user.name}: {votesRevealed ? user.vote : '?'}
        </div>
      ))}
    </div>
  );
};

export default VotesDisplay;
