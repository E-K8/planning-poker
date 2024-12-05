const CardSelector = ({ onVote }: { onVote: (value: number) => void }) => {
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  return (
    <div className='card-container'>
      {values.map((value) => (
        <button
          className='card-button'
          key={value}
          onClick={() => onVote(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
};

export default CardSelector;
