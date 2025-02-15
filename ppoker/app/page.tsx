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
  const joinSession = (
    sessionId: string,
    userName: string,
    role: 'Dev' | 'QA',
    setLoading: (loading: boolean) => void
  ) => {
    if (!localStorage.getItem('userName')) {
      localStorage.setItem('userName', userName);
    }
    setUserName(userName);

    console.log('Joining session with:', { sessionId, userName, role });

    socket?.emit(
      'createSession',
      { sessionId, userName, role },
      (response: { userId: string; session: Session }) => {
        console.log("Response from 'createSession' event:", response);

        try {
          if (response && response.session && response.userId) {
            setUserId(response.userId);
            setSessionId(response.session.sessionId);
            setUsers(response.session.users);
          } else {
            throw new Error('Response data missing.');
          }
        } catch (error) {
          console.error('Failed to join session:', error);
        } finally {
          setLoading(false); // stop spinner in any case (success or failure)
        }
      }
    );
  };

  useEffect(() => {
    // listen for vote updates from the server
    if (socket) {
      const handleVoteUpdate = (data: { users: User[] }) => {
        console.log('Updated users from server:', data.users);
        setUsers(data.users); // update the entire list of users with hasVoted statuses
      };

      const handleSessionUpdate = (data: SessionUpdateData) => {
        setUsers(data.users);
        setVotesRevealed(data.votesRevealed);
        setErrorMessage(null);
      };

      // clear the Reveal Votes error message
      const handleClearRevealError = () => {
        setErrorMessage(null); //reset the error message for all clients
      };

      // register socket event listeners
      socket.on('voteUpdate', handleVoteUpdate);
      socket.on('sessionUpdate', handleSessionUpdate);
      socket.on('clearRevealError', handleClearRevealError);
      socket.on('sessionEnded', () => {
        resetClientState();
      });

      // clean up listeners on component unmount
      return () => {
        socket.off('voteUpdate', handleVoteUpdate);
        socket.off('sessionUpdate', handleSessionUpdate);
        socket.off('clearRevealError', handleClearRevealError);
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
      setErrorMessage('At least one user must vote to enable reveal');
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
