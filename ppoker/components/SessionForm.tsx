'use client';

import { useState } from 'react';

interface SessionFormProps {
  onJoinSession: (
    sessionId: string,
    userName: string,
    role: 'Dev' | 'QA'
  ) => void;
}

const SessionForm = ({ onJoinSession }: SessionFormProps) => {
  const [sessionId, setSessionId] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState<string>(''); // initially empty

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoinSession(sessionId, userName, role as 'Dev' | 'QA');
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

      <select
        className='form-input'
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      >
        <option value='' disabled>
          Your role
        </option>
        <option value='Dev'>Dev</option>
        <option value='QA'>QA</option>
      </select>

      <button className='action-button' type='submit'>
        Join Session
      </button>
    </form>
  );
};

export default SessionForm;
