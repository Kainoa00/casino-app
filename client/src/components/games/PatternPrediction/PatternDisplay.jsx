const SUIT_SYMBOLS = {
  hearts: { symbol: '♥', color: 'text-red-500' },
  diamonds: { symbol: '♦', color: 'text-red-500' },
  clubs: { symbol: '♣', color: 'text-gray-900' },
  spades: { symbol: '♠', color: 'text-gray-900' }
};

function CardItem({ item, revealed = true }) {
  if (!revealed) {
    return (
      <div className="pattern-item pattern-item-card bg-gradient-to-br from-casino-purple to-casino-accent flex items-center justify-center">
        <span className="text-3xl text-white">?</span>
      </div>
    );
  }

  const suit = SUIT_SYMBOLS[item.suit];
  return (
    <div className="pattern-item pattern-item-card flex flex-col items-center justify-center">
      <span className="text-lg font-bold">{item.value}</span>
      <span className={`text-2xl ${suit?.color}`}>{suit?.symbol}</span>
    </div>
  );
}

function NumberItem({ item, revealed = true }) {
  if (!revealed) {
    return (
      <div className="pattern-item pattern-item-number flex items-center justify-center">
        <span className="text-3xl">?</span>
      </div>
    );
  }

  return (
    <div className="pattern-item pattern-item-number flex items-center justify-center">
      <span className="text-2xl font-bold">{item.value}</span>
    </div>
  );
}

function ColorItem({ item, revealed = true }) {
  const colorMap = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  if (!revealed) {
    return (
      <div className="pattern-item pattern-item-color bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
        <span className="text-2xl">?</span>
      </div>
    );
  }

  return (
    <div className={`pattern-item pattern-item-color ${colorMap[item.color]} flex items-center justify-center shadow-lg`}>
      <span className="text-xl drop-shadow-lg">{getShapeEmoji(item.shape)}</span>
    </div>
  );
}

function getShapeEmoji(shape) {
  const shapes = {
    circle: '●',
    square: '■',
    triangle: '▲',
    star: '★',
    diamond: '◆',
    hexagon: '⬡'
  };
  return shapes[shape] || '●';
}

export default function PatternDisplay({ patternType, sequence, answer, showAnswer }) {
  const ItemComponent = {
    cards: CardItem,
    numbers: NumberItem,
    colors: ColorItem
  }[patternType] || NumberItem;

  return (
    <div className="card mb-6">
      <h2 className="text-lg font-bold mb-4 text-center">What comes next?</h2>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {sequence.map((item, index) => (
          <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
            <ItemComponent item={item} revealed={true} />
          </div>
        ))}

        <div className="text-4xl text-casino-gold mx-2">→</div>

        <div className={`${showAnswer ? 'animate-slide-up' : ''}`}>
          <ItemComponent item={answer || {}} revealed={showAnswer} />
        </div>
      </div>

      {!showAnswer && (
        <p className="text-center text-gray-400 mt-4">
          Study the pattern and make your prediction below
        </p>
      )}
    </div>
  );
}
