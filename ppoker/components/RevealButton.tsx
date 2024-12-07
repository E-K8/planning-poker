const RevealButton = ({ onReveal }: { onReveal: () => void }) => {
  return (
    <button className='action-button reveal' onClick={onReveal}>
      Reveal Votes
    </button>
  );
};

export default RevealButton;
