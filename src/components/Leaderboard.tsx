import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardProps {
  onBack: () => void;
}

interface Score {
  score: number;
  wave: number;
  date: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const savedScores = localStorage.getItem('fps-shooter-scores');
    if (savedScores) {
      try {
        const parsedScores = JSON.parse(savedScores);
        setScores(parsedScores.sort((a: Score, b: Score) => b.score - a.score).slice(0, 10));
      } catch (error) {
        console.error('Error parsing saved scores:', error);
      }
    }
  }, []);

  const clearScores = () => {
    localStorage.removeItem('fps-shooter-scores');
    setScores([]);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <div className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">{index + 1}</div>;
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="menu-card max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold">Leaderboard</h2>
          </div>
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>

        {scores.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No scores yet!</p>
            <p className="text-sm text-slate-500">Play the game to set your first record.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {scores.map((score, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-700/50' 
                      : 'bg-slate-700/50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">{score.score.toLocaleString()}</span>
                      <span className="text-sm text-slate-400">Wave {score.wave}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(score.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={onBack} className="game-button flex-1">
                Back to Menu
              </button>
              <button
                onClick={clearScores}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Clear
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;