# FPS Shooter Game

A fast-paced first-person shooter game built with React, TypeScript, and HTML5 Canvas. Play directly in your browser with smooth 60fps gameplay!

## 🎮 Features

- **Smooth FPS Gameplay**: 60fps browser-based first-person shooter
- **Progressive Difficulty**: Waves get harder with more and faster enemies
- **Local Leaderboard**: Track your high scores locally
- **Immersive Audio**: Synthesized sound effects powered by the Web Audio API
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Zero Installation**: Play directly in your browser

## 🕹️ How to Play

### Controls
- **Mouse**: Look around
- **WASD**: Move (W=forward, S=backward, A=left, D=right)
- **Left Click / Space**: Shoot
- **ESC**: Pause game / unlock cursor
- **R**: Restart game

### Objective
- Eliminate red floating enemies to score points
- Avoid getting touched by enemies (they damage you)
- Survive as long as possible and advance through waves
- Each wave spawns more and faster enemies

## 🚀 Live Demo

Play the game at: [https://yourusername.github.io/fps-shooter-game/](https://yourusername.github.io/fps-shooter-game/)

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/fps-shooter-game.git
cd fps-shooter-game

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages:

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Your game will be available at `https://yourusername.github.io/fps-shooter-game/`

## 🏗️ Built With

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **HTML5 Canvas** - Game rendering
- **Lucide React** - Icons

## 📁 Project Structure

```
src/
├── components/
│   ├── FPSShooterGame.tsx    # Core game engine
│   ├── GameMenu.tsx          # Main menu
│   ├── Instructions.tsx      # How to play
│   └── Leaderboard.tsx       # Score tracking
├── App.tsx                   # Main app logic
├── main.tsx                  # React entry point
└── index.css                 # Global styles
```

## 🎯 Game Mechanics

- **Player Movement**: Smooth WASD movement with mouse look
- **Shooting System**: Raycast-based shooting with recoil effects
- **Enemy AI**: Enemies move toward player with increasing speed per wave
- **Collision Detection**: Circle-based collision for player-enemy interactions
- **Health System**: Player starts with 100 health, loses 25 per enemy touch
- **Scoring**: 10 points per enemy eliminated
- **Wave Progression**: Automatic wave advancement when all enemies defeated

## 🔧 Configuration

### GitHub Pages Setup
The `vite.config.ts` is pre-configured for GitHub Pages deployment. The base path is derived automatically from the repository name during CI builds. To override it manually (for example for a custom domain or subdirectory), set the `BASE_PATH` environment variable before building:

```bash
BASE_PATH=/custom-path/ npm run build
```

## 📱 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎮 Enjoy the Game!

Have fun playing and feel free to contribute improvements or report issues!