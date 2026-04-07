'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Types ─────────────────────────────────────── */
type SeatStatus = 'empty' | 'inuse' | 'offline';

interface Seat {
  id: string;
  label: string;
  x: number; // grid col (0-based)
  y: number; // grid row (0-based)
  status: SeatStatus;
  user?: string;
  loginTime?: string;
}

type AppMode = 'select' | 'admin' | 'user-login' | 'user-using';

/* ─── Initial layout ──────────────────────────────── */
const INITIAL_SEATS: Seat[] = [
  { id: 'A1', label: 'A1', x: 0, y: 0, status: 'empty' },
  { id: 'A2', label: 'A2', x: 1, y: 0, status: 'inuse', user: '김철수', loginTime: '09:12' },
  { id: 'A3', label: 'A3', x: 2, y: 0, status: 'empty' },
  { id: 'A4', label: 'A4', x: 3, y: 0, status: 'offline' },
  { id: 'B1', label: 'B1', x: 0, y: 1, status: 'inuse', user: '이영희', loginTime: '08:55' },
  { id: 'B2', label: 'B2', x: 1, y: 1, status: 'empty' },
  { id: 'B3', label: 'B3', x: 2, y: 1, status: 'empty' },
  { id: 'B4', label: 'B4', x: 3, y: 1, status: 'empty' },
  { id: 'C1', label: 'C1', x: 0, y: 2, status: 'empty' },
  { id: 'C2', label: 'C2', x: 1, y: 2, status: 'inuse', user: '박민수', loginTime: '10:03' },
  { id: 'C3', label: 'C3', x: 2, y: 2, status: 'offline' },
  { id: 'C4', label: 'C4', x: 3, y: 2, status: 'empty' },
];

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
      onClick={onBack}
      className="absolute top-8 left-8 z-20 flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none"
    >
      <span className="text-base leading-none text-black/20 group-hover:text-black transition-colors duration-200">‹</span>
      <span className="text-[0.58rem] tracking-[0.28em] text-black/25 group-hover:text-black transition-colors duration-200 uppercase">
        뒤로가기
      </span>
    </motion.button>
  );
}

