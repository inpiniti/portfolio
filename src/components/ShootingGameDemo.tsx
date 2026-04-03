'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';

const W = 172;
const H = 270;
const PLAYER_W = 16;
const PLAYER_SPEED = 2.5;
const BULLET_SPEED = 5;
const ENEMY_SPEED = 0.8;
const ENEMY_SPAWN_INTERVAL = 90;
const EXPLOSION_LIFETIME = 55; // frames (~0.9s)

interface Bullet    { id: number; x: number; y: number }
interface Enemy     { id: number; x: number; y: number; vx: number }
interface Explosion { id: number; x: number; y: number; createdFrame: number }

const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: (i * 67 + 13) % W,
  y: (i * 43 + 7) % H,
  r: (i % 3) * 0.5 + 0.4,
  op: (i % 5) * 0.1 + 0.15,
}));

export function ShootingGameDemo({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [, setRenderTick] = useState(0);

  const playerX     = useRef(W / 2 - PLAYER_W / 2);
  const bullets     = useRef<Bullet[]>([]);
  const enemies     = useRef<Enemy[]>([]);
  const explosions  = useRef<Explosion[]>([]);
  const keys        = useRef<Record<string, boolean>>({});
  const frameRef    = useRef(0);
  const frameCount  = useRef(0); // exposed for opacity calc in render
  const bulletId    = useRef(0);
  const enemyId     = useRef(0);
  const explosionId = useRef(0);
  const spawnCount  = useRef(0);
  const scoreRef    = useRef(0);

  const startGame = useCallback(() => {
    playerX.current    = W / 2 - PLAYER_W / 2;
    bullets.current    = [];
    enemies.current    = [];
    explosions.current = [];
    scoreRef.current   = 0;
    spawnCount.current = 0;
    setScore(0);
    setGameState('playing');
  }, []);

  useEffect(() => {
    const dn = (e: KeyboardEvent) => { keys.current[e.code] = true;  if (e.code === 'Space') e.preventDefault(); };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let lastShot = 0;
    let frame = 0;

    const loop = () => {
      frame++;
      frameCount.current = frame;

      if (keys.current['ArrowLeft'])  playerX.current = Math.max(0, playerX.current - PLAYER_SPEED);
      if (keys.current['ArrowRight']) playerX.current = Math.min(W - PLAYER_W, playerX.current + PLAYER_SPEED);

      if (keys.current['Space'] && frame - lastShot > 12) {
        lastShot = frame;
        bullets.current.push({ id: bulletId.current++, x: playerX.current + PLAYER_W / 2 - 1.5, y: H - 30 });
      }

      bullets.current = bullets.current.map(b => ({ ...b, y: b.y - BULLET_SPEED })).filter(b => b.y > -10);

      spawnCount.current++;
      if (spawnCount.current >= ENEMY_SPAWN_INTERVAL) {
        spawnCount.current = 0;
        const n = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < n; i++)
          enemies.current.push({ id: enemyId.current++, x: Math.random() * (W - 14), y: -14, vx: (Math.random() - 0.5) * 1.2 });
      }

      enemies.current = enemies.current.map(e => ({
        ...e,
        x: Math.max(0, Math.min(W - 14, e.x + e.vx)),
        y: e.y + ENEMY_SPEED,
        vx: (e.x <= 0 || e.x >= W - 14) ? -e.vx : e.vx,
      }));

      const hitE = new Set<number>(), hitB = new Set<number>();
      for (const b of bullets.current) {
        for (const e of enemies.current) {
          if (!hitE.has(e.id) && b.x > e.x - 4 && b.x < e.x + 18 && b.y > e.y - 4 && b.y < e.y + 14) {
            hitE.add(e.id); hitB.add(b.id);
            explosions.current.push({ id: explosionId.current++, x: e.x + 7, y: e.y + 7, createdFrame: frame });
            scoreRef.current++;
          }
        }
      }
      if (hitE.size > 0) {
        enemies.current = enemies.current.filter(e => !hitE.has(e.id));
        bullets.current = bullets.current.filter(b => !hitB.has(b.id));
        setScore(scoreRef.current);
      }

      // Remove explosions older than EXPLOSION_LIFETIME frames
      explosions.current = explosions.current.filter(ex => frame - ex.createdFrame < EXPLOSION_LIFETIME);

      const px = playerX.current;
      const gameover = enemies.current.some(e =>
        (e.y > H - 28 && e.x + 14 > px && e.x < px + PLAYER_W) || e.y > H
      );
      if (gameover) { setGameState('gameover'); return; }

      setRenderTick(t => t + 1);
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState]);

  const px = playerX.current;

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <motion.button
        initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
        onClick={onBack}
        className="absolute top-8 left-8 z-20 flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none"
      >
        <span className="text-base leading-none text-black/20 group-hover:text-black transition-colors duration-200">‹</span>
        <span className="text-[0.58rem] tracking-[0.28em] text-black/25 group-hover:text-black transition-colors duration-200 uppercase">뒤로가기</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
        className="flex flex-col items-center gap-1 pt-16 pb-3 shrink-0"
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">인제대학교</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">슈팅게임</h2>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center" style={{ paddingBottom: 16 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            background: 'linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 100%)',
            borderRadius: 28, padding: '10px 7px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 6px 24px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.1)',
            gap: 5, width: 200,
          }}
        >
          <div style={{ width: 32, height: 7, background: '#000', borderRadius: 10 }} />

          <div style={{ width: W, height: H, background: '#06061a', borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            <svg style={{ position: 'absolute', inset: 0 }} width={W} height={H}>
              {STARS.map(s => <circle key={s.id} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.op} />)}
            </svg>

            <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 8, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', zIndex: 2 }}>
              {score.toString().padStart(4, '0')}
            </div>

            {gameState === 'idle' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <div style={{ fontSize: 22 }}>🚀</div>
                <button onClick={startGame} style={{ padding: '5px 14px', fontSize: 8, letterSpacing: '0.2em', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  START
                </button>
              </div>
            )}

            {gameState === 'gameover' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(0,0,0,0.6)' }}>
                <span style={{ fontSize: 9, color: 'rgba(255,100,100,0.9)', letterSpacing: '0.15em' }}>GAME OVER</span>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em' }}>SCORE {score}</span>
                <button onClick={startGame} style={{ marginTop: 4, padding: '4px 12px', fontSize: 7.5, letterSpacing: '0.18em', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 5, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit' }}>
                  RESTART
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <>
                <svg style={{ position: 'absolute', left: px, bottom: 18, width: PLAYER_W, height: 18 }} viewBox="0 0 16 18">
                  <polygon points="8,0 0,18 4,14 12,14 16,18" fill="#a0d8ef" />
                  <polygon points="8,4 4,14 12,14" fill="#e0f4ff" />
                </svg>
                {bullets.current.map(b => (
                  <div key={b.id} style={{ position: 'absolute', left: b.x, top: b.y, width: 3, height: 8, background: '#ffd700', borderRadius: 2, boxShadow: '0 0 4px #ffd700' }} />
                ))}
                {enemies.current.map(e => (
                  <div key={e.id} style={{ position: 'absolute', left: e.x, top: e.y, width: 14, height: 14, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #ff8040, #c02000)', boxShadow: '0 0 5px rgba(255,80,0,0.5)' }} />
                ))}
                {/* Explosions fade out based on age */}
                {explosions.current.map(ex => {
                  const age = frameCount.current - ex.createdFrame;
                  const opacity = Math.max(0, 1 - age / EXPLOSION_LIFETIME);
                  const scale = 1 + age / EXPLOSION_LIFETIME;
                  return (
                    <div key={ex.id} style={{
                      position: 'absolute',
                      left: ex.x - 10, top: ex.y - 10,
                      width: 20, height: 20,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #ffe066, rgba(255,100,0,0))',
                      transform: `scale(${scale})`,
                      opacity,
                      pointerEvents: 'none',
                    }} />
                  );
                })}
              </>
            )}
          </div>

          <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)' }} />
        </motion.div>
        <p style={{ fontSize: 9, color: 'rgba(0,0,0,0.2)', letterSpacing: '0.2em', marginTop: 10 }}>← → 이동 · SPACE 발사</p>
      </div>
    </div>
  );
}
