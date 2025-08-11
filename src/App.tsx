import React, { useState } from 'react';
import FPSShooterGame from './components/FPSShooterGame';
import GameMenu from './components/GameMenu';
import Instructions from './components/Instructions';
import Leaderboard from './components/Leaderboard';

type GameState = 'menu' | 'playing' | 'instructions' | 'leaderboard';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');

  const handleStartGame = () => setGameState('playing');
  const handleShowInstructions = () => setGameState('instructions');
  const handleShowLeaderboard = () => setGameState('leaderboard');
  const handleBackToMenu = () => setGameState('menu');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {gameState === 'menu' && (
        <GameMenu
          onStartGame={handleStartGame}
          onShowInstructions={handleShowInstructions}
          onShowLeaderboard={handleShowLeaderboard}
        />
      )}
      
      {gameState === 'playing' && (
        <FPSShooterGame onBackToMenu={handleBackToMenu} />
      )}
      
      {gameState === 'instructions' && (
        <Instructions onBack={handleBackToMenu} />
      )}
      
      {gameState === 'leaderboard' && (
        <Leaderboard onBack={handleBackToMenu} />
      )}
    </div>
  );
}

export default App;