/* ─── PC Icon SVG ─────────────────────────────────── */
function PcIcon({ status, size = 32 }: { status: SeatStatus; size?: number }) {
  const bodyColor =
    status === 'inuse' ? '#2563eb' : status === 'offline' ? '#d1d5db' : '#f3f4f6';
  const screenColor =
    status === 'inuse' ? '#93c5fd' : status === 'offline' ? '#e5e7eb' : '#e0f2fe';
  const borderColor =
    status === 'inuse' ? '#1d4ed8' : status === 'offline' ? '#9ca3af' : '#cbd5e1';

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="4" width="26" height="18" rx="2.5" fill={bodyColor} stroke={borderColor} strokeWidth="1.2" />
      <rect x="6" y="7" width="20" height="12" rx="1.5" fill={screenColor} />
      {status === 'inuse' && (
        <>
          <rect x="9" y="10" width="14" height="1.5" rx="0.75" fill="#bfdbfe" />
          <rect x="9" y="13" width="9" height="1.5" rx="0.75" fill="#bfdbfe" />
        </>
      )}
      {status === 'empty' && (
        <circle cx="16" cy="13" r="3" fill="#bae6fd" />
      )}
      {status === 'offline' && (
        <line x1="10" y1="10" x2="22" y2="18" stroke="#9ca3af" strokeWidth="1.5" />
      )}
      <rect x="13" y="22" width="6" height="3" rx="0.5" fill={borderColor} />
      <rect x="10" y="25" width="12" height="1.5" rx="0.75" fill={borderColor} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   Mode Select Screen
═══════════════════════════════════════════════════ */
function ModeSelectScreen({
  onMode,
}: {
  onMode: (m: 'admin' | 'user-login') => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 h-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="flex flex-col items-center gap-1"
      >
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">Onware</p>
        <h2 className="text-[0.9rem] font-light tracking-[0.35em] text-black/55">유연 좌석 시스템</h2>
        <p className="text-[0.5rem] tracking-[0.2em] text-black/28 mt-0.5">Flexible Seating System</p>
      </motion.div>

      <motion.div
        className="flex gap-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {[
          { key: 'admin' as const, label: '관리자', sub: 'PC 배치 관리', icon: '⚙️' },
          { key: 'user-login' as const, label: '사용자', sub: 'PC 로그인 · 사용', icon: '👤' },
        ].map((m) => (
          <motion.button
            key={m.key}
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onMode(m.key)}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-black/8 bg-white/80 shadow-sm cursor-pointer w-28"
          >
            <span className="text-2xl">{m.icon}</span>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[0.68rem] font-medium tracking-[0.15em] text-black/60">{m.label}</span>
              <span className="text-[0.44rem] tracking-[0.1em] text-black/28">{m.sub}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Admin Screen  —  drag & drop seat layout
═══════════════════════════════════════════════════ */
function AdminScreen({
  seats,
  onSeatsChange,
  onBack,
}: {
  seats: Seat[];
  onSeatsChange: (s: Seat[]) => void;
  onBack: () => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const toggleOffline = useCallback((id: string) => {
    onSeatsChange(
      seats.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'offline' ? 'empty' : 'offline' }
          : s,
      ),
    );
    showToast('PC 상태가 변경되었습니다');
  }, [seats, onSeatsChange]);

  const moveSeat = useCallback((id: string, nx: number, ny: number) => {
    const occupied = seats.find((s) => s.x === nx && s.y === ny && s.id !== id);
    if (occupied) return;
    onSeatsChange(seats.map((s) => s.id === id ? { ...s, x: nx, y: ny } : s));
    showToast('좌석 이동 완료');
  }, [seats, onSeatsChange]);

  const COLS = 5;
  const ROWS = 4;
  const CELL = 52;

  return (
    <div className="relative flex flex-col h-full w-full">
      <BackButton onBack={onBack} />

      <motion.div
        className="flex flex-col items-center gap-1 pt-14 pb-4 shrink-0"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">Admin</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">PC 배치 관리</h2>
        <p className="text-[0.44rem] tracking-[0.18em] text-black/25">드래그로 이동 · 더블클릭으로 상태 변경</p>
      </motion.div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mb-3 shrink-0">
        {[
          { color: 'bg-blue-500', label: '사용중' },
          { color: 'bg-slate-100 border border-slate-300', label: '비어있음' },
          { color: 'bg-gray-300', label: '오프라인' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
            <span className="text-[0.44rem] tracking-wide text-black/35">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div
          style={{
            position: 'relative',
            width: COLS * CELL,
            height: ROWS * CELL,
          }}
        >
          {/* Grid lines */}
          {Array.from({ length: ROWS }).map((_, ry) =>
            Array.from({ length: COLS }).map((_, cx) => (
              <div
                key={`cell-${cx}-${ry}`}
                style={{
                  position: 'absolute',
                  left: cx * CELL,
                  top: ry * CELL,
                  width: CELL,
                  height: CELL,
                  border: '1px dashed rgba(0,0,0,0.07)',
                  borderRadius: 6,
                  background:
                    hoveredCell?.x === cx && hoveredCell?.y === ry
                      ? 'rgba(59,130,246,0.06)'
                      : 'transparent',
                  transition: 'background 0.15s',
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoveredCell({ x: cx, y: ry });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragging) moveSeat(dragging, cx, ry);
                  setDragging(null);
                  setHoveredCell(null);
                }}
                onDragLeave={() => setHoveredCell(null)}
              />
            )),
          )}

          {/* Seats */}
          {seats.map((seat) => (
            <motion.div
              key={seat.id}
              layout
              animate={{ left: seat.x * CELL + 8, top: seat.y * CELL + 8 }}
              style={{ position: 'absolute', width: CELL - 16, height: CELL - 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex flex-col items-center justify-center gap-0.5 rounded-lg cursor-grab active:cursor-grabbing select-none"
              draggable
              onDragStart={() => setDragging(seat.id)}
              onDragEnd={() => { setDragging(null); setHoveredCell(null); }}
              onDoubleClick={() => seat.status !== 'inuse' && toggleOffline(seat.id)}
            >
              <PcIcon status={seat.status} size={28} />
              <span className="text-[0.4rem] tracking-wide text-black/40 font-medium">{seat.label}</span>
              {seat.status === 'inuse' && (
                <span className="text-[0.36rem] text-blue-400">{seat.user}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[0.5rem] tracking-widest px-4 py-1.5 rounded-full pointer-events-none"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   User Login Screen  —  pick empty seat & login
═══════════════════════════════════════════════════ */
function UserLoginScreen({
  seats,
  onLogin,
  onBack,
}: {
  seats: Seat[];
  onLogin: (seatId: string, user: string) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');

  const emptySeat = seats.find((s) => s.id === selected && s.status === 'empty');

  return (
    <div className="relative flex flex-col h-full w-full">
      <BackButton onBack={onBack} />

      <motion.div
        className="flex flex-col items-center gap-1 pt-14 pb-4 shrink-0"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">User</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">좌석 선택</h2>
        <p className="text-[0.44rem] tracking-[0.18em] text-black/25">비어있는 PC를 선택하세요</p>
      </motion.div>

      {/* Seat grid */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-0 overflow-y-auto px-4">
        <div className="grid grid-cols-4 gap-3">
          {seats.map((seat) => {
            const isSelected = selected === seat.id;
            const canSelect = seat.status === 'empty';
            return (
              <motion.button
                key={seat.id}
                whileHover={canSelect ? { scale: 1.06 } : {}}
                whileTap={canSelect ? { scale: 0.96 } : {}}
                onClick={() => canSelect && setSelected(seat.id)}
                className={[
                  'flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-200',
                  isSelected
                    ? 'border-blue-400 bg-blue-50 shadow-md'
                    : canSelect
                      ? 'border-black/8 bg-white/80 cursor-pointer hover:border-blue-200'
                      : 'border-black/5 bg-gray-50 cursor-not-allowed opacity-60',
                ].join(' ')}
              >
                <PcIcon status={seat.status} size={28} />
                <span className="text-[0.44rem] tracking-wide text-black/45">{seat.label}</span>
                <span className={[
                  'text-[0.38rem] tracking-wide',
                  seat.status === 'inuse' ? 'text-blue-400' : seat.status === 'offline' ? 'text-gray-400' : 'text-emerald-500',
                ].join(' ')}>
                  {seat.status === 'inuse' ? seat.user : seat.status === 'offline' ? '오프라인' : '사용가능'}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Login form */}
        <AnimatePresence>
          {emptySeat && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex flex-col items-center gap-2.5 mt-2 p-4 border border-blue-100 rounded-2xl bg-blue-50/60 w-full max-w-48"
            >
              <p className="text-[0.5rem] tracking-[0.2em] text-blue-500">{emptySeat.label} 로그인</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-[0.52rem] tracking-wide text-black/60 outline-none focus:border-blue-400 transition-colors"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (name.trim()) {
                    onLogin(emptySeat.id, name.trim());
                    setName('');
                  }
                }}
                disabled={!name.trim()}
                className="w-full py-1.5 rounded-lg bg-blue-500 text-white text-[0.5rem] tracking-widest disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                로그인
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   User Using Screen  —  my PC is in-use
═══════════════════════════════════════════════════ */
function UserUsingScreen({
  seat,
  onLogout,
  onBack,
}: {
  seat: Seat;
  onLogout: () => void;
  onBack: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  // tick every second
  useState(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  });

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full gap-6">
      <BackButton onBack={onBack} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="flex flex-col items-center gap-4 p-8 border border-blue-100 rounded-3xl bg-blue-50/60 shadow-sm"
      >
        <div className="relative">
          <PcIcon status="inuse" size={56} />
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white"
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-[0.85rem] font-light tracking-[0.3em] text-blue-600">{seat.label}</p>
          <p className="text-[0.55rem] tracking-[0.18em] text-black/45">{seat.user}님 사용중</p>
        </div>

        <div className="flex flex-col items-center gap-0.5 py-2 px-6 bg-white/70 rounded-xl border border-blue-100">
          <p className="text-[0.38rem] tracking-[0.35em] text-black/25 uppercase">사용 시간</p>
          <p className="text-[1.1rem] font-light tracking-[0.15em] text-blue-500 font-mono">{fmt(elapsed)}</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onLogout}
          className="mt-1 px-6 py-2 rounded-xl border border-red-200 bg-red-50 text-red-400 text-[0.5rem] tracking-widest cursor-pointer"
        >
          로그아웃
        </motion.button>
      </motion.div>

      <p className="text-[0.42rem] tracking-[0.28em] text-black/20">로그아웃 시 PC가 다시 사용 가능 상태로 전환됩니다</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Root
═══════════════════════════════════════════════════ */
export function FlexibleSeatDemo({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<AppMode>('select');
  const [seats, setSeats] = useState<Seat[]>(INITIAL_SEATS);
  const [mySession, setMySession] = useState<{ seatId: string; user: string } | null>(null);

  const handleLogin = (seatId: string, user: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setSeats((prev) =>
      prev.map((s) =>
        s.id === seatId ? { ...s, status: 'inuse', user, loginTime: time } : s,
      ),
    );
    setMySession({ seatId, user });
    setMode('user-using');
  };

  const handleLogout = () => {
    if (!mySession) return;
    setSeats((prev) =>
      prev.map((s) =>
        s.id === mySession.seatId ? { ...s, status: 'empty', user: undefined, loginTime: undefined } : s,
      ),
    );
    setMySession(null);
    setMode('select');
  };

  const mySeat = mySession ? seats.find((s) => s.id === mySession.seatId) : null;

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {mode === 'select' && (
          <motion.div key="select" className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BackButton onBack={onBack} />
            <ModeSelectScreen onMode={(m) => setMode(m)} />
          </motion.div>
        )}
        {mode === 'admin' && (
          <motion.div key="admin" className="absolute inset-0"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <AdminScreen seats={seats} onSeatsChange={setSeats} onBack={() => setMode('select')} />
          </motion.div>
        )}
        {mode === 'user-login' && (
          <motion.div key="user-login" className="absolute inset-0"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <UserLoginScreen seats={seats} onLogin={handleLogin} onBack={() => setMode('select')} />
          </motion.div>
        )}
        {mode === 'user-using' && mySeat && (
          <motion.div key="user-using" className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <UserUsingScreen seat={mySeat} onLogout={handleLogout} onBack={() => setMode('select')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
