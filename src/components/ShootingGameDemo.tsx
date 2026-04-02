'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';

/* ─── Constants ──────────────────────────────────────── */
const W = 172;
const H = 270;
const PLAYER_W = 16;
const PLAYER_H = 12;
const BULLET_W = 3;
const BULLET_H = 8;
const ENEMY_R = 6; // radius
const PLAYER_SPEED = 2.5;
const BULLET_SPEED = 4;
const ENEMY_SPEED = 0.9;
const SPAWN_INTERVAL = 90; // frames between spawns
const SPAWN_COUNT = 3;

/* ─── Static stars ───────────────────────────────────── */
const STARS: { x: number; y: number; r: number; o: number }[] = Array.from(
  { length: 28 },
  (_, i) => ({
    x: ((i * 137.5) % W),
    y: ((i * 79.3) % H),
    r: i % 3 === 0 ? 1.5 : 1,
    o: 0.3 + (i % 5) * 0.1,
  }),
);

/* ─── Types ──────────────────────────────────────────── */
interface Bullet {
  id: number;
  x: number;
  y: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  dx: number; // zigzag horizontal drift
}

interface GameState {
  playerX: number;
  bullets: Bullet[];
  enemies: Enemy[];
  score: number;
  frame: number;
  spawnTimer: number;
  nextId: number;
  keys: { left: boolean; right: boolean; space: boolean };
  spacePrev: boolean;
}

type Phase = 'idle' | 'playing' | 'gameover';

