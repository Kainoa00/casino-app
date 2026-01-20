export const SYMBOLS = [
    { id: 'cherry', value: '🍒', payout: 2, weight: 40 },
    { id: 'lemon', value: '🍋', payout: 3, weight: 30 },
    { id: 'grapes', value: '🍇', payout: 5, weight: 20 },
    { id: 'diamond', value: '💎', payout: 10, weight: 10 },
    { id: 'seven', value: '7️⃣', payout: 25, weight: 5 },
    { id: 'jackpot', value: '🎰', payout: 100, weight: 1 }
];

const TOTAL_WEIGHT = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);

function getRandomSymbol() {
    const random = Math.random() * TOTAL_WEIGHT;
    let weightSum = 0;

    for (const symbol of SYMBOLS) {
        weightSum += symbol.weight;
        if (random <= weightSum) return symbol;
    }
    return SYMBOLS[0];
}

export function spinSlots() {
    const reel1 = getRandomSymbol();
    const reel2 = getRandomSymbol();
    const reel3 = getRandomSymbol();

    let payoutMultiplier = 0;
    let isWin = false;
    let winLine = [];

    // 3 Matches
    if (reel1.id === reel2.id && reel2.id === reel3.id) {
        payoutMultiplier = reel1.payout * 2; // Bonus multiplier for 3 match
        isWin = true;
        winLine = [0, 1, 2];
    }
    // 2 Matches (Reel 1 & 2)
    else if (reel1.id === reel2.id) {
        payoutMultiplier = reel1.payout * 0.5;
        isWin = true;
        winLine = [0, 1];
    }
    // 2 Matches (Reel 2 & 3)
    else if (reel2.id === reel3.id) {
        payoutMultiplier = reel2.payout * 0.5;
        isWin = true;
        winLine = [1, 2];
    }

    return {
        reels: [reel1, reel2, reel3],
        isWin,
        payoutMultiplier,
        winLine
    };
}
