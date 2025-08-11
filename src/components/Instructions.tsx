import React from 'react';
import { ArrowLeft, Mouse, Keyboard, Target, Heart, Zap } from 'lucide-react';

interface InstructionsProps {
  onBack: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ onBack }) => {
  const controls = [
    { icon: Mouse, title: 'Mouse Look', desc: 'Move mouse to look around' },
    { icon: Keyboard, title: 'WASD Movement', desc: 'W/A/S/D keys to move' },
    { icon: Target, title: 'Shoot', desc: 'Left click or Space to shoot' },
    { icon: Keyboard, title: 'Pause', desc: 'ESC to pause/unlock cursor' },
    { icon: Keyboard, title: 'Restart', desc: 'R key to restart game' },
  ];

  const objectives = [
    { icon: Target, title: 'Eliminate Enemies', desc: 'Shoot the red floating bots to score points' },
    { icon: Heart, title: 'Survive', desc: 'Avoid getting touched by enemies' },
    { icon: Zap, title: 'Advance Waves', desc: 'Clear all enemies to progress to the next wave' },
  ];

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="menu-card max-w-2xl w-full">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">How to Play</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Controls</h3>
            <div className="space-y-3">
              {controls.map((control, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <control.icon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{control.title}</div>
                    <div className="text-sm text-slate-400">{control.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-red-400">Objectives</h3>
            <div className="space-y-3">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <objective.icon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{objective.title}</div>
                    <div className="text-sm text-slate-400">{objective.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <h4 className="font-semibold text-yellow-400 mb-2">Tips for Success</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Keep moving to avoid enemy attacks</li>
            <li>• Aim for the center of enemies for better accuracy</li>
            <li>• Each wave spawns more and faster enemies</li>
            <li>• Your score is saved locally in your browser</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button onClick={onBack} className="game-button">
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;