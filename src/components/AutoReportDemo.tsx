'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'idle' | 'countdown' | 'stopped' | 'alerting' | 'done';

/* ─── Packet dot that travels along dashed line ─── */
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
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            width: 5, height: 5, borderRadius: '50%',
            background: '#e53e3e', zIndex: 10, pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─── Contact pill (outside phone) ─── */
function ContactPill({ label, icon, received }: { label: string; icon: string; received: boolean }) {
  return (
    <motion.div
      animate={received ? { boxShadow: ['0 0 0 0 rgba(229,62,62,0)', '0 0 0 6px rgba(229,62,62,0.18)', '0 0 0 0 rgba(229,62,62,0)'] } : {}}
      transition={{ duration: 0.6 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        padding: '5px 8px', borderRadius: 10,
        border: `1px solid ${received ? 'rgba(229,62,62,0.45)' : 'rgba(0,0,0,0.1)'}`,
        background: received ? 'rgba(229,62,62,0.07)' : 'rgba(0,0,0,0.02)',
        transition: 'all 0.3s', minWidth: 44,
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 7, letterSpacing: '0.08em', color: received ? 'rgba(180,40,40,0.85)' : 'rgba(0,0,0,0.38)' }}>{label}</span>
      {received && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          style={{ fontSize: 6, color: 'rgba(180,40,40,0.65)', letterSpacing: '0.06em' }}
        >수신됨</motion.span>
      )}
    </motion.div>
  );
}

/* ─── Dashed line + contact (outside phone) ─── */
function LineAndContact({ label, icon, firing, delay, received }: {
  label: string; icon: string; firing: boolean; delay: number; received: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 52, height: 10, display: 'flex', alignItems: 'center' }}>
        <svg width="100%" height="10" style={{ display: 'block' }}>
          <line x1="0" y1="5" x2="100%" y2="5" stroke="rgba(0,0,0,0.13)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
        <PacketDot firing={firing} delay={delay} />
      </div>
      <ContactPill label={label} icon={icon} received={received} />
    </div>
  );
}

/* ─── Phone screen content (simplified — no contacts inside) ─── */
function PhoneScreen({ phase, count, onShock, onStop, onReset }: {
  phase: Phase; count: number;
  onShock: () => void; onStop: () => void; onReset: () => void;
}) {
  const disabled = phase !== 'idle';
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Status bar */}
      <div style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '3px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 5.5, color: 'rgba(0,0,0,0.28)', letterSpacing: '0.1em' }}>9:41</span>
        <span style={{ fontSize: 5.5, color: 'rgba(0,0,0,0.28)' }}>●●●</span>
      </div>
      {/* App title */}
      <div style={{ padding: '5px 8px 4px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 7, letterSpacing: '0.22em', color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>자동신고</span>
      </div>

      {/* Buttons & phase label */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px' }}>
        {/* 충격 button */}
        <motion.button
          whileTap={disabled ? {} : { scale: 0.92 }}
          onClick={disabled ? undefined : onShock}
          style={{
            width: 56, padding: '8px 0', fontSize: 9, letterSpacing: '0.14em',
            background: disabled ? 'rgba(0,0,0,0.04)' : 'rgba(220,50,50,0.1)',
            border: `1px solid ${disabled ? 'rgba(0,0,0,0.1)' : 'rgba(220,50,50,0.3)'}`,
            borderRadius: 10, color: disabled ? 'rgba(0,0,0,0.22)' : 'rgba(200,40,40,0.8)',
            cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>⚡</span>
          <span>충격</span>
        </motion.button>

        {/* 스탑 button */}
        <AnimatePresence>
          {phase === 'countdown' && (
            <motion.button
              key="stop"
              initial={{ opacity: 0, scale: 0.7, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.22 }}
              whileTap={{ scale: 0.9 }}
              onClick={onStop}
              style={{
                width: 56, padding: '7px 0', fontSize: 8, letterSpacing: '0.08em',
                background: 'rgba(66,153,225,0.1)', border: '1px solid rgba(66,153,225,0.4)',
                borderRadius: 10, color: 'rgba(30,100,200,0.8)', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>✋</span>
              <span>스탑 ({count})</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Phase label */}
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ fontSize: 7, color: 'rgba(0,0,0,0.18)', letterSpacing: '0.1em' }}>대기중</motion.span>
          )}
          {phase === 'countdown' && (
            <motion.span key="cd" initial={{ opacity: 0, scale: 1.3 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              style={{ fontSize: 18, fontWeight: 600, color: 'rgba(200,40,40,0.75)', lineHeight: 1 }}>{count}</motion.span>
          )}
          {phase === 'stopped' && (
            <motion.span key="stopped" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ fontSize: 7, color: 'rgba(66,153,225,0.7)', letterSpacing: '0.08em' }}>취소됨</motion.span>
          )}
          {phase === 'alerting' && (
            <motion.span key="alerting" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 1] }} exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{ fontSize: 7, color: 'rgba(200,40,40,0.7)', letterSpacing: '0.08em' }}>신고중…</motion.span>
          )}
          {phase === 'done' && (
            <motion.button key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onReset}
              style={{ padding: '3px 10px', fontSize: 6.5, letterSpacing: '0.06em', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 7, color: 'rgba(0,0,0,0.35)', cursor: 'pointer', fontFamily: 'inherit' }}
            >다시</motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function AutoReportDemo({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [count, setCount] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
  }, []);

  const handleShock = () => {
    if (phase !== 'idle') return;
    setCount(3); setPhase('countdown');
    let remaining = 3;
    timerRef.current = setInterval(() => {
      remaining--;
      setCount(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current!); timerRef.current = null;
        setPhase('alerting');
        alertTimerRef.current = setTimeout(() => setPhase('done'), 900);
      }
    }, 1000);
  };

  const handleStop = () => {
    if (phase !== 'countdown') return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setPhase('stopped');
    alertTimerRef.current = setTimeout(() => { setPhase('idle'); setCount(3); }, 1000);
  };

  const alertFiring = phase === 'alerting';
  const contactsReceived = phase === 'done';

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
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">자동신고</h2>
      </motion.div>

      <div className="flex-1 flex items-center justify-center" style={{ paddingBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {/* Phone */}
          <div style={{
            background: 'linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 100%)',
            borderRadius: 28, padding: '10px 7px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 6px 24px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.1)',
            gap: 5, width: 180, height: 340, flexShrink: 0,
          }}>
            <div style={{ width: 32, height: 7, background: '#000', borderRadius: 10 }} />
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <PhoneScreen phase={phase} count={count} onShock={handleShock} onStop={handleStop} onReset={() => { setPhase('idle'); setCount(3); }} />
            </div>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Contacts — outside the phone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginLeft: 8 }}>
            <LineAndContact label="지인들" icon="👥" firing={alertFiring} delay={0}    received={contactsReceived} />
            <LineAndContact label="경찰서" icon="🚔" firing={alertFiring} delay={0.15} received={contactsReceived} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
