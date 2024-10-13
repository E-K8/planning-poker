'use client';

import { useState } from 'react';
import AverageDisplay from '@/components/AverageDisplay';
import CardSelector from '../components/CardSelector';
import NewSessionButton from '@/components/NewSessionButton';
import RevealButton from '@/components/RevealButton';
import VotesDisplay from '@/components/VotesDisplay';
import { User } from '@/utils/types';

const Home = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Colleague 1', vote: null },
    { id: '2', name: 'Colleague 2', vote: null },
  ]);

  const [votesRevealed, setVotesRevealed] = useState(false);

  // handle a vote being cast
  const handleVote = (userId: string, value: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, vote: value } : user
      )
    );
  };

  // reveal the votes
  const revealVotes = () => setVotesRevealed(true);

  // // start a new voting session
  // const startNewSession = () => {
  //   setUsers((prevUsers) => prevUsers.map((user) => ({ ...user, vote: null })));
  //   setVotesRevealed(false);
  // };

  return (
    // <p>
    //   Palette to use: palette to consider: #073b4c #118ab2 #06d6a0 #ffd166
    //   #ef476f
    // </p>
    // <p className='blue'>blue</p>
    // <p className='green'>green</p>
    // <p className='yellow'>yellow</p>
    // <p className='red'>red</p>
    <div>
      <VotesDisplay users={users} votesRevealed={votesRevealed} />
      <CardSelector onVote={(value) => handleVote('1', value)} />
      <RevealButton onReveal={revealVotes} />
      <AverageDisplay users={users} />
      {/* <NewSessionButton onNewSession={startNewSession} /> */}
    </div>
  );
};

export default Home;
