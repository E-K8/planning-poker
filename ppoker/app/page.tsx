'use client';

import { useEffect, useState } from 'react';
import useSocket from '../components/useSocket';
import AverageDisplay from '@/components/AverageDisplay';
import CardSelector from '../components/CardSelector';
import NewSessionButton from '@/components/NewSessionButton';
import RevealButton from '@/components/RevealButton';
import VotesDisplay from '@/components/VotesDisplay';
import { User } from '@/utils/types';

const Home = () => {
  const socket = useSocket(); // hook to use WebSocket
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Colleague 1', vote: null },
    { id: '2', name: 'Colleague 2', vote: null },
  ]);

  const [votesRevealed, setVotesRevealed] = useState(false);

  useEffect(() => {
    // listen for vote updates from the server
    if (socket) {
      socket.on('voteUpdate', (data) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === data.userId ? { ...user, vote: data.vote } : user
          )
        );
      });
    }
  }, [socket]);

  // handle a vote being cast
  const handleVote = (userId: string, value: number) => {
    // emit the vote event to the server
    socket.emit('vote', { userId, vote: value });
  };

  // reveal the votes
  const revealVotes = () => setVotesRevealed(true);

  // start a new voting session
  const startNewSession = () => {
    setUsers((prevUsers) => prevUsers.map((user) => ({ ...user, vote: null })));
    setVotesRevealed(false);
  };

  return (
    // <p>
    <div>
      <VotesDisplay users={users} votesRevealed={votesRevealed} />
      <CardSelector onVote={(value) => handleVote('1', value)} />
      <RevealButton onReveal={revealVotes} />
      <AverageDisplay users={users} />
      <NewSessionButton onNewSession={startNewSession} />
      <p>Palette to consider: #073b4c #118ab2 #06d6a0 #ffd166 #ef476f</p>
      <p className='dark-blue'>dark blue</p>
      <p className='blue'>blue</p>
      <p className='green'>green</p>
      <p className='yellow'>yellow</p>
      <p className='red'>red</p>
    </div>
  );
};

export default Home;
