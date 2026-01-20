import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as api from '../../../services/api';
import { Link } from 'react-router-dom';

export default function SlotsGame() {
    const { user, updateBalance } = useAuth();
    const [betAmount, setBetAmount] = useState(50);
    const [reels, setReels] = useState([
        { value: '🎰' }, { value: '🎰' }, { value: '🎰' }
    ]);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSpin = async () => {
        setSpinning(true);
        setError(null);
        setResult(null);

        // Animation effect
        const interval = setInterval(() => {
            setReels(prev => prev.map(() => ({ value: ['🍒', '🍋', '🍇', '💎', '7️⃣', '🎰'][Math.floor(Math.random() * 6)] })));
        }, 100);

        try {
            const data = await api.spinSlots(betAmount);

            // Delay to show animation
            setTimeout(() => {
                clearInterval(interval);
                setReels(data.result.reels);
                setResult(data);
                updateBalance(data.newBalance);
                setSpinning(false);
            }, 2000);
        } catch (err) {
            clearInterval(interval);
            setError(err.message || 'Spin failed');
            setSpinning(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-between mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                <Link to="/" className="text-gray-400 hover:text-casino-gold flex items-center gap-2 transition-colors font-medium">
                    <span>&larr;</span> <span>Main Lobby</span>
                </Link>
                <h1 className="text-2xl font-serif text-casino-gold">Golden Slots</h1>
            </div>

            <div className="card border-4 border-casino-gold bg-gradient-to-b from-purple-900 to-black p-8 relative overflow-hidden">
                {/* Decorative Lights */}
                <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400 animate-pulse"></div>

                <div className="flex justify-center gap-4 mb-8">
                    {reels.map((reel, i) => (
                        <div key={i} className="w-24 h-32 bg-white rounded-lg flex items-center justify-center text-6xl shadow-inner border-4 border-gray-300 transform transition-transform">
                            {reel.value}
                        </div>
                    ))}
                </div>

                {result && (
                    <div className={`text-2xl font-bold mb-4 ${result.result.isWin ? 'text-green-400 animate-bounce' : 'text-gray-400'}`}>
                        {result.result.isWin ? `WINNER! +${result.payout}` : 'Try Again'}
                    </div>
                )}

                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-start">
                        <label className="text-xs text-gray-400 uppercase tracking-widest">Bet</label>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={e => setBetAmount(parseInt(e.target.value))}
                            className="bg-black/40 border border-gray-600 rounded px-2 py-1 w-24 text-center text-white"
                            disabled={spinning}
                        />
                    </div>

                    <button
                        onClick={handleSpin}
                        disabled={spinning}
                        className={`px-8 py-4 rounded-full font-bold text-xl uppercase tracking-widest transition-all transform hover:scale-105 shadow-lg ${spinning
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black shadow-yellow-500/50'
                            }`}
                    >
                        {spinning ? 'Spinning...' : 'SPIN'}
                    </button>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-gray-400">
                <div className="p-2 border border-gray-800 rounded">🍒 2x</div>
                <div className="p-2 border border-gray-800 rounded">🍋 3x</div>
                <div className="p-2 border border-gray-800 rounded">🍇 5x</div>
                <div className="p-2 border border-gray-800 rounded">💎 10x</div>
                <div className="p-2 border border-gray-800 rounded">7️⃣ 25x</div>
                <div className="p-2 border border-gray-800 rounded">🎰 100x</div>
            </div>
        </div>
    );
}
