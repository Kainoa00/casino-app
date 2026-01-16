import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';
import PatternDisplay from './PatternDisplay';
import BettingPanel from './BettingPanel';

export default function MultiplayerGame({ roomCode, players: initialPlayers, isHost, onLeave }) {
  const { socket } = useSocket();
  const { user, updateBalance } = useAuth();

  const [round, setRound] = useState(0);
  const [pattern, setPattern] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [roundResults, setRoundResults] = useState(null);
  const [standings, setStandings] = useState(initialPlayers);
  const [gameOver, setGameOver] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [submittedPlayers, setSubmittedPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('new-round', (data) => {
      setRound(data.round);
      setPattern({
        patternType: data.patternType,
        sequence: data.sequence,
        payouts: { exact: 5, category: 2, binary: 1.5 }
      });
      setTimeLeft(data.timeLimit);
      setSubmitted(false);
      setResult(null);
      setRoundResults(null);
      setSubmittedPlayers([]);
    });

    socket.on('player-submitted', ({ playerId, username }) => {
      setSubmittedPlayers(prev => [...prev, { playerId, username }]);
    });

    socket.on('guess-result', (data) => {
      setResult(data);
      updateBalance(data.newBalance);
    });

    socket.on('round-ended', (data) => {
      setRoundResults(data);
      setStandings(data.standings);
      setPattern(prev => prev ? { ...prev, answer: data.answer } : null);
    });

    socket.on('game-over', (data) => {
      setStandings(data.finalStandings);
      setGameOver(true);
    });

    socket.on('chat-message', (msg) => {
      setMessages(prev => [...prev.slice(-50), msg]);
    });

    return () => {
      socket.off('new-round');
      socket.off('player-submitted');
      socket.off('guess-result');
      socket.off('round-ended');
      socket.off('game-over');
      socket.off('chat-message');
    };
  }, [socket, updateBalance]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted && !roundResults) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, submitted, roundResults]);

  const submitGuess = (guess, guessType) => {
    socket?.emit('submit-guess', {
      roomCode,
      guess,
      guessType,
      betAmount
    });
    setSubmitted(true);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      socket?.emit('chat-message', { roomCode, message: chatInput });
      setChatInput('');
    }
  };

  if (gameOver) {
    const winner = standings[0];
    const myRank = standings.findIndex(p => p.user_id === user.id) + 1;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h1 className="text-4xl font-bold mb-6">Game Over!</h1>

          <div className="mb-8">
            <div className="text-6xl mb-2">👑</div>
            <div className="text-2xl font-bold text-casino-gold">{winner?.username}</div>
            <div className="text-gray-400">Winner with {winner?.score.toLocaleString()} coins</div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold mb-3">Final Standings</h3>
            <div className="space-y-2">
              {standings.map((player, index) => (
                <div
                  key={player.user_id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.user_id === user.id ? 'bg-casino-accent/20' : 'bg-casino-darker'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${index === 0 ? 'text-casino-gold' : ''}`}>
                      #{index + 1}
                    </span>
                    <span>{player.username}</span>
                    {player.user_id === user.id && (
                      <span className="text-xs text-casino-accent">(You)</span>
                    )}
                  </div>
                  <span className="text-casino-gold">{player.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xl mb-6">
            You finished <span className="text-casino-gold">#{myRank}</span>!
          </div>

          <button onClick={onLeave} className="btn-primary">
            Leave Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Room: <span className="text-white font-mono">{roomCode}</span></span>
          <span className="text-gray-400">Round: <span className="text-white">{round}/10</span></span>
        </div>
        <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-casino-accent' : 'text-white'}`}>
          {timeLeft}s
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          {pattern && (
            <>
              <PatternDisplay
                patternType={pattern.patternType}
                sequence={pattern.sequence}
                answer={roundResults?.answer}
                showAnswer={!!roundResults}
              />

              {!submitted && !roundResults && (
                <BettingPanel
                  patternType={pattern.patternType}
                  sequence={pattern.sequence}
                  payouts={pattern.payouts}
                  balance={user.balance}
                  betAmount={betAmount}
                  setBetAmount={setBetAmount}
                  onSubmit={submitGuess}
                  loading={false}
                />
              )}

              {submitted && !roundResults && (
                <div className="card text-center">
                  <div className="text-2xl mb-2">✓</div>
                  <div className="text-xl font-bold mb-2">Guess Submitted!</div>
                  <div className="text-gray-400">
                    Waiting for other players ({submittedPlayers.length}/{standings.length})
                  </div>
                </div>
              )}

              {roundResults && (
                <div className="card">
                  <h3 className="text-xl font-bold mb-4 text-center">Round {round} Results</h3>

                  {result && (
                    <div className={`text-center mb-4 p-4 rounded-lg ${result.correct ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <div className="text-2xl mb-1">{result.correct ? '✓ Correct!' : '✗ Wrong'}</div>
                      {result.correct && (
                        <div className="text-casino-gold">+{result.payout.toLocaleString()} coins</div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    {roundResults.results.map((r, i) => (
                      <div
                        key={r.playerId}
                        className={`flex items-center justify-between p-2 rounded ${
                          r.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                      >
                        <span>{r.username}</span>
                        <span className={r.isCorrect ? 'text-green-400' : 'text-red-400'}>
                          {r.isCorrect ? `+${r.payout}` : `-${r.bet}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-gray-400 mt-4">
                    Next round starting soon...
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold mb-3">Standings</h3>
            <div className="space-y-2">
              {standings.map((player, index) => (
                <div
                  key={player.user_id}
                  className={`flex items-center justify-between p-2 rounded ${
                    player.user_id === user.id ? 'bg-casino-accent/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={index === 0 ? 'text-casino-gold' : 'text-gray-500'}>
                      #{index + 1}
                    </span>
                    <span className="text-sm truncate max-w-[100px]">{player.username}</span>
                  </div>
                  <span className="text-casino-gold text-sm">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold mb-3">Chat</h3>
            <div className="h-40 overflow-y-auto mb-2 space-y-1">
              {messages.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className="text-casino-accent">{msg.username}:</span>{' '}
                  <span className="text-gray-300">{msg.message}</span>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="input-field flex-1 py-1 text-sm"
                maxLength={200}
              />
              <button type="submit" className="btn-secondary py-1 px-3 text-sm">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
