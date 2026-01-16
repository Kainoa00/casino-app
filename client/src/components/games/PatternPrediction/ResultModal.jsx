export default function ResultModal({ result, onPlayAgain, onBackToMenu }) {
  const { correct, payout, newBalance, guessType, answer } = result;

  return (
    <div className="card text-center animate-slide-up">
      <div className={`text-6xl mb-4 ${correct ? 'animate-bounce' : ''}`}>
        {correct ? '🎉' : '😔'}
      </div>

      <h2 className={`text-3xl font-bold mb-2 ${correct ? 'text-casino-green' : 'text-casino-accent'}`}>
        {correct ? 'You Won!' : 'Not This Time'}
      </h2>

      <p className="text-gray-400 mb-4">
        {correct
          ? `Your ${guessType} prediction was correct!`
          : `The answer was different. Better luck next time!`
        }
      </p>

      {correct && (
        <div className="bg-casino-gold/20 rounded-lg p-4 mb-6 inline-block">
          <span className="text-casino-gold text-3xl font-bold">
            +{payout.toLocaleString()} coins
          </span>
        </div>
      )}

      <div className="text-gray-400 mb-6">
        New Balance: <span className="text-white font-bold">{newBalance.toLocaleString()} coins</span>
      </div>

      <div className="flex gap-4 justify-center">
        <button onClick={onPlayAgain} className="btn-primary">
          Play Again
        </button>
        <button onClick={onBackToMenu} className="btn-secondary">
          Back to Menu
        </button>
      </div>
    </div>
  );
}
