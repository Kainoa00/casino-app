import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as api from '../../../services/api';
import { Link } from 'react-router-dom';

const Card = ({ card, hidden }) => (
    <div className={`w-20 h-32 rounded-lg m-1 flex items-center justify-center text-2xl border-2 shadow-lg relative ${hidden
            ? 'bg-gradient-to-br from-red-900 to-red-700 border-white/20'
            : 'bg-white text-black border-white'
        }`}>
        {hidden ? (
            <span className="text-4xl text-red-200 opacity-20">♠️</span>
        ) : (
            <div className={`flex flex-col items-center ${['H', 'D'].includes(card.suit) ? 'text-red-600' : 'text-black'}`}>
                <span className="font-bold">{card.value}</span>
                <span className="text-3xl">
                    {{ 'H': '♥', 'D': '♦', 'C': '♣', 'S': '♠' }[card.suit]}
                </span>
            </div>
        )}
    </div>
);

export default function BlackjackGame() {
    const { updateBalance } = useAuth();
    const [gameState, setGameState] = useState(null); // { playerHand, dealerHand, status, result, gameId }
    const [betAmount, setBetAmount] = useState(100);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const startGame = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.startBlackjack(betAmount);
            setGameState(data);
            updateBalance(data.newBalance);
        } catch (err) {
            setError(err.message || 'Failed to deal');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        if (!gameState) return;
        setLoading(true);
        try {
            const data = await api.blackjackAction(gameState.gameId, action);
            setGameState(data);
            if (data.status === 'finished') {
                updateBalance(data.newBalance);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-between mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                <Link to="/" className="text-gray-400 hover:text-casino-gold flex items-center gap-2 transition-colors font-medium">
                    <span>&larr;</span> <span>Main Lobby</span>
                </Link>
                <h1 className="text-2xl font-serif text-casino-gold">Blackjack VIP</h1>
            </div>

            <div className="bg-green-900/40 rounded-3xl p-8 border-8 border-green-950 shadow-2xl relative min-h-[500px] flex flex-col justify-between">
                {/* Table Felt Texture */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-30 pointer-events-none rounded-2xl"></div>

                {/* Dealer Area */}
                <div className="flex flex-col items-center">
                    <div className="text-green-200 text-sm tracking-widest uppercase mb-2">Dealer</div>
                    <div className="flex justify-center">
                        {gameState?.dealerHand ? (
                            gameState.dealerHand.map((card, i) => <Card key={i} card={card} hidden={card.value === '?'} />)
                        ) : (
                            <div className="w-20 h-32 rounded-lg border-2 border-green-800 bg-green-950/20 m-1"></div>
                        )}
                    </div>
                </div>

                {/* Center Info / Result */}
                <div className="my-8 h-16 flex items-center justify-center">
                    {gameState?.status === 'finished' && (
                        <div className="bg-black/80 px-8 py-4 rounded-full border border-casino-gold animate-bounce">
                            <span className={`text-2xl font-bold uppercase ${['win', 'blackjack'].includes(gameState.result) ? 'text-casino-gold' :
                                    gameState.result === 'push' ? 'text-gray-300' : 'text-red-500'
                                }`}>
                                {gameState.result?.replace('_', ' ')}
                            </span>
                        </div>
                    )}
                    {error && <div className="text-red-500 bg-black/50 px-4 py-2 rounded">{error}</div>}
                </div>

                {/* Player Area */}
                <div className="flex flex-col items-center">
                    <div className="flex justify-center mb-4">
                        {gameState?.playerHand ? (
                            gameState.playerHand.map((card, i) => <Card key={i} card={card} />)
                        ) : (
                            <div className="w-20 h-32 rounded-lg border-2 border-green-800 bg-green-950/20 m-1"></div>
                        )}
                    </div>
                    <div className="text-green-200 text-sm tracking-widest uppercase mb-4">
                        Player {gameState?.playerValue ? `(${gameState.playerValue})` : ''}
                    </div>

                    {/* Controls */}
                    {!gameState || gameState.status === 'finished' ? (
                        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl">
                            <label>Bet:</label>
                            <input
                                type="number"
                                value={betAmount}
                                onChange={e => setBetAmount(parseInt(e.target.value))}
                                className="bg-black border border-gray-600 rounded w-20 px-2 py-1 text-center"
                            />
                            <button onClick={startGame} disabled={loading} className="btn-gold px-8 py-2 rounded-full">
                                {loading ? 'Dealing...' : 'DEAL'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleAction('hit')}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
                            >
                                HIT
                            </button>
                            <button
                                onClick={() => handleAction('stand')}
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full shadow-lg border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all"
                            >
                                STAND
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
