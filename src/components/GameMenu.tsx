import React from 'react';
import { Target, BookOpen, Trophy, Play } from 'lucide-react';

interface GameMenuProps {
  onStartGame: () => void;
  onShowInstructions: () => void;
  onShowLeaderboard: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
  onStartGame,
  onShowInstructions,
  onShowLeaderboard,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="menu-card max-w-md w-full text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <Target className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
            FPS Shooter
          </h1>
          <p className="text-slate-400">
            Fast-paced browser-based first-person shooter
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onStartGame}
            className="game-button w-full flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Game
          </button>

          <button
            onClick={onShowInstructions}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            How to Play
          </button>

          <button
            onClick={onShowLeaderboard}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
        </div>

        <div className="mt-8 text-xs text-slate-500">
          Built with React & Canvas • Optimized for modern browsers
        </div>
      </div>
    </div>
  );
};

export default GameMenu;