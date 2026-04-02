'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'idle' | 'countdown' | 'stopped' | 'alerting' | 'done';

/* ─── Animated dashed-line packet ───────────────────────── */
function PacketDot({ firing, delay = 0 }: { firing: boolean; delay?: number }) {
  return (
    <AnimatePresence>
      {firing && (
        <motion.div
          key="dot"
          initial={{ left: 0, opacity: 0 }}
          animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, delay, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#e53e3e',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─── Contact pill ───────────────────────────────────────── */
function ContactPill({
  label,
  received,
  icon,
}: {
  label: string;
  received: boolean;
  icon: string;
}) {
  return (
    <motion.div
      animate={
        received
          ? {
              boxShadow: [
                '0 0 0 0 rgba(229,62,62,0)',
                '0 0 0 6px rgba(229,62,62,0.18)',
                '0 0 0 0 rgba(229,62,62,0)',
              ],
            }
          : {}
      }
      transition={{ duration: 0.6 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: '4px 6px',
        borderRadius: 8,
        border: `1px solid ${received ? 'rgba(229,62,62,0.45)' : 'rgba(0,0,0,0.1)'}`,
        background: received ? 'rgba(229,62,62,0.07)' : 'rgba(0,0,0,0.02)',
        transition: 'all 0.3s',
        minWidth: 36,
      }}
    >
      <span style={{ fontSize: 11 }}>{icon}</span>
      <span
        style={{
          fontSize: 6.5,
          letterSpacing: '0.08em',
          color: received ? 'rgba(180,40,40,0.85)' : 'rgba(0,0,0,0.38)',
        }}
      >
        {label}
      </span>
      {received && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ fontSize: 6, color: 'rgba(180,40,40,0.7)', letterSpacing: '0.06em' }}
        >
          수신됨
        </motion.span>
      )}
    </motion.div>
  );
}

/* ─── Phone Screen Content ───────────────────────────────── */
function PhoneScreen({
  phase,
  count,
  onShock,
  onStop,
  onReset,
}: {
  phase: Phase;
  count: number;
  onShock: () => void;
  onStop: () => void;
  onReset: () => void;
}) {
  const alertFiring = phase === 'alerting';
  const contactsReceived = phase === 'done';

  const chunggyokDisabled = phase !== 'idle';
  const stopVisible = phase === 'countdown';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Status bar */}
      <div
        style={{
          background: 'rgba(0,0,0,0.03)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '3px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 5.5, color: 'rgba(0,0,0,0.28)', letterSpacing: '0.1em' }}>9:41</span>
        <span style={{ fontSize: 5.5, color: 'rgba(0,0,0,0.28)' }}>●●●</span>
      </div>

      {/* App title bar */}
      <div
        style={{
          padding: '5px 8px 4px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: 7,
            letterSpacing: '0.22em',
            color: 'rgba(0,0,0,0.4)',
            fontWeight: 500,
          }}
        >
          자동신고
        </span>
      </div>

      {/* Main 3-column layout */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          position: 'relative',
          gap: 0,
        }}
      >
        {/* Left: action buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0,
            width: 40,
          }}
        >
          {/* 충격 button */}
          <motion.button
            whileTap={chunggyokDisabled ? {} : { scale: 0.92 }}
            onClick={chunggyokDisabled ? undefined : onShock}
            style={{
              width: 40,
              padding: '5px 0',
              fontSize: 8.5,
              letterSpacing: '0.14em',
              background: chunggyokDisabled ? 'rgba(0,0,0,0.04)' : 'rgba(220,50,50,0.1)',
              border: `1px solid ${chunggyokDisabled ? 'rgba(0,0,0,0.1)' : 'rgba(220,50,50,0.3)'}`,
              borderRadius: 7,
              color: chunggyokDisabled ? 'rgba(0,0,0,0.22)' : 'rgba(200,40,40,0.8)',
              cursor: chunggyokDisabled ? 'default' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 12, lineHeight: 1 }}>⚡</span>
            <span>충격</span>
          </motion.button>

          {/* 스탑 button (AnimatePresence) */}
          <AnimatePresence>
            {stopVisible && (
              <motion.button
                key="stop"
                initial={{ opacity: 0, scale: 0.7, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: -4 }}
                transition={{ duration: 0.22 }}
                whileTap={{ scale: 0.9 }}
                onClick={onStop}
                style={{
                  width: 40,
                  padding: '5px 0',
                  fontSize: 7,
                  letterSpacing: '0.08em',
                  background: 'rgba(66,153,225,0.1)',
                  border: '1px solid rgba(66,153,225,0.4)',
                  borderRadius: 7,
                  color: 'rgba(30,100,200,0.8)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <span style={{ fontSize: 10, lineHeight: 1 }}>✋</span>
                <span>스탑 ({count})</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* done: reset hint */}
          <AnimatePresence>
            {phase === 'done' && (
              <motion.button
                key="reset"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={onReset}
                style={{
                  width: 40,
                  padding: '4px 0',
                  fontSize: 6.5,
                  letterSpacing: '0.06em',
                  background: 'rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 7,
                  color: 'rgba(0,0,0,0.35)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                다시
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Middle: dashed lines with animated packets */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: '0 4px',
            position: 'relative',
          }}
        >
          {/* Line to 지인들 */}
          <div style={{ position: 'relative', height: 10, display: 'flex', alignItems: 'center' }}>
            <svg width="100%" height="10" style={{ overflow: 'visible', display: 'block' }}>
              <line
                x1="0"
                y1="5"
                x2="100%"
                y2="5"
                stroke="rgba(0,0,0,0.12)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </svg>
            <PacketDot firing={alertFiring} delay={0} />
          </div>

          {/* Line to 경찰서 */}
          <div style={{ position: 'relative', height: 10, display: 'flex', alignItems: 'center' }}>
            <svg width="100%" height="10" style={{ overflow: 'visible', display: 'block' }}>
              <line
                x1="0"
                y1="5"
                x2="100%"
                y2="5"
                stroke="rgba(0,0,0,0.12)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </svg>
            <PacketDot firing={alertFiring} delay={0.12} />
          </div>

          {/* Phase label in center */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          >
            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 6, color: 'rgba(0,0,0,0.18)', letterSpacing: '0.1em' }}
                >
                  대기중
                </motion.span>
              )}
              {phase === 'countdown' && (
                <motion.span
                  key="cd"
                  initial={{ opacity: 0, scale: 1.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'rgba(200,40,40,0.75)',
                    lineHeight: 1,
                  }}
                >
                  {count}
                </motion.span>
              )}
              {phase === 'stopped' && (
                <motion.span
                  key="stopped"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 6, color: 'rgba(66,153,225,0.7)', letterSpacing: '0.08em' }}
                >
                  취소됨
                </motion.span>
              )}
              {phase === 'alerting' && (
                <motion.span
                  key="alerting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{ fontSize: 6, color: 'rgba(200,40,40,0.7)', letterSpacing: '0.08em' }}
                >
                  신고중
                </motion.span>
              )}
              {phase === 'done' && (
                <motion.span
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: 6, color: 'rgba(40,160,80,0.7)', letterSpacing: '0.08em' }}
                >
                  완료
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: contact targets */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flexShrink: 0,
            alignItems: 'flex-end',
          }}
        >
          <ContactPill label="지인들" received={contactsReceived} icon="👥" />
          <ContactPill label="경찰서" received={contactsReceived} icon="🚔" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export function AutoReportDemo({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [count, setCount] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, []);

  const handleShock = () => {
    if (phase !== 'idle') return;
    setCount(3);
    setPhase('countdown');

    let remaining = 3;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setCount(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setPhase('alerting');
        // After animation (~700ms), transition to done
        alertTimerRef.current = setTimeout(() => {
          setPhase('done');
        }, 900);
      }
    }, 1000);
  };

  const handleStop = () => {
    if (phase !== 'countdown') return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPhase('stopped');
    // Auto-reset to idle after 1s
    alertTimerRef.current = setTimeout(() => {
      setPhase('idle');
      setCount(3);
    }, 1000);
  };

  const handleReset = () => {
    setPhase('idle');
    setCount(3);
  };

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
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">자동신고</h2>
      </motion.div>

      {/* Phone centered in remaining space */}
      <div className="flex-1 flex items-center justify-center" style={{ paddingBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            background: 'linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 100%)',
            borderRadius: 28,
            padding: '10px 7px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 6px 24px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.1)',
            gap: 5,
            width: 200,
            height: 380,
          }}
        >
          {/* Notch */}
          <div style={{ width: 32, height: 7, background: '#000', borderRadius: 10 }} />

          {/* Screen */}
          <div
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: 12,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <PhoneScreen
              phase={phase}
              count={count}
              onShock={handleShock}
              onStop={handleStop}
              onReset={handleReset}
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
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
