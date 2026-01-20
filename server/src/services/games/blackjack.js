const SUITS = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const value of VALUES) {
            deck.push({ suit, value });
        }
    }
    return shuffle(deck);
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
        if (['J', 'Q', 'K'].includes(card.value)) {
            value += 10;
        } else if (card.value === 'A') {
            aces += 1;
            value += 11;
        } else {
            value += parseInt(card.value);
        }
    }

    while (value > 21 && aces > 0) {
        value -= 10;
        aces -= 1;
    }

    return value;
}

export function drawCard(deck) {
    return deck.pop();
}

export function initialDeal(deck) {
    const playerHand = [drawCard(deck), drawCard(deck)];
    const dealerHand = [drawCard(deck), drawCard(deck)];
    return { playerHand, dealerHand, deck };
}

export function getGameState(game) {
    const playerValue = calculateHandValue(game.playerHand);
    const dealerValue = calculateHandValue(game.dealerHand);

    let status = 'playing';
    let result = null;

    if (playerValue > 21) {
        status = 'finished';
        result = 'bust'; // Player busts
    } else if (playerValue === 21 && game.playerHand.length === 2 && dealerValue !== 21) {
        status = 'finished';
        result = 'blackjack'; // Player Blackjack
    }

    return { ...game, playerValue, dealerValue, status, result };
}

export function dealerPlay(game) {
    let { dealerHand, deck } = game;
    let dealerValue = calculateHandValue(dealerHand);

    while (dealerValue < 17) {
        dealerHand.push(drawCard(deck));
        dealerValue = calculateHandValue(dealerHand);
    }

    game.dealerHand = dealerHand;
    const playerValue = calculateHandValue(game.playerHand);

    let result;
    if (dealerValue > 21) {
        result = 'dealer_bust';
    } else if (dealerValue > playerValue) {
        result = 'lose';
    } else if (dealerValue < playerValue) {
        result = 'win';
    } else {
        result = 'push';
    }

    return { ...game, dealerValue, status: 'finished', result };
}
