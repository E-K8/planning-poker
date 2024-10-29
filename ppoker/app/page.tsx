'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useSocket from '../components/useSocket';
import AverageDisplay from '@/components/AverageDisplay';
import CardSelector from '../components/CardSelector';
import NewSessionButton from '@/components/NewSessionButton';
import RevealButton from '@/components/RevealButton';
import VotesDisplay from '@/components/VotesDisplay';
import { User, VoteData, SessionUpdateData } from '@/utils/types';

const Home = () => {
  const socket = useSocket(); // hook to use WebSocket
  const [users, setUsers] = useState<User[]>([]);
  const [votesRevealed, setVotesRevealed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); //local user ID state
  const [userName, setUserName] = useState<string | null>(null);

  // generate or retrieve the user ID from localStorage
  useEffect(() => {
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = uuidv4(); // generate a new uuid if none exists
      localStorage.setItem('userId', storedUserId); // save the new userId to localStorage
    }
    setUserId(storedUserId); // Set the userId state

    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      // prompt user for their name on initial load if it doesn't exist
      const enteredName = prompt('Enter your name:');
      if (enteredName) {
        setUserName(enteredName);
        localStorage.setItem('userName', enteredName);
      }
    }
  }, []);

  useEffect(() => {
    // listen for vote updates from the server
    if (socket) {
      const handleVoteUpdate = (data: VoteData) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === data.userId ? { ...user, vote: data.vote } : user
          )
        );
      };

      const handleSessionUpdate = (data: SessionUpdateData) => {
        setUsers(data.users);
        setVotesRevealed(data.votesRevealed);
      };

      // register event listeners
      socket.on('voteUpdate', handleVoteUpdate);
      socket.on('sessionUpdate', handleSessionUpdate);

      // clean up listeners on unmount
      return () => {
        socket.off('voteUpdate', handleVoteUpdate);
        socket.off('sessionUpdate', handleSessionUpdate);
      };
    }
  }, [socket]);

  const handleVote = (value: number) => {
    if (userId && userName) {
      console.log(
        `Sending vote from user: ${userName} with userId: ${userId}, vote: ${value}`
      );
      socket?.emit('vote', { name: userName, userId, vote: value });
    } else {
      console.log('No userId found');
    }
  };

  // reveal the votes
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
