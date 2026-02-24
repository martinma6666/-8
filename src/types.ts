export enum Suit {
  HEARTS = 'HEARTS',
  DIAMONDS = 'DIAMONDS',
  CLUBS = 'CLUBS',
  SPADES = 'SPADES',
}

export enum Rank {
  ACE = 'A',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
}

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GameStatus = 'START' | 'PLAYING' | 'SELECTING_SUIT' | 'GAME_OVER';

export interface GameState {
  deck: Card[];
  playerHand: Card[];
  aiHand: Card[];
  discardPile: Card[];
  currentSuit: Suit;
  currentRank: Rank;
  turn: 'PLAYER' | 'AI';
  status: GameStatus;
  winner: 'PLAYER' | 'AI' | null;
}
