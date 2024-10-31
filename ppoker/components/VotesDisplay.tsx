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
        <div
          key={user.id}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>{user.name || user.id}</span>
          {user.hasVoted && <span>✔️</span>}: {votesRevealed ? user.vote : '?'}
        </div>
      ))}
    </div>
  );
};

export default VotesDisplay;
