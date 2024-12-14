'use client';

import { useState } from 'react';

interface SessionFormProps {
  onJoinSession: (sessionId: string, userName: string) => void;
}

const SessionForm = ({ onJoinSession }: SessionFormProps) => {
  const [sessionId, setSessionId] = useState('');
  const [userName, setUserName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoinSession(sessionId, userName);
  };

  return (
    <form className='form-container' onSubmit={handleSubmit}>
      <input
        className='form-input'
        type='text'
        placeholder='Session ID'
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        required
      />

      <input
        className='form-input'
        type='text'
        placeholder='Your Name'
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
      />
      <button className='action-button' type='submit'>
        {' '}
        Join Session
      </button>
    </form>
  );
};

export default SessionForm;
