'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useSocket from '../components/useSocket';
import AverageDisplay from '@/components/AverageDisplay';
import CardSelector from '../components/CardSelector';
import NewSessionButton from '@/components/NewSessionButton';
import RevealButton from '@/components/RevealButton';
import VotesDisplay from '@/components/VotesDisplay';
import { User } from '@/utils/types';

interface VoteData {
  userId: string;
  vote: number;
}

const Home = () => {
  const socket = useSocket(); // hook to use WebSocket
  const [users, setUsers] = useState<User[]>([
    // { id: '1', name: 'Colleague 1', vote: null },
    // { id: '2', name: 'Colleague 2', vote: null },
  ]);
  const [votesRevealed, setVotesRevealed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); //local user ID state

  // generate or retrieve the user ID from localStorage
  useEffect(() => {
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = uuidv4(); // generate a new uuid if none exists
      localStorage.setItem('userId', storedUserId); // save the new userId to localStorage
    }
    setUserId(storedUserId); // Set the userId state
  }, []);

  useEffect(() => {
    // listen for vote updates from the server
    if (socket) {
      socket.on('voteUpdate', (data: VoteData) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === data.userId ? { ...user, vote: data.vote } : user
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('voteUpdate'); // Cleanup the event listener
      }
    };
  }, [socket]);

  // handle a vote being cast
  // const handleVote = (userId: string, value: number) => {
  //   if (socket) {
  //     // emit the vote event to the server
  //     socket.emit('vote', { userId, vote: value });
  //   }
  // };

  const handleVote = (value: number) => {
    if (userId) {
      console.log(`Sending vote from userId: ${userId}, vote: ${value}`);
      socket?.emit('vote', { userId, vote: value });
    } else {
      console.log('No userId found');
    }
  };

  // reveal the votes
  // const revealVotes = () => setVotesRevealed(true);
  const revealVotes = () => {
    socket?.emit('revealVotes');
  };

  // start a new voting session
  const startNewSession = () => {
    setUsers((prevUsers) => prevUsers.map((user) => ({ ...user, vote: null })));
    setVotesRevealed(false);
  };

  return (
    <div>
      <VotesDisplay users={users} votesRevealed={votesRevealed} />
      <CardSelector onVote={handleVote} />
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