/* ─── Game Canvas ────────────────────────────────────── */
function GameCanvas({
  phase,
  onStart,
  onRestart,
}: {
  phase: Phase;
  onStart: () => void;
  onRestart: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const phaseRef = useRef<Phase>(phase);
  const rafRef = useRef<number>(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayPhase, setDisplayPhase] = useState<Phase>(phase);

  // Keep phaseRef in sync
  useEffect(() => {
    phaseRef.current = phase;
    setDisplayPhase(phase);
  }, [phase]);

  const initState = useCallback((): GameState => ({
    playerX: W / 2 - PLAYER_W / 2,
    bullets: [],
    enemies: [],
    score: 0,
    frame: 0,
    spawnTimer: 0,
    nextId: 1,
    keys: { left: false, right: false, space: false },
    spacePrev: false,
  }), []);

  // Key handlers
  useEffect(() => {
    if (phase !== 'playing') return;

    const down = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      if (e.key === 'ArrowLeft')  stateRef.current.keys.left  = true;
      if (e.key === 'ArrowRight') stateRef.current.keys.right = true;
      if (e.key === ' ')          stateRef.current.keys.space = true;
      if (['ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      if (e.key === 'ArrowLeft')  stateRef.current.keys.left  = false;
      if (e.key === 'ArrowRight') stateRef.current.keys.right = false;
      if (e.key === ' ')          stateRef.current.keys.space = false;
    };
    document.addEventListener('keydown', down);
    document.addEventListener('keyup', up);
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('keyup', up);
    };
  }, [phase]);

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') return;

    stateRef.current = initState();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastScoreUpdate = 0;

    const tick = () => {
      if (phaseRef.current !== 'playing') return;
      const s = stateRef.current!;
      s.frame++;

      // ── Player movement ──
      if (s.keys.left)  s.playerX = Math.max(0, s.playerX - PLAYER_SPEED);
      if (s.keys.right) s.playerX = Math.min(W - PLAYER_W, s.playerX + PLAYER_SPEED);

      // ── Fire bullet on space (edge trigger) ──
      if (s.keys.space && !s.spacePrev) {
        s.bullets.push({
          id: s.nextId++,
          x: s.playerX + PLAYER_W / 2 - BULLET_W / 2,
          y: H - PLAYER_H - 24,
        });
      }
      s.spacePrev = s.keys.space;

      // ── Move bullets ──
      s.bullets = s.bullets
        .map((b) => ({ ...b, y: b.y - BULLET_SPEED }))
        .filter((b) => b.y + BULLET_H > 0);

      // ── Spawn enemies ──
      s.spawnTimer++;
      if (s.spawnTimer >= SPAWN_INTERVAL) {
        s.spawnTimer = 0;
        for (let i = 0; i < SPAWN_COUNT; i++) {
          const ex = ENEMY_R + Math.random() * (W - ENEMY_R * 2);
          s.enemies.push({
            id: s.nextId++,
            x: ex,
            y: -ENEMY_R,
            dx: (Math.random() - 0.5) * 1.4,
          });
        }
      }

      // ── Move enemies ──
      s.enemies = s.enemies.map((e) => {
        let nx = e.x + e.dx;
        let ndx = e.dx;
        if (nx - ENEMY_R < 0 || nx + ENEMY_R > W) {
          ndx = -ndx;
          nx = e.x + ndx;
        }
        return { ...e, x: nx, y: e.y + ENEMY_SPEED, dx: ndx };
      });

      // ── Collision: bullet vs enemy ──
      const destroyedEnemies = new Set<number>();
      const destroyedBullets = new Set<number>();

      for (const b of s.bullets) {
        for (const e of s.enemies) {
          const bCx = b.x + BULLET_W / 2;
          const bCy = b.y + BULLET_H / 2;
          const dist = Math.hypot(bCx - e.x, bCy - e.y);
          if (dist < ENEMY_R + BULLET_W) {
            destroyedEnemies.add(e.id);
            destroyedBullets.add(b.id);
            s.score++;
          }
        }
      }

      s.enemies  = s.enemies.filter((e) => !destroyedEnemies.has(e.id));
      s.bullets  = s.bullets.filter((b) => !destroyedBullets.has(b.id));

      // ── Game over checks ──
      const playerCx = s.playerX + PLAYER_W / 2;
      const playerCy = H - PLAYER_H / 2 - 20;

      for (const e of s.enemies) {
        // Enemy reaches bottom
        if (e.y + ENEMY_R >= H) {
          phaseRef.current = 'gameover';
          setDisplayPhase('gameover');
          setDisplayScore(s.score);
          cancelAnimationFrame(rafRef.current);
          return;
        }
        // Enemy hits player
        if (Math.hypot(e.x - playerCx, e.y - playerCy) < ENEMY_R + PLAYER_W / 2) {
          phaseRef.current = 'gameover';
          setDisplayPhase('gameover');
          setDisplayScore(s.score);
          cancelAnimationFrame(rafRef.current);
          return;
        }
      }

      // ── Score update (throttled) ──
      if (s.score !== lastScoreUpdate) {
        lastScoreUpdate = s.score;
        setDisplayScore(s.score);
      }

      // ── Draw ──
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (const star of STARS) {
        ctx.globalAlpha = star.o;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Bullets
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 4;
      for (const b of s.bullets) {
        ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H);
      }
      ctx.shadowBlur = 0;

      // Enemies
      for (const e of s.enemies) {
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, ENEMY_R);
        grad.addColorStop(0, '#ff6060');
        grad.addColorStop(1, '#cc2200');
        ctx.shadowColor = '#ff4422';
        ctx.shadowBlur = 6;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, ENEMY_R, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Player (upward-pointing triangle)
      const px = s.playerX;
      const py = H - PLAYER_H - 20;
      ctx.fillStyle = '#e8eaf6';
      ctx.shadowColor = '#90caf9';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(px + PLAYER_W / 2, py);
      ctx.lineTo(px + PLAYER_W, py + PLAYER_H);
      ctx.lineTo(px, py + PLAYER_H);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Score
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '8px monospace';
      ctx.fillText(`SCORE  ${s.score}`, 8, 14);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, initState]);

  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: 'block', borderRadius: 8 }}
      />

      {/* Idle overlay */}
      {displayPhase === 'idle' && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0a0a1a',
            borderRadius: 8,
            gap: 10,
          }}
        >
          {/* Stars in idle */}
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            {STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={`rgba(255,255,255,${s.o})`} />
            ))}
          </svg>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.35em', zIndex: 1 }}>
            슈팅게임
          </span>
          <button
            onClick={onStart}
            style={{
              zIndex: 1,
              padding: '5px 20px',
              fontSize: 8,
              letterSpacing: '0.3em',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20,
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontFamily: 'monospace',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            START
          </button>
        </div>
      )}

      {/* Game over overlay */}
      {displayPhase === 'gameover' && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,10,26,0.88)',
            borderRadius: 8,
            gap: 8,
          }}
        >
          <span style={{ fontSize: 9, color: 'rgba(255,80,80,0.9)', letterSpacing: '0.35em' }}>
            GAME OVER
          </span>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', fontFamily: 'monospace' }}>
            SCORE  {displayScore}
          </span>
          <button
            onClick={onRestart}
            style={{
              marginTop: 4,
              padding: '5px 20px',
              fontSize: 8,
              letterSpacing: '0.3em',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20,
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontFamily: 'monospace',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            RESTART
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export function ShootingGameDemo({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');

  const handleStart   = useCallback(() => setPhase('playing'), []);
  const handleRestart = useCallback(() => {
    setPhase('idle');
    // Give React a tick to reset, then start fresh
    requestAnimationFrame(() => setPhase('playing'));
  }, []);

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
        onClick={onBack}
        className="absolute top-8 left-8 z-20 flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none"
      >
        <span className="text-base leading-none text-black/20 group-hover:text-black transition-colors duration-200">‹</span>
        <span className="text-[0.58rem] tracking-[0.28em] text-black/25 group-hover:text-black transition-colors duration-200 uppercase">뒤로가기</span>
      </motion.button>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
        className="flex flex-col items-center gap-1 pt-16 pb-3 shrink-0"
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">인제대학교</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">슈팅게임</h2>
      </motion.div>

      {/* Phone + controls */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ paddingBottom: 16 }}>
        {/* Phone shell */}
        <div
          style={{
            width: 200,
            height: 390,
            background: 'linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 100%)',
            borderRadius: 28,
            padding: '10px 7px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 6px 24px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.1)',
            gap: 4,
          }}
        >
          {/* Notch */}
          <div
            style={{
              width: 32,
              height: 7,
              background: '#000',
              borderRadius: 10,
              flexShrink: 0,
            }}
          />

          {/* Screen */}
          <div
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: 12,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <GameCanvas
              phase={phase}
              onStart={handleStart}
              onRestart={handleRestart}
            />
          </div>

          {/* Home button */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.06)',
              flexShrink: 0,
            }}
          />
        </div>

        {/* Controls hint */}
        <p style={{ fontSize: 9, color: 'rgba(0,0,0,0.2)', letterSpacing: '0.2em', marginTop: 8 }}>
          ← → 이동 · SPACE 발사
        </p>
      </div>
    </div>
  );
}
