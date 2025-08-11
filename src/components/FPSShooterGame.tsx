import React, { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Game } from '../game/Game';

interface Props {
  onBackToMenu: () => void;
}

const FPSShooterGame: React.FC<Props> = ({ onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const game = new Game(canvasRef.current);
    game.start();
    const canvas = canvasRef.current;
    const handleClick = () => game.lockPointer();
    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
      game.stop();
    };
  }, []);

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
        </div>
        <div className="w-full h-[70vh] md:h-[78vh] bg-black relative select-none rounded-xl overflow-hidden shadow-2xl">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </div>
    </div>
  );
};

export default FPSShooterGame;
