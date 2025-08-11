import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface FPSShooterGameProps {
  onBackToMenu: () => void;
}

const FPSShooterGame: React.FC<FPSShooterGameProps> = ({ onBackToMenu }) => {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [message, setMessage] = useState('Click to play • WASD move • Mouse look • Click/Space shoot • ESC pause');

  // Internal mutable game state stored in refs to avoid rerenders
  const stateRef = useRef(null);
  const rafRef = useRef(0);

  // Save score to leaderboard
  const saveScore = (finalScore: number, finalWave: number) => {
    const savedScores = localStorage.getItem('fps-shooter-scores');
    let scores = [];
    if (savedScores) {
      try {
        scores = JSON.parse(savedScores);
      } catch (error) {
        console.error('Error parsing saved scores:', error);
      }
    }
    
    scores.push({
      score: finalScore,
      wave: finalWave,
      date: new Date().toISOString(),
    });
    
    // Keep only top 10 scores
    scores.sort((a: any, b: any) => b.score - a.score);
    scores = scores.slice(0, 10);
    
    localStorage.setItem('fps-shooter-scores', JSON.stringify(scores));
  };

  // Helper: random
  const rand = (min, max) => Math.random() * (max - min) + min;

  const resetGame = () => {
    setRunning(false);
    setScore(0);
    setHealth(100);
    setWave(1);
    setMessage('Click to play • WASD move • Mouse look • Click/Space shoot • ESC pause');

    stateRef.current = {
      t: 0,
    };
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      const s = stateRef.current;
      if (e.code === "KeyR") {
        resetGame();
        setRunning(false);
        setMessage('Click to play • WASD move • Mouse look • Click/Space shoot • ESC pause');
        return;
      }
      if (e.code === "Escape") return; // allow browser to unlock pointer
    };

    // Death
    if (health <= 0 && s.alive) {
      s.alive = false;
      setRunning(false);
      saveScore(score, wave);
      setMessage(`Game Over — Score ${score}. Press R to restart or ESC for menu.`);
    }
  }, []);

  const handleCanvasClick = () => {
    // Handle canvas click
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Menu
          </button>
          <div className="text-right text-sm text-slate-400">
            ESC to pause • R to restart
          </div>
        </div>
        
      <div className="w-full h-[70vh] md:h-[78vh] bg-black relative select-none rounded-xl overflow-hidden shadow-2xl">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair"
        role="application"
        aria-label="First-person shooter canvas"
      />
      </div>
    </div>
    </div>
  );
};

export default FPSShooterGame;