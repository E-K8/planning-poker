import { User } from '@/utils/types';

const AverageDisplay = ({ users }: { users: User[] }) => {
  // filter votes by role
  const devVotes = users.filter(
    (user) => user.role === 'Dev' && user.vote !== null
  );
  const qaVotes = users.filter(
    (user) => user.role === 'QA' && user.vote !== null
  );

  const devAverage =
    devVotes.length > 0
      ? devVotes.reduce((sum, user) => sum + (user.vote ?? 0), 0) /
        devVotes.length
      : 0;

  const qaAverage =
    qaVotes.length > 0
      ? qaVotes.reduce((sum, user) => sum + (user.vote ?? 0), 0) /
        qaVotes.length
      : 0;

  return (
    <div className='average-container'>
      <h2 className='average-title'>Results:</h2>
      <p className='average-value'>Dev Average: {devAverage.toFixed(2)}</p>
      <p className='average-value'>QA Average: {qaAverage.toFixed(2)}</p>
    </div>
  );
};

export default AverageDisplay;
