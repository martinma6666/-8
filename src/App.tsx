/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card as CardComponent } from './components/Card';
import { Suit, Rank, Card, GameState, GameStatus } from './types';
import { createDeck, SUITS, SUIT_SYMBOLS, SUIT_COLORS } from './constants';
import { Trophy, RotateCcw, Info, Hand, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentSuit: Suit.HEARTS,
    currentRank: Rank.ACE,
    turn: 'PLAYER',
    status: 'START',
    winner: null,
  });

  const [message, setMessage] = useState<string>('Welcome to Crazy Eights!');

  const initGame = () => {
    const deck = createDeck();
    const playerHand = deck.splice(0, 8);
    const aiHand = deck.splice(0, 8);
    
    // Find a non-8 card for the first discard
    let firstDiscardIndex = deck.findIndex(c => c.rank !== Rank.EIGHT);
    if (firstDiscardIndex === -1) firstDiscardIndex = 0;
    const firstDiscard = deck.splice(firstDiscardIndex, 1)[0];

    setGameState({
      deck,
      playerHand,
      aiHand,
      discardPile: [firstDiscard],
      currentSuit: firstDiscard.suit,
      currentRank: firstDiscard.rank,
      turn: 'PLAYER',
      status: 'PLAYING',
      winner: null,
    });
    setMessage("Your turn! Match the suit or rank.");
  };

  const isPlayable = (card: Card) => {
    if (card.rank === Rank.EIGHT) return true;
    return card.suit === gameState.currentSuit || card.rank === gameState.currentRank;
  };

  const handlePlayerPlay = (card: Card) => {
    if (gameState.turn !== 'PLAYER' || gameState.status !== 'PLAYING') return;
    if (!isPlayable(card)) return;

    const newPlayerHand = gameState.playerHand.filter(c => c.id !== card.id);
    const newDiscardPile = [card, ...gameState.discardPile];

    if (newPlayerHand.length === 0) {
      setGameState(prev => ({
        ...prev,
        playerHand: newPlayerHand,
        discardPile: newDiscardPile,
        status: 'GAME_OVER',
        winner: 'PLAYER'
      }));
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      return;
    }

    if (card.rank === Rank.EIGHT) {
      setGameState(prev => ({
        ...prev,
        playerHand: newPlayerHand,
        discardPile: newDiscardPile,
        status: 'SELECTING_SUIT'
      }));
      setMessage("Choose a new suit!");
    } else {
      setGameState(prev => ({
        ...prev,
        playerHand: newPlayerHand,
        discardPile: newDiscardPile,
        currentSuit: card.suit,
        currentRank: card.rank,
        turn: 'AI'
      }));
      setMessage("AI is thinking...");
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    setGameState(prev => ({
      ...prev,
      currentSuit: suit,
      status: 'PLAYING',
      turn: 'AI'
    }));
    setMessage(`Suit changed to ${suit}. AI's turn.`);
  };

  const drawCard = (target: 'PLAYER' | 'AI') => {
    if (gameState.deck.length === 0) {
      setMessage("Deck is empty! Skipping turn.");
      setGameState(prev => ({ ...prev, turn: target === 'PLAYER' ? 'AI' : 'PLAYER' }));
      return;
    }

    const newDeck = [...gameState.deck];
    const drawnCard = newDeck.pop()!;
    
    if (target === 'PLAYER') {
      setGameState(prev => ({
        ...prev,
        deck: newDeck,
        playerHand: [...prev.playerHand, drawnCard]
      }));
      setMessage("You drew a card.");
    } else {
      setGameState(prev => ({
        ...prev,
        deck: newDeck,
        aiHand: [...prev.aiHand, drawnCard]
      }));
      setMessage("AI drew a card.");
    }
  };

  // AI Logic
  useEffect(() => {
    if (gameState.turn === 'AI' && gameState.status === 'PLAYING') {
      const timer = setTimeout(() => {
        const playableCards = gameState.aiHand.filter(isPlayable);
        
        if (playableCards.length > 0) {
          // AI Strategy: Prefer non-8 cards first
          const nonEight = playableCards.find(c => c.rank !== Rank.EIGHT);
          const cardToPlay = nonEight || playableCards[0];
          
          const newAiHand = gameState.aiHand.filter(c => c.id !== cardToPlay.id);
          const newDiscardPile = [cardToPlay, ...gameState.discardPile];

          if (newAiHand.length === 0) {
            setGameState(prev => ({
              ...prev,
              aiHand: newAiHand,
              discardPile: newDiscardPile,
              status: 'GAME_OVER',
              winner: 'AI'
            }));
            return;
          }

          if (cardToPlay.rank === Rank.EIGHT) {
            // AI chooses most frequent suit in its hand
            const suitCounts: Record<string, number> = {};
            newAiHand.forEach(c => {
              suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
            });
            const bestSuit = (Object.keys(suitCounts).reduce((a, b) => 
              suitCounts[a] > suitCounts[b] ? a : b, Suit.HEARTS)) as Suit;

            setGameState(prev => ({
              ...prev,
              aiHand: newAiHand,
              discardPile: newDiscardPile,
              currentSuit: bestSuit,
              turn: 'PLAYER'
            }));
            setMessage(`AI played an 8 and changed suit to ${bestSuit}. Your turn!`);
          } else {
            setGameState(prev => ({
              ...prev,
              aiHand: newAiHand,
              discardPile: newDiscardPile,
              currentSuit: cardToPlay.suit,
              currentRank: cardToPlay.rank,
              turn: 'PLAYER'
            }));
            setMessage(`AI played ${cardToPlay.rank} of ${cardToPlay.suit}. Your turn!`);
          }
        } else {
          if (gameState.deck.length > 0) {
            drawCard('AI');
            // After drawing, AI checks again or passes
            setGameState(prev => ({ ...prev, turn: 'PLAYER' }));
            setMessage("AI couldn't play and drew a card. Your turn!");
          } else {
            setGameState(prev => ({ ...prev, turn: 'PLAYER' }));
            setMessage("AI has no moves and deck is empty. Your turn!");
          }
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.turn, gameState.status]);

  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-emerald-900 text-white font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-4 bg-black/20 backdrop-blur-md flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-900 font-bold text-xl shadow-lg">8</div>
          <h1 className="text-2xl font-bold tracking-tight">CRAZY EIGHTS</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm">
            <Layers className="w-4 h-4" />
            <span>Deck: {gameState.deck.length}</span>
          </div>
          <button 
            onClick={() => setShowHelp(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="How to Play"
          >
            <Info className="w-6 h-6" />
          </button>
          <button 
            onClick={initGame}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Restart Game"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full gap-8">
        
        {/* AI Hand */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-white/60 text-sm uppercase tracking-widest font-semibold">
            <Hand className="w-4 h-4" />
            <span>AI Opponent ({gameState.aiHand.length})</span>
          </div>
          <div className="flex -space-x-12 sm:-space-x-16 overflow-visible h-40 sm:h-52 items-center">
            {gameState.aiHand.map((card, i) => (
              <CardComponent 
                key={card.id} 
                card={card} 
                isHidden 
                index={i}
                className="shadow-2xl"
              />
            ))}
          </div>
        </div>

        {/* Center Table */}
        <div className="flex-1 flex items-center justify-center gap-8 sm:gap-16">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-2">
            <div 
              onClick={() => gameState.turn === 'PLAYER' && gameState.status === 'PLAYING' && drawCard('PLAYER')}
              className={`
                relative w-24 h-36 sm:w-32 sm:h-48 rounded-xl border-2 border-white/20 bg-indigo-900 shadow-2xl cursor-pointer
                flex items-center justify-center transition-transform hover:scale-105 active:scale-95
                ${gameState.turn === 'PLAYER' && gameState.status === 'PLAYING' ? 'ring-4 ring-white/30' : 'opacity-80'}
              `}
            >
              <div className="w-16 h-24 sm:w-20 sm:h-32 border-2 border-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white/10 text-4xl font-bold">DRAW</span>
              </div>
              {/* Stack effect */}
              <div className="absolute -bottom-1 -right-1 w-full h-full bg-indigo-950 rounded-xl -z-10 border border-white/5"></div>
              <div className="absolute -bottom-2 -right-2 w-full h-full bg-indigo-950 rounded-xl -z-20 border border-white/5"></div>
            </div>
            <span className="text-xs text-white/40 font-mono uppercase">Draw Pile</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-36 sm:w-32 sm:h-48">
              <AnimatePresence mode="popLayout">
                {gameState.discardPile.length > 0 && (
                  <CardComponent 
                    key={gameState.discardPile[0].id}
                    card={gameState.discardPile[0]} 
                    className="absolute inset-0 shadow-2xl"
                  />
                )}
              </AnimatePresence>
              {/* Indicator for current suit if 8 was played */}
              {gameState.discardPile[0]?.rank === Rank.EIGHT && (
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-emerald-500 z-20">
                  <span className={`text-2xl ${SUIT_COLORS[gameState.currentSuit]}`}>
                    {SUIT_SYMBOLS[gameState.currentSuit]}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-white/40 font-mono uppercase">Discard</span>
          </div>
        </div>

        {/* Player Hand */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/60 text-sm uppercase tracking-widest font-semibold">
              <Hand className="w-4 h-4" />
              <span>Your Hand ({gameState.playerHand.length})</span>
            </div>
            <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${(gameState.playerHand.length / 16) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-4xl">
            {gameState.playerHand.map((card, i) => (
              <CardComponent 
                key={card.id} 
                card={card} 
                index={i}
                isPlayable={gameState.turn === 'PLAYER' && gameState.status === 'PLAYING' && isPlayable(card)}
                onClick={() => handlePlayerPlay(card)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="p-4 bg-black/40 backdrop-blur-md border-t border-white/10 flex justify-center">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${gameState.turn === 'PLAYER' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <p className="text-lg font-medium italic text-emerald-50">{message}</p>
        </div>
      </footer>

      {/* Modals / Overlays */}
      <AnimatePresence>
        {gameState.status === 'START' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-emerald-950 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-emerald-900 font-bold text-6xl shadow-2xl mx-auto mb-6">8</div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight">CRAZY EIGHTS</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Match the suit or rank. Use 8s as wildcards to change the suit. 
                Be the first to clear your hand to win!
              </p>
              <button 
                onClick={initGame}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95"
              >
                START GAME
              </button>
            </motion.div>
          </motion.div>
        )}

        {gameState.status === 'SELECTING_SUIT' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Select New Suit</h3>
              <div className="grid grid-cols-2 gap-4">
                {SUITS.map(suit => (
                  <button
                    key={suit}
                    onClick={() => handleSuitSelect(suit)}
                    className={`
                      p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 
                      transition-all flex flex-col items-center gap-2 group
                    `}
                  >
                    <span className={`text-4xl ${SUIT_COLORS[suit]} group-hover:scale-110 transition-transform`}>
                      {SUIT_SYMBOLS[suit]}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{suit}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameState.status === 'GAME_OVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-emerald-950 border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-10 h-10 text-emerald-950" />
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-2 tracking-tight">
                {gameState.winner === 'PLAYER' ? 'YOU WON!' : 'AI WON!'}
              </h2>
              <p className="text-white/60 mb-8">
                {gameState.winner === 'PLAYER' 
                  ? 'Incredible strategy! You cleared your hand first.' 
                  : 'Better luck next time. The AI was faster this time.'}
              </p>
              <button 
                onClick={initGame}
                className="w-full py-4 bg-white text-emerald-950 font-bold rounded-xl transition-all shadow-lg active:scale-95"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          </motion.div>
        )}
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-emerald-950 border border-white/10 p-8 rounded-3xl max-w-lg w-full text-left shadow-2xl"
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-8 h-8 text-emerald-400" />
                How to Play
              </h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p><strong className="text-white">Goal:</strong> Be the first to get rid of all your cards.</p>
                <p><strong className="text-white">Matching:</strong> You can play a card if it matches the <span className="text-emerald-400">Suit</span> or the <span className="text-emerald-400">Rank</span> of the top card in the discard pile.</p>
                <p><strong className="text-white">Crazy 8s:</strong> An <span className="text-amber-400 font-bold text-lg">8</span> is a wildcard! You can play it anytime and choose a new suit.</p>
                <p><strong className="text-white">Drawing:</strong> If you can't play any card, you must draw from the deck. If the deck is empty, your turn is skipped.</p>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="mt-8 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-xl transition-all shadow-lg"
              >
                GOT IT
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
