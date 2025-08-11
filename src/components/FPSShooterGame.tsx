import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

type Wall = { x1: number; z1: number; x2: number; z2: number };

// Very rough approximation of Counter‑Strike's Dust2 layout using simple
// rectangular segments in the XZ plane. The coordinates are kept small so the
// player can traverse the whole map quickly.
const createDust2Layout = (): Wall[] => [
  // Outer boundary box
  { x1: -40, z1: -40, x2: 40, z2: -35 },
  { x1: -40, z1: 35, x2: 40, z2: 40 },
  { x1: -40, z1: -40, x2: -35, z2: 40 },
  { x1: 35, z1: -40, x2: 40, z2: 40 },
  // Long corridor
  { x1: -5, z1: -40, x2: 5, z2: 0 },
  // Mid branches
  { x1: -5, z1: 0, x2: -35, z2: 10 },
  { x1: 5, z1: 0, x2: 35, z2: 10 },
  // Lower connector
  { x1: -5, z1: 10, x2: 5, z2: 40 },
];

interface FPSShooterGameProps {
  onBackToMenu: () => void;
}

const FPSShooterGame: React.FC<FPSShooterGameProps> = ({ onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [message, setMessage] = useState('Click to play • WASD move • Mouse look • Click/Space shoot • ESC pause');

  // Internal mutable game state stored in refs to avoid rerenders
  const stateRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const audioRef = useRef<AudioContext | null>(null);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioRef.current = new Ctx();
    }
    audioRef.current.resume();
  };

  const playShootSound = () => {
    ensureAudio();
    const ctx = audioRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playDamageSound = () => {
    ensureAudio();
    const ctx = audioRef.current!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  // Save score to leaderboard
  const saveScore = (finalScore: number, finalWave: number) => {
    const savedScores = localStorage.getItem('fps-shooter-scores');
    let scores: any[] = [];
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
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const inWall = (x: number, z: number, r = 0.6) => {
    const s = stateRef.current;
    if (!s) return false;
    return s.walls.some((w: Wall) =>
      x + r > w.x1 && x - r < w.x2 && z + r > w.z1 && z - r < w.z2
    );
  };

  const resetGame = () => {
    setScore(0);
    setHealth(100);
    setWave(1);
    setMessage('Click to play • WASD move • Mouse look • Click/Space shoot • ESC pause');

    stateRef.current = {
      t: 0,
      keys: new Set(),
      mouseLocked: false,
      shootRequested: false,
      // Player in XZ plane
      player: {
        x: 0,
        z: 0,
        yaw: 0, // radians
        speed: 8, // units/sec
      },
      // Enemies are simple billboards in XZ plane
      enemies: [],
      spawnCd: 0,
      walls: createDust2Layout(),
      worldSize: 60, // half-size bounds
      fov: (75 * Math.PI) / 180,
      recoil: 0,
      damageOverlay: 0,
      alive: true,
    };
  };

  // Spawn enemies in a cone in front of player
  const spawnWave = (count: number) => {
    const s = stateRef.current;
    if (!s) return;
    for (let i = 0; i < count; i++) {
      let ex = 0, ez = 0, attempts = 0;
      do {
        const dist = rand(12, 35);
        const angle = s.player.yaw + rand(-0.7, 0.7);
        ex = s.player.x + Math.sin(angle) * dist;
        ez = s.player.z + Math.cos(angle) * dist;
        attempts++;
      } while (inWall(ex, ez) && attempts < 10);
      s.enemies.push({ x: ex, z: ez, r: 0.6, hp: 1, vx: rand(-0.5, 0.5), vz: rand(-0.5, 0.5) });
    }
  };

  // Pointer lock helpers
  const lockPointer = () => {
    const canvas = canvasRef.current;
    if (canvas && canvas.requestPointerLock) canvas.requestPointerLock();
  };

  useEffect(() => {
    resetGame();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize for DPR
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      stateRef.current.mouseLocked = locked;
      setRunning(locked && stateRef.current.alive);
      if (locked && score === 0 && stateRef.current.t === 0) {
        // first start
        setMessage('');
        spawnWave(6);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const s = stateRef.current;
      if (!s.mouseLocked || !s.alive) return;
      const sensitivity = 0.0028;
      s.player.yaw -= e.movementX * sensitivity;
      // clamp yaw to [-PI, PI] smoothly
      if (s.player.yaw > Math.PI) s.player.yaw -= Math.PI * 2;
      if (s.player.yaw < -Math.PI) s.player.yaw += Math.PI * 2;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) {
        lockPointer();
        return;
      }
      const s = stateRef.current;
      if (!s.alive) return;
      s.shootRequested = true;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (e.code === 'KeyR') {
        resetGame();
        setRunning(false);
        setMessage('Click to play • WASD move • Mouse look • Click/Space shoot • ESC pause');
        return;
      }
      if (e.code === 'Escape') return; // allow browser to unlock pointer
      s.keys.add(e.code);
      if (e.code === 'Space') s.shootRequested = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys.delete(e.code);
    };

    window.addEventListener('resize', resize);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    resize();

    let last = performance.now();

    const shoot = () => {
      const s = stateRef.current;
      if (!s || !s.alive) return false;
      playShootSound();
      // Ray from player in yaw direction; pick closest enemy within small angular threshold & unobstructed (no walls here)
      const px = s.player.x, pz = s.player.z, yaw = s.player.yaw;
      let bestIdx = -1;
      let bestDist = Infinity;
      for (let i = 0; i < s.enemies.length; i++) {
        const e = s.enemies[i];
        if (e.hp <= 0) continue;
        const rx = e.x - px;
        const rz = e.z - pz;
        const cz = Math.cos(yaw) * rz + Math.sin(yaw) * rx; // forward component
        const cx = Math.cos(yaw) * rx - Math.sin(yaw) * rz; // right component
        if (cz <= 0) continue; // behind
        const ang = Math.atan2(cx, cz); // angle off-center
        const radiusAtDist = Math.atan2(e.r, cz); // acceptable angle to hit bounding circle
        if (Math.abs(ang) < Math.max(radiusAtDist * 1.2, 0.025)) {
          const dist2 = rx * rx + rz * rz;
          if (dist2 < bestDist) {
            bestDist = dist2;
            bestIdx = i;
          }
        }
      }
      if (bestIdx >= 0) {
        s.enemies[bestIdx].hp = 0;
        setScore((v) => v + 10);
        s.recoil = 1;
        return true;
      }
      s.recoil = 0.5;
      return false;
    };

    const update = (dt: number) => {
      const s = stateRef.current;
      if (!s) return;
      s.t += dt;

      // Movement
      const p = s.player;
      const accel = p.speed;
      let fx = 0, fz = 0;
      if (s.keys.has('KeyW')) { fz += 1; }
      if (s.keys.has('KeyS')) { fz -= 1; }
      if (s.keys.has('KeyA')) { fx -= 1; }
      if (s.keys.has('KeyD')) { fx += 1; }
      // Normalize
      const len = Math.hypot(fx, fz);
      if (len > 0) { fx /= len; fz /= len; }
      // Rotate into world space
      const sin = Math.sin(p.yaw), cos = Math.cos(p.yaw);
      const radius = 0.6;
      let nx = p.x + (sin * fz + cos * fx) * accel * dt;
      let nz = p.z + (cos * fz - sin * fx) * accel * dt;
      // Clamp to world
      nx = Math.max(-s.worldSize, Math.min(s.worldSize, nx));
      nz = Math.max(-s.worldSize, Math.min(s.worldSize, nz));
      // Wall collisions
      for (const w of s.walls as Wall[]) {
        if (nx + radius > w.x1 && nx - radius < w.x2 && nz + radius > w.z1 && nz - radius < w.z2) {
          const overlapX = Math.min(w.x2 - (nx - radius), (nx + radius) - w.x1);
          const overlapZ = Math.min(w.z2 - (nz - radius), (nz + radius) - w.z1);
          if (overlapX < overlapZ) {
            nx += nx < (w.x1 + w.x2) / 2 ? -overlapX : overlapX;
          } else {
            nz += nz < (w.z1 + w.z2) / 2 ? -overlapZ : overlapZ;
          }
        }
      }
      p.x = nx;
      p.z = nz;

      // Enemies simple drift towards player
      for (const e of s.enemies) {
        if (e.hp <= 0) continue;
        const dx = p.x - e.x, dz = p.z - e.z;
        const d = Math.hypot(dx, dz) + 1e-6;
        const speed = 2 + Math.min(5, wave * 0.3);
        let ex = e.x + (dx / d) * speed * dt + e.vx * dt;
        let ez = e.z + (dz / d) * speed * dt + e.vz * dt;
        if (!inWall(ex, ez, e.r)) {
          e.x = ex;
          e.z = ez;
        }
        // Collision with player
        if (d < 1.2) {
          setHealth((h) => Math.max(0, h - 25));
          s.damageOverlay = 1;
          playDamageSound();
          // knock back enemy a little
          e.x -= (dx / d) * 2;
          e.z -= (dz / d) * 2;
        }
      }

      // Remove dead enemies with fade
      s.enemies = s.enemies.filter((e: any) => e.hp > 0 || (e.fade = (e.fade || 0) + dt) < 0.4);

      // Spawn logic
      s.spawnCd -= dt;
      if (s.spawnCd <= 0 && s.enemies.filter((e: any) => e.hp > 0).length < 3 + wave) {
        spawnWave(1);
        s.spawnCd = rand(0.6, 1.2);
      }

      // Recoil & damage overlay decay
      s.recoil *= Math.pow(0.04, dt);
      s.damageOverlay *= Math.pow(0.2, dt);

      // Shooting
      if (s.shootRequested) {
        shoot();
        s.shootRequested = false;
      }

      // Advance wave when clear
      if (s.enemies.every((e: any) => e.hp <= 0)) {
        setWave((w) => w + 1);
        spawnWave(3 + wave);
      }

      // Death
      if (health <= 0 && s.alive) {
        s.alive = false;
        setRunning(false);
        saveScore(score, wave);
        setMessage(`Game Over — Score ${score}. Press R to restart or ESC for menu.`);
      }
    };

    const draw = (dt: number) => {
      const s = stateRef.current;
      // Canvas logical size (CSS pixels after transform)
      const rect = canvas.getBoundingClientRect();
      const W = rect.width, H = rect.height;
      ctx.clearRect(0, 0, W, H);

      // Sky & floor gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H/2);
      sky.addColorStop(0, '#0a0f1f');
      sky.addColorStop(1, '#13233f');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H/2);
      const floor = ctx.createLinearGradient(0, H/2, 0, H);
      floor.addColorStop(0, '#1a1a1a');
      floor.addColorStop(1, '#0c0c0c');
      ctx.fillStyle = floor;
      ctx.fillRect(0, H/2, W, H/2);

      // Simple horizon lines for motion feel
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = '#4af';
      for (let i = 0; i < 8; i++) {
        const z = i / 8;
        const y = H/2 + z * z * H/2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const p = s.player;
      const f = 1 / Math.tan(s.fov / 2);
      const centerX = W / 2;
      const groundY = H / 2; // horizon

      // Draw map walls (very simple vertical quads)
      const wallTop = groundY - H / 2;
      const wallSurfaces = (s.walls as Wall[]).map((w) => {
        const rx1 = w.x1 - p.x;
        const rz1 = w.z1 - p.z;
        const rx2 = w.x2 - p.x;
        const rz2 = w.z2 - p.z;
        const cx1 = Math.cos(p.yaw) * rx1 - Math.sin(p.yaw) * rz1;
        const cz1 = Math.cos(p.yaw) * rz1 + Math.sin(p.yaw) * rx1;
        const cx2 = Math.cos(p.yaw) * rx2 - Math.sin(p.yaw) * rz2;
        const cz2 = Math.cos(p.yaw) * rz2 + Math.sin(p.yaw) * rx2;
        const dist = Math.min(cz1, cz2);
        return { cx1, cz1, cx2, cz2, dist };
      }).sort((a, b) => b.dist - a.dist);

      for (const { cx1, cz1, cx2, cz2 } of wallSurfaces) {
        const EPS = 0.01;
        const z1 = Math.max(cz1, EPS);
        const z2 = Math.max(cz2, EPS);
        const sx1 = centerX + (cx1 / z1) * f * centerX;
        const sx2 = centerX + (cx2 / z2) * f * centerX;
        ctx.fillStyle = '#c2b280';
        ctx.strokeStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.moveTo(sx1, groundY);
        ctx.lineTo(sx2, groundY);
        ctx.lineTo(sx2, wallTop);
        ctx.lineTo(sx1, wallTop);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Project & draw enemies as billboards

      // Sort by distance back-to-front for proper overlap
      const sorted = [...s.enemies].sort((a: any, b: any) => {
        const da = (a.x - p.x) ** 2 + (a.z - p.z) ** 2;
        const db = (b.x - p.x) ** 2 + (b.z - p.z) ** 2;
        return db - da;
      });

      for (const e of sorted) {
        const rx = e.x - p.x;
        const rz = e.z - p.z;
        const cx = Math.cos(p.yaw) * rx - Math.sin(p.yaw) * rz;
        const cz = Math.cos(p.yaw) * rz + Math.sin(p.yaw) * rx;
        if (cz <= 0.1) continue;
        const sx = centerX + (cx / cz) * f * centerX;
        const scale = Math.min(300, Math.max(8, (120 / cz)));
        const sy = groundY - scale * 0.9;

        // Body
        ctx.save();
        // Fade out when dead
        const alpha = e.hp > 0 ? 1 : Math.max(0, 1 - (e.fade || 0) * 2.5);
        ctx.globalAlpha = alpha;
        const grd = ctx.createLinearGradient(sx, sy, sx, sy + scale);
        grd.addColorStop(0, '#ff4664');
        grd.addColorStop(1, '#a01234');
        ctx.fillStyle = grd;
        ctx.strokeStyle = '#22040a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(sx - scale * 0.25, sy, scale * 0.5, scale, 8);
        ctx.fill();
        ctx.stroke();
        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx, sy + scale * 0.35, scale * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(sx + scale * 0.02, sy + scale * 0.35, scale * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Crosshair with recoil
      const recoil = s.recoil;
      ctx.save();
      ctx.translate(centerX, groundY - 40);
      ctx.strokeStyle = '#d3e4ff';
      ctx.lineWidth = 2;
      const r = 12 + recoil * 10;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r - 8, 0); ctx.lineTo(-2, 0);
      ctx.moveTo(r + 8, 0); ctx.lineTo(2, 0);
      ctx.moveTo(0, -r - 8); ctx.lineTo(0, -2);
      ctx.moveTo(0, r + 8); ctx.lineTo(0, 2);
      ctx.stroke();
      ctx.restore();

      // HUD
      ctx.font = '14px ui-sans-serif, system-ui, -apple-system, Segoe UI';
      ctx.fillStyle = '#9fb6ff';
      ctx.fillText(`Score: ${score}`, 12, 22);
      ctx.fillText(`Wave: ${wave}`, 12, 42);
      // Health bar
      const hbw = 160, hbh = 10;
      ctx.fillStyle = '#34436b';
      ctx.fillRect(10, 56, hbw, hbh);
      ctx.fillStyle = health > 60 ? '#18d06b' : health > 25 ? '#f7c948' : '#ff5468';
      ctx.fillRect(10, 56, (Math.max(0, health) / 100) * hbw, hbh);
      ctx.strokeStyle = '#1b2540';
      ctx.strokeRect(10, 56, hbw, hbh);

      if (!s.mouseLocked || !s.alive) {
        // Center prompt overlay
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        const bw = Math.min(560, W - 40);
        ctx.fillRect((W - bw) / 2, H * 0.6 - 48, bw, 64);
        ctx.fillStyle = '#e6eeff';
        ctx.font = '16px ui-sans-serif, system-ui, -apple-system, Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(message, W / 2, H * 0.6 - 10);
        ctx.textAlign = 'left';
      }

      // Damage vignette
      if (s.damageOverlay > 0.01) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.5, s.damageOverlay * 0.6);
        ctx.fillStyle = '#ff0033';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
    };

    const frame = () => {
      const now = performance.now();
      let dt = (now - last) / 1000;
      if (dt > 0.05) dt = 0.05; // clamp
      last = now;

      if (stateRef.current.mouseLocked && stateRef.current.alive) {
        update(dt);
      }
      draw(dt);

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Click handler on canvas to lock pointer or (if already locked) shoot
  const handleCanvasClick = () => {
    const s = stateRef.current;
    if (!s) return;
    ensureAudio();
    if (!s.mouseLocked) {
      lockPointer();
    } else if (s.alive) {
      s.shootRequested = true;
    }
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