'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/* ─── Types ──────────────────────────────────────────── */
type FlowStep =
  | 'idle'
  | 'ordered'
  | 'pickup-moving'
  | 'washing-ready'
  | 'washing'
  | 'delivery-ready'
  | 'delivery-moving'
  | 'done';

type AppRole = 'select' | 'user' | 'shop';

const SHOPS = [
  { id: 's1', name: '버블클린 문현점', eta: '수거 25분', mapX: 72, mapY: 24 },
  { id: 's2', name: '화이트런드리 대연점', eta: '수거 40분', mapX: 78, mapY: 52 },
  { id: 's3', name: '프레시워시 남천점', eta: '수거 35분', mapX: 62, mapY: 72 },
];

const CLOTHES = [
  { id: 'shirt', label: '셔츠', icon: '👔' },
  { id: 'coat', label: '코트', icon: '🧥' },
  { id: 'blanket', label: '이불', icon: '🛏' },
  { id: 'shoes', label: '신발', icon: '👟' },
  { id: 'dress', label: '원피스', icon: '👗' },
  { id: 'suit', label: '정장', icon: '🕴' },
];

const FLOW_LABELS: Record<FlowStep, string> = {
  idle: '주문 전',
  ordered: '주문 접수',
  'pickup-moving': '수거 이동',
  'washing-ready': '수거 완료',
  washing: '세탁 중',
  'delivery-ready': '세탁 완료',
  'delivery-moving': '배송 이동',
  done: '배송 완료',
};

const HOME = { x: 24, y: 78 };

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

/* ─── Shared mini-map ─────────────────────────────────── */
function MiniMap({ shopId, courier, isMoving }: { shopId: string; courier: { x: number; y: number }; isMoving: boolean }) {
  const shop = SHOPS.find((s) => s.id === shopId) ?? SHOPS[0];
  return (
    <div className="relative rounded-xl border border-black/8 overflow-hidden h-28 bg-gradient-to-b from-blue-50 to-cyan-50">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={`M ${shop.mapX} ${shop.mapY} Q ${(shop.mapX + HOME.x) / 2 + 10} ${(shop.mapY + HOME.y) / 2 - 10}, ${HOME.x} ${HOME.y}`}
          stroke="rgba(14,116,144,0.4)" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
      </svg>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300/60"
        style={{ left: `${shop.mapX}%`, top: `${shop.mapY}%` }}>
        <span className="text-[0.4rem] text-emerald-800">세탁소</span>
      </div>
      <div className="absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-indigo-100 border border-indigo-300/60"
        style={{ left: `${HOME.x}%`, top: `${HOME.y}%` }}>
        <span className="text-[0.4rem] text-indigo-800">고객집</span>
      </div>
      <motion.div
        animate={isMoving ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.7, repeat: isMoving ? Infinity : 0 }}
        className="absolute -translate-x-1/2 -translate-y-1/2 text-base"
        style={{ left: `${courier.x}%`, top: `${courier.y}%` }}
      >🚕</motion.div>
    </div>
  );
}

