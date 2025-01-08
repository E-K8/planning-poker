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
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onJoinSession(sessionId, userName, role as 'Dev' | 'QA');
    } finally {
      setLoading(false);
    }
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
        disabled={loading}
      />

      <input
        className='form-input'
        type='text'
        placeholder='Your Name'
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
        disabled={loading}
      />

      <select
        className='form-input'
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
        disabled={loading}
      >
        <option value='' disabled>
          Your role
        </option>
        <option value='Dev'>Dev</option>
        <option value='QA'>QA</option>
      </select>

      <button className='action-button' type='submit' disabled={loading}>
        {loading ? <div className='spinner'></div> : 'Join Session'}
      </button>
    </form>
  );
};

export default SessionForm;
