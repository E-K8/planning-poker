const NewSessionButton = ({ onNewSession }: { onNewSession: () => void }) => {
  return <button onClick={onNewSession}>Start New Session</button>;
};

export default NewSessionButton;
