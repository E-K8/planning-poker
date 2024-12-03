const RevealButton = ({ onReveal }: { onReveal: () => void }) => {
  return (
    <button className='dark-blue' onClick={onReveal}>
      Reveal Votes
    </button>
  );
};

export default RevealButton;
