import { User } from '@/utils/types';

const AverageDisplay = ({ users }: { users: User[] }) => {
  const totalVotes = users.reduce((sum, user) => sum + (user.vote ?? 0), 0);
  const voteCount = users.filter((user) => user.vote !== null).length;
  const average = voteCount ? totalVotes / voteCount : 0;

  return (
    <div className='average-container'>
      <h2 className='average-title'>Average:</h2>
      <p className='average-value'>{average.toFixed(2)}</p>
    </div>
  );
};

export default AverageDisplay;
