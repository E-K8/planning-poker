import { User } from '@/utils/types';

const VotesDisplay = ({
  users,
  votesRevealed,
}: {
  users: User[];
  votesRevealed: boolean;
}) => {
  return (
    <div className='votes-display-container'>
      {users.map((user) => (
        <div key={user.id}>
          <span>{`${user.name || user.id}:`}</span>
          {votesRevealed ? (
            <span className='vote-revealed'>
              {user.vote !== null ? user.vote : '?'}
            </span> //show vote if revealed
          ) : (
            <span>{user.hasVoted ? '✔️' : '?'} </span> // show checkmark if user has voted
          )}
        </div>
      ))}
    </div>
  );
};

export default VotesDisplay;
