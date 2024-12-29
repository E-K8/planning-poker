import { User } from '@/utils/types';

const VotesDisplay = ({
  users,
  votesRevealed,
}: {
  users: User[];
  votesRevealed: boolean;
}) => {
  const devUsers = users.filter((user) => user.role === 'Dev');
  const qaUsers = users.filter((user) => user.role === 'QA');

  return (
    <div className='votes-display-container'>
      <div className='role-column'>
        <h3>Devs</h3>
        {devUsers.map((user) => (
          <div key={user.id}>
            <span> {`${user.name} (${user.role}) : `}</span>
            {votesRevealed ? (
              <span className='vote-revealed'>
                {user.vote !== null ? user.vote : '?'}
              </span>
            ) : (
              <span>{user.hasVoted ? '✔️' : '?'}</span>
            )}
          </div>
        ))}
      </div>

      <div className='role-column'>
        <h3>QAs</h3>
        {qaUsers.map((user) => (
          <div key={user.id}>
            <span> {`${user.name} (${user.role}) : `}</span>
            {votesRevealed ? (
              <span className='vote-revealed'>
                {user.vote !== null ? user.vote : '?'}
              </span>
            ) : (
              <span>{user.hasVoted ? '✔️' : '?'}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VotesDisplay;
