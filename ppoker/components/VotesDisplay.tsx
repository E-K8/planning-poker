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
          <span>{`${user.name || user.id}:`}</span>
          {votesRevealed ? (
            <span>{user.vote !== null ? user.vote : '?'}</span> //show vote if revealed
          ) : (
            <span>{user.hasVoted ? '✔️' : '?'} </span> // show checkmark if user has voted
          )}
        </div>
      ))}
    </div>
  );
};

export default VotesDisplay;
