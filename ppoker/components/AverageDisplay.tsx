const AverageDisplay = ({ users }: { users: User[] }) => {
  const totalVotes = users.reduce((sum, user) => sum + (user.vote ?? 0), 0);
  const voteCount = users.filter((user) => user.vote !== null).length;
  const average = voteCount ? totalVotes / voteCount : 0;

  return <div>Average: {average.toFixed(2)}</div>;
};

export default AverageDisplay;
