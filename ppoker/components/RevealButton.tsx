const RevealButton = ({ onReveal }: { onReveal: () => void }) => {
  return <button onClick={onReveal}>Reveal Votes</button>;
};

export default RevealButton;
