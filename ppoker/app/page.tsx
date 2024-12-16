'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useSocket from '../components/useSocket';
import SessionForm from '@/components/SessionForm';
import AverageDisplay from '@/components/AverageDisplay';
import CardSelector from '../components/CardSelector';
import RevealButton from '@/components/RevealButton';
import VotesDisplay from '@/components/VotesDisplay';
import { User, SessionUpdateData, Session } from '@/utils/types';

const Home = () => {
  const socket = useSocket(); // hook to use WebSocket
  const [users, setUsers] = useState<User[]>([]);
  const [votesRevealed, setVotesRevealed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); //local user ID state
  const [userName, setUserName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null); // session ID state

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
    }
  }, []);

  // function to join a session
  const joinSession = (sessionId: string, userName: string) => {
    if (!localStorage.getItem('userName')) {
      localStorage.setItem('userName', userName);
    }
    setUserName(userName);

    socket?.emit(
      'createSession',
      { sessionId, userName },
      (response: { userId: string; session: Session }) => {
        console.log("Response from 'createSession' event:", response);

        if (response && response.session && response.userId) {
          setUserId(response.userId);
          setSessionId(response.session.sessionId);
          setUsers(response.session.users);
        } else {
          console.log('Failed to join session. Response data missing.');
        }
      }
    );
  };

  useEffect(() => {
    // listen for vote updates from the server
    if (socket) {
      const handleVoteUpdate = (data: { users: User[] }) => {
        setUsers(data.users); // update the entire list of users with hasVoted statuses
      };

      const handleSessionUpdate = (data: SessionUpdateData) => {
        setUsers(data.users);
        setVotesRevealed(data.votesRevealed);
      };

      // register event listeners
      socket.on('voteUpdate', handleVoteUpdate);
      socket.on('sessionUpdate', handleSessionUpdate);
      socket.on('sessionEnded', () => {
        resetClientState();
      });

      // clean up listeners on unmount
      return () => {
        socket.off('voteUpdate', handleVoteUpdate);
        socket.off('sessionUpdate', handleSessionUpdate);
        socket.off('sessionEnded');
      };
    }
  }, [socket]);

  const handleVote = (value: number) => {
    if (userId && userName && sessionId) {
      console.log(
        `Sending vote from user: ${userName} with userId: ${userId}, vote: ${value}, sessionId: ${sessionId}`
      );
      socket?.emit('vote', { name: userName, sessionId, userId, vote: value });
    } else {
      console.log('No userId found');
    }
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // reveal the votes
  const revealVotes = () => {
    // check if any user has voted
    const hasVotes = users.some((user) => user.vote !== null);
    if (!hasVotes) {
      setErrorMessage(
        'Votes cannot be revealed until at least one user has voted'
      );
      return;
    }

    if (sessionId) {
      socket?.emit('revealVotes', sessionId);
      setErrorMessage(null);
    }
  };

  const resetVotes = () => {
    if (sessionId) {
      socket?.emit('resetVotes', sessionId); // reset within current session
    }
  };

  const endSession = () => {
    if (sessionId) {
      socket?.emit('endSession', sessionId);
      resetClientState();
    }
  };

  const resetClientState = () => {
    setSessionId(null);
    setUsers([]);
    setVotesRevealed(false);
  };

  return (
    <div className='container-outer'>
      <div className='container-inner'>
        {/* show the form if not in a session */}
        {!sessionId && <SessionForm onJoinSession={joinSession} />}
        {sessionId && (
          <>
            <VotesDisplay users={users} votesRevealed={votesRevealed} />
            <CardSelector onVote={handleVote} />
            <div className='container-buttons'>
              <RevealButton onReveal={revealVotes} />
              {errorMessage && <p className='error-message'>{errorMessage}</p>}
              <button className='action-button reset' onClick={resetVotes}>
                Reset Votes
              </button>
              <button className='action-button end' onClick={endSession}>
                End Session
              </button>
            </div>
            {votesRevealed && <AverageDisplay users={users} />}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
