import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType, Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isPlayable?: boolean;
  isHidden?: boolean;
  className?: string;
  index?: number;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  isPlayable = false, 
  isHidden = false,
  className = '',
  index = 0
}) => {
  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      transition={{ delay: index * 0.05 }}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-24 h-36 sm:w-32 sm:h-48 rounded-xl border-2 shadow-lg cursor-pointer
        flex flex-col items-center justify-between p-2 sm:p-4 select-none
        ${isHidden 
          ? 'bg-indigo-800 border-indigo-900' 
          : 'bg-white border-slate-200'}
        ${isPlayable ? 'ring-4 ring-emerald-400 ring-offset-2' : ''}
        ${className}
      `}
    >
      {isHidden ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-24 sm:w-20 sm:h-32 border-2 border-white/20 rounded-lg flex items-center justify-center">
             <span className="text-white/20 text-4xl font-bold">8</span>
          </div>
        </div>
      ) : (
        <>
          <div className={`self-start flex flex-col items-center ${SUIT_COLORS[card.suit]}`}>
            <span className="text-lg sm:text-2xl font-bold leading-none">{card.rank}</span>
            <span className="text-xl sm:text-3xl leading-none">{SUIT_SYMBOLS[card.suit]}</span>
          </div>
          
          <div className={`text-4xl sm:text-6xl ${SUIT_COLORS[card.suit]}`}>
            {SUIT_SYMBOLS[card.suit]}
          </div>
          
          <div className={`self-end flex flex-col items-center rotate-180 ${SUIT_COLORS[card.suit]}`}>
            <span className="text-lg sm:text-2xl font-bold leading-none">{card.rank}</span>
            <span className="text-xl sm:text-3xl leading-none">{SUIT_SYMBOLS[card.suit]}</span>
          </div>
        </>
      )}
    </motion.div>
  );
};