/* ─── Step rail ───────────────────────────────────────── */
const STEPS: FlowStep[] = ['ordered', 'pickup-moving', 'washing', 'delivery-moving', 'done'];
function StepRail({ current }: { current: FlowStep }) {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => {
        const on = idx >= i;
        return (
          <div key={s} className="flex items-center gap-1 flex-1 min-w-0">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[0.36rem] shrink-0 transition-all duration-300 ${on ? 'bg-cyan-500 text-white' : 'bg-black/8 text-black/30'}`}>
              {i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 transition-all duration-300 ${on && idx > i ? 'bg-cyan-400' : 'bg-black/8'}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Role Select
═══════════════════════════════════════════════════ */
function RoleSelect({ onRole }: { onRole: (r: 'user' | 'shop') => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 h-full">
      <motion.div className="flex flex-col items-center gap-1"
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">온웨어</p>
        <h2 className="text-[0.9rem] font-light tracking-[0.32em] text-black/55">O2O 세탁 서비스</h2>
      </motion.div>
      <motion.div className="flex gap-5"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        {[
          { role: 'user' as const, label: '사용자 앱', sub: '주문 · 현황 추적', icon: '📱' },
          { role: 'shop' as const, label: '업체 앱', sub: '수거 · 세탁 · 배송', icon: '🏪' },
        ].map((r) => (
          <motion.button key={r.role} whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onRole(r.role)}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-black/8 bg-white/80 shadow-sm cursor-pointer w-28">
            <span className="text-2xl">{r.icon}</span>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[0.65rem] font-medium tracking-[0.12em] text-black/60">{r.label}</span>
              <span className="text-[0.42rem] tracking-[0.1em] text-black/28">{r.sub}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>
      <motion.p className="text-[0.42rem] tracking-[0.25em] text-black/18"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        두 앱이 동일한 주문을 공유합니다
      </motion.p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Phone Shell
═══════════════════════════════════════════════════ */
function PhoneShell({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 100%)',
      borderRadius: 30, padding: '10px 8px 12px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxShadow: '0 8px 32px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.1)',
      width: 260, height: 520, maxHeight: 'calc(100dvh - 180px)', flexShrink: 0,
    }}>
      <div style={{ width: 42, height: 8, background: '#000', borderRadius: 999 }} />
      <div className="mt-2 flex-1 w-full rounded-[16px] overflow-hidden bg-[#f7f8fa] border border-white/10 flex flex-col">
        <div className={`${accent} border-b border-black/6 px-3 py-2 flex items-center justify-between shrink-0`}>
          <span className="text-[0.44rem] tracking-[0.22em] text-white/80 uppercase">{label}</span>
          <span className="text-[0.4rem] text-white/50">O2O Laundry</span>
        </div>
        <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-2.5">
          {children}
        </div>
      </div>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', marginTop: 8 }} />
    </div>
  );
}

/* ─── Shared demo state hook (passed as props) ─── */
interface DemoState {
  step: FlowStep;
  shopId: string;
  clothes: string[];
  courier: { x: number; y: number };
}

/* ═══════════════════════════════════════════════════
   User App Panel
═══════════════════════════════════════════════════ */
function UserApp({ state, onOrder, onReset }: {
  state: DemoState;
  onOrder: (shopId: string, clothes: string[]) => void;
  onReset: () => void;
}) {
  const [shopId, setShopId] = useState(SHOPS[0].id);
  const [clothes, setClothes] = useState<string[]>(['shirt', 'coat']);
  const idle = state.step === 'idle';
  const done = state.step === 'done';

  const toggle = (id: string) => {
    if (!idle) return;
    setClothes((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);
  };

  const shop = SHOPS.find((s) => s.id === state.shopId) ?? SHOPS.find((s) => s.id === shopId) ?? SHOPS[0];
  const isMoving = state.step === 'pickup-moving' || state.step === 'delivery-moving';

  return (
    <PhoneShell label="사용자 앱" accent="bg-cyan-600">
      {idle ? (
        <>
          <div className="rounded-xl border border-black/8 bg-white p-2.5">
            <p className="text-[0.42rem] tracking-[0.2em] text-black/30 uppercase mb-1.5">세탁할 의류</p>
            <div className="grid grid-cols-3 gap-1">
              {CLOTHES.map((c) => {
                const on = clothes.includes(c.id);
                return (
                  <button key={c.id} onClick={() => toggle(c.id)}
                    className="rounded-lg py-1.5 transition-all duration-150 cursor-pointer"
                    style={{ border: `1px solid ${on ? 'rgba(8,145,178,0.5)' : 'rgba(0,0,0,0.08)'}`, background: on ? 'rgba(8,145,178,0.1)' : 'white' }}>
                    <div className="text-[0.8rem]">{c.icon}</div>
                    <div className="text-[0.38rem] text-black/50 mt-0.5">{c.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl border border-black/8 bg-white p-2.5">
            <p className="text-[0.42rem] tracking-[0.2em] text-black/30 uppercase mb-1.5">세탁소 선택</p>
            <div className="space-y-1">
              {SHOPS.map((s) => {
                const on = s.id === shopId;
                return (
                  <button key={s.id} onClick={() => setShopId(s.id)}
                    className="w-full text-left rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
                    style={{ border: `1px solid ${on ? 'rgba(22,163,74,0.4)' : 'rgba(0,0,0,0.08)'}`, background: on ? 'rgba(22,163,74,0.08)' : 'white' }}>
                    <p className="text-[0.48rem] text-black/65">{s.name}</p>
                    <p className="text-[0.38rem] text-black/30">{s.eta}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={() => onOrder(shopId, clothes)} disabled={!clothes.length}
            className="w-full py-2 rounded-xl text-[0.5rem] tracking-widest font-medium text-white cursor-pointer disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #16a34a)' }}>
            주문하기
          </button>
        </>
      ) : (
        <>
          <div className="rounded-xl border border-black/8 bg-white p-2.5">
            <StepRail current={state.step} />
            <div className="mt-2 text-center">
              <AnimatePresence mode="wait">
                <motion.p key={state.step}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="text-[0.56rem] font-medium tracking-[0.15em] text-cyan-600">
                  {FLOW_LABELS[state.step]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <div className="rounded-xl border border-black/8 bg-white p-2.5">
            <p className="text-[0.4rem] tracking-[0.2em] text-black/25 uppercase mb-1.5">실시간 위치</p>
            <MiniMap shopId={state.shopId} courier={state.courier} isMoving={isMoving} />
          </div>
          <div className="rounded-xl border border-black/8 bg-white p-2.5">
            <p className="text-[0.4rem] tracking-[0.18em] text-black/25 uppercase mb-1">주문 내역</p>
            <p className="text-[0.46rem] text-black/55">{shop.name}</p>
            <p className="text-[0.42rem] text-black/35">의류 {state.clothes.length}벌</p>
          </div>
          {done && (
            <button onClick={onReset}
              className="w-full py-1.5 rounded-xl border border-black/10 text-[0.46rem] tracking-widest text-black/45 cursor-pointer bg-white">
              새 주문
            </button>
          )}
        </>
      )}
    </PhoneShell>
  );
}

/* ═══════════════════════════════════════════════════
   Shop (업체) App Panel
═══════════════════════════════════════════════════ */
function ShopApp({ state, onAction }: {
  state: DemoState;
  onAction: (action: 'pickup' | 'wash' | 'deliver') => void;
}) {
  const washActive = state.step === 'washing';
  const [washPct, setWashPct] = useState(0);

  useEffect(() => {
    if (!washActive) { setWashPct(0); return; }
    const t = setInterval(() => setWashPct((p) => Math.min(p + 4, 100)), 120);
    return () => clearInterval(t);
  }, [washActive]);

  const shop = SHOPS.find((s) => s.id === state.shopId) ?? SHOPS[0];
  const isMoving = state.step === 'pickup-moving' || state.step === 'delivery-moving';

  const actionBtn = (
    action: 'pickup' | 'wash' | 'deliver',
    label: string,
    activeStep: FlowStep,
    color: string,
  ) => {
    const active = state.step === activeStep;
    return (
      <button onClick={() => active && onAction(action)} disabled={!active}
        className="w-full py-1.5 rounded-xl text-[0.46rem] tracking-widest transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: active ? color : 'rgba(0,0,0,0.04)',
          color: active ? 'white' : 'rgba(0,0,0,0.4)',
          border: active ? 'none' : '1px solid rgba(0,0,0,0.08)',
        }}>
        {label}
      </button>
    );
  };

  return (
    <PhoneShell label="업체 앱" accent="bg-emerald-700">
      {state.step === 'idle' ? (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
            <span className="text-2xl">🏪</span>
          </motion.div>
          <p className="text-[0.48rem] tracking-[0.2em] text-black/30">주문 대기 중...</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-black/8 bg-white p-2.5">
            <p className="text-[0.4rem] tracking-[0.2em] text-black/25 uppercase mb-1">신규 주문</p>
            <p className="text-[0.52rem] font-medium text-black/65">{shop.name}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {state.clothes.map((id) => {
                const c = CLOTHES.find((cl) => cl.id === id);
                return c ? <span key={id} className="text-[0.7rem]">{c.icon}</span> : null;
              })}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${state.step === 'done' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-[0.44rem] tracking-wide text-black/45">{FLOW_LABELS[state.step]}</span>
            </div>
          </div>

          <div className="rounded-xl border border-black/8 bg-white p-2.5">
            <p className="text-[0.4rem] tracking-[0.2em] text-black/25 uppercase mb-1.5">실시간 위치</p>
            <MiniMap shopId={state.shopId} courier={state.courier} isMoving={isMoving} />
          </div>

          {/* Washing progress bar */}
          {(washActive || state.step === 'delivery-ready') && (
            <div className="rounded-xl border border-black/8 bg-white p-2.5">
              <div className="flex justify-between mb-1">
                <p className="text-[0.4rem] tracking-[0.2em] text-black/25 uppercase">세탁 진행률</p>
                <p className="text-[0.4rem] text-black/35">{Math.round(washPct || 100)}%</p>
              </div>
              <div className="w-full h-1.5 bg-black/6 rounded-full overflow-hidden">
                <motion.div className="h-full bg-emerald-400 rounded-full"
                  animate={{ width: `${washPct || 100}%` }} transition={{ duration: 0.1 }} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {actionBtn('pickup', '수거 시작', 'ordered', '#0ea5e9')}
            {actionBtn('wash', '세탁 시작', 'washing-ready', '#16a34a')}
            {actionBtn('deliver', '배송 시작', 'delivery-ready', '#7c3aed')}
          </div>
        </>
      )}
    </PhoneShell>
  );
}

/* ═══════════════════════════════════════════════════
   Root
═══════════════════════════════════════════════════ */
export function LaundryO2ODemo({ onBack }: { onBack: () => void }) {
  const [role, setRole] = useState<AppRole>('select');
  const [state, setState] = useState<DemoState>({
    step: 'idle', shopId: SHOPS[0].id, clothes: [], courier: { x: SHOPS[0].mapX, y: SHOPS[0].mapY },
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const animateCourier = (
    from: { x: number; y: number },
    to: { x: number; y: number },
    onDone: () => void,
  ) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    let tick = 0;
    const total = Math.floor(5400 / 80);
    setState((s) => ({ ...s, courier: from }));
    intervalRef.current = setInterval(() => {
      tick++;
      const t = Math.min(tick / total, 1);
      const e = 1 - Math.pow(1 - t, 2);
      setState((s) => ({ ...s, courier: { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e } }));
      if (t >= 1) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        onDone();
      }
    }, 80);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const handleOrder = (shopId: string, clothes: string[]) => {
    const shop = SHOPS.find((s) => s.id === shopId) ?? SHOPS[0];
    setState({ step: 'ordered', shopId, clothes, courier: { x: shop.mapX, y: shop.mapY } });
  };

  const handleAction = (action: 'pickup' | 'wash' | 'deliver') => {
    const shop = SHOPS.find((s) => s.id === state.shopId) ?? SHOPS[0];
    if (action === 'pickup') {
      setState((s) => ({ ...s, step: 'pickup-moving' }));
      animateCourier({ x: shop.mapX, y: shop.mapY }, HOME, () => {
        setState((s) => ({ ...s, step: 'washing-ready', courier: { x: shop.mapX, y: shop.mapY } }));
      });
    } else if (action === 'wash') {
      setState((s) => ({ ...s, step: 'washing' }));
      setTimeout(() => setState((s) => ({ ...s, step: 'delivery-ready' })), 4500);
    } else if (action === 'deliver') {
      setState((s) => ({ ...s, step: 'delivery-moving' }));
      animateCourier({ x: shop.mapX, y: shop.mapY }, HOME, () => {
        setState((s) => ({ ...s, step: 'done' }));
      });
    }
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState({ step: 'idle', shopId: SHOPS[0].id, clothes: [], courier: { x: SHOPS[0].mapX, y: SHOPS[0].mapY } });
  };

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <AnimatePresence mode="wait">
        {role === 'select' && (
          <motion.div key="select" className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RoleSelect onRole={(r) => setRole(r)} />
          </motion.div>
        )}
        {role !== 'select' && (
          <motion.div key="demo" className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Header */}
            <div className="flex flex-col items-center gap-0.5 pt-14 pb-3 shrink-0">
              <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">온웨어</p>
              <h2 className="text-[0.85rem] font-light tracking-[0.3em] text-black/55">O2O 세탁 서비스</h2>
              <div className="flex items-center gap-3 mt-1.5">
                {(['user', 'shop'] as const).map((r) => (
                  <button key={r} onClick={() => setRole(r)}
                    className={`text-[0.44rem] tracking-[0.22em] uppercase px-2.5 py-1 rounded-full cursor-pointer transition-all duration-200 ${role === r ? 'bg-black/8 text-black/60' : 'text-black/25 hover:text-black/45'}`}>
                    {r === 'user' ? '사용자 앱' : '업체 앱'}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone panels */}
            <div className="flex-1 flex items-center justify-center gap-5 px-4 pb-4 overflow-hidden">
              <AnimatePresence mode="wait">
                {role === 'user' ? (
                  <motion.div key="user"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <UserApp state={state} onOrder={handleOrder} onReset={handleReset} />
                  </motion.div>
                ) : (
                  <motion.div key="shop"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <ShopApp state={state} onAction={handleAction} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status pill */}
            <div className="flex justify-center pb-3 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-black/6 bg-white/60">
                <div className={`w-1.5 h-1.5 rounded-full ${state.step === 'done' ? 'bg-emerald-400' : state.step === 'idle' ? 'bg-black/20' : 'bg-amber-400'}`} />
                <span className="text-[0.42rem] tracking-[0.2em] text-black/35">{FLOW_LABELS[state.step]}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
