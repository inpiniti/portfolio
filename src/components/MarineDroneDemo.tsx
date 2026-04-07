'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Types ─────────────────────────────────── */
type OrderStatus = 'pending' | 'assigned' | 'drone-moving' | 'delivered' | 'cancelled';

interface Ship {
  id: string;
  name: string;
  type: string;
  mapX: number;
  mapY: number;
}

interface DroneOrder {
  id: string;
  shipId: string;
  items: string[];
  status: OrderStatus;
  dronePos?: { x: number; y: number };
}

const SHIPS: Ship[] = [
  { id: 's1', name: 'PACIFIC EAGLE', type: '컨테이너선', mapX: 30, mapY: 35 },
  { id: 's2', name: 'GOLDEN STAR', type: '탱커', mapX: 65, mapY: 25 },
  { id: 's3', name: 'BUSAN SPIRIT', type: '벌크선', mapX: 75, mapY: 62 },
];

const MENU_ITEMS = [
  { id: 'food', label: '식재료', icon: '🥩' },
  { id: 'parts', label: '부품', icon: '⚙️' },
  { id: 'meds', label: '의약품', icon: '💊' },
  { id: 'docs', label: '서류', icon: '📄' },
  { id: 'fuel', label: '연료', icon: '⛽' },
];

const DEPOT = { x: 10, y: 80 };

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '주문 접수', assigned: '드론 배정', 'drone-moving': '배송 중',
  delivered: '배송 완료', cancelled: '취소',
};
const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: '#94a3b8', assigned: '#3b82f6', 'drone-moving': '#f59e0b',
  delivered: '#22c55e', cancelled: '#ef4444',
};

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
      onClick={onBack}
      className="absolute top-8 left-8 z-20 flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none">
      <span className="text-base leading-none text-black/20 group-hover:text-black transition-colors duration-200">‹</span>
      <span className="text-[0.58rem] tracking-[0.28em] text-black/25 group-hover:text-black transition-colors duration-200 uppercase">뒤로가기</span>
    </motion.button>
  );
}

export function MarineDroneDemo({ onBack }: { onBack: () => void }) {
  const [selectedShip, setSelectedShip] = useState<Ship>(SHIPS[0]);
  const [selectedItems, setSelectedItems] = useState<string[]>(['food']);
  const [orders, setOrders] = useState<DroneOrder[]>([]);
  const [tab, setTab] = useState<'order' | 'history'>('order');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const toggleItem = (id: string) => {
    setSelectedItems((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id]);
  };

  const placeOrder = () => {
    if (!selectedItems.length) return;
    const id = `ORD-${Date.now().toString().slice(-4)}`;
    const ship = selectedShip;
    setOrders((prev) => [...prev, {
      id, shipId: ship.id, items: [...selectedItems], status: 'pending',
      dronePos: { x: DEPOT.x, y: DEPOT.y },
    }]);
    setSelectedItems([]);
    setTab('history');

    // Animate delivery
    setTimeout(() => {
      setOrders((p) => p.map((o) => o.id === id ? { ...o, status: 'assigned' } : o));
    }, 800);

    let tick = 0;
    const total = 60;
    intervalRef.current = setInterval(() => {
      tick++;
      const t = Math.min(tick / total, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      const x = DEPOT.x + (ship.mapX - DEPOT.x) * eased;
      const y = DEPOT.y + (ship.mapY - DEPOT.y) * eased;
      setOrders((p) => p.map((o) => o.id === id
        ? { ...o, status: t > 0.1 ? 'drone-moving' : o.status, dronePos: { x, y } }
        : o));
      if (t >= 1) {
        clearInterval(intervalRef.current!);
        setOrders((p) => p.map((o) => o.id === id ? { ...o, status: 'delivered' } : o));
      }
    }, 80);
  };

  const activeOrders = orders.filter((o) => o.status === 'drone-moving');

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <motion.div className="flex flex-col items-center gap-1 pt-14 pb-2 shrink-0"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">에코마린</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">해양드론 배송시스템</h2>
      </motion.div>

      <div className="flex-1 flex gap-3 px-4 pb-4 min-h-0 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-black/8 min-w-0"
          style={{ background: 'linear-gradient(180deg, #0f2d52 0%, #0e7490 100%)' }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

          {/* Depot */}
          <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${DEPOT.x}%`, top: `${DEPOT.y}%` }}>
            <span className="text-lg">🏭</span>
            <span className="text-[0.32rem] text-white/60 mt-0.5">드론 기지</span>
          </div>

          {/* Ships */}
          {SHIPS.map((ship) => (
            <motion.button key={ship.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer"
              style={{ left: `${ship.mapX}%`, top: `${ship.mapY}%` }}
              whileHover={{ scale: 1.2 }}
              onClick={() => setSelectedShip(ship)}>
              <span className="text-xl leading-none">🚢</span>
              <span className={`text-[0.32rem] mt-0.5 ${selectedShip.id === ship.id ? 'text-yellow-300' : 'text-white/50'}`}>
                {ship.name.split(' ')[0]}
              </span>
              {selectedShip.id === ship.id && (
                <motion.div className="absolute -inset-3 rounded-full border border-yellow-300/50"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }} />
              )}
            </motion.button>
          ))}

          {/* Active drones */}
          {activeOrders.map((o) => (
            <motion.div key={o.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-base"
              animate={{ left: `${o.dronePos!.x}%`, top: `${o.dronePos!.y}%` }}
              transition={{ duration: 0.08 }}>
              <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>
                🚁
              </motion.span>
            </motion.div>
          ))}

          {/* Route lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {activeOrders.map((o) => {
              const ship = SHIPS.find((s) => s.id === o.shipId)!;
              return (
                <line key={o.id}
                  x1={`${DEPOT.x}`} y1={`${DEPOT.y}`}
                  x2={`${ship.mapX}`} y2={`${ship.mapY}`}
                  stroke="rgba(251,191,36,0.4)" strokeWidth="0.8" strokeDasharray="2 2" />
              );
            })}
          </svg>
        </div>

        {/* Right panel */}
        <div className="w-48 shrink-0 flex flex-col gap-2 overflow-hidden">
          {/* Tab */}
          <div className="flex gap-1">
            {(['order', 'history'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1 rounded-lg text-[0.42rem] tracking-wide cursor-pointer transition-all ${tab === t ? 'bg-black/8 text-black/60' : 'text-black/25'}`}>
                {t === 'order' ? '주문' : '내역'}
              </button>
            ))}
          </div>

          {tab === 'order' ? (
            <>
              {/* Ship select */}
              <div className="rounded-xl border border-black/8 bg-white p-2.5">
                <p className="text-[0.4rem] tracking-[0.22em] text-black/25 uppercase mb-1.5">배달할 선박</p>
                <div className="space-y-1">
                  {SHIPS.map((s) => (
                    <button key={s.id} onClick={() => setSelectedShip(s)}
                      className={`w-full text-left rounded-lg px-2 py-1.5 text-[0.44rem] cursor-pointer transition-all ${selectedShip.id === s.id ? 'bg-blue-50 border border-blue-200/60 text-blue-600' : 'bg-black/2 text-black/45 hover:bg-black/5'}`}>
                      🚢 {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Item select */}
              <div className="rounded-xl border border-black/8 bg-white p-2.5">
                <p className="text-[0.4rem] tracking-[0.22em] text-black/25 uppercase mb-1.5">물품 선택</p>
                <div className="grid grid-cols-3 gap-1">
                  {MENU_ITEMS.map((item) => {
                    const on = selectedItems.includes(item.id);
                    return (
                      <button key={item.id} onClick={() => toggleItem(item.id)}
                        className={`rounded-lg py-1.5 text-center cursor-pointer transition-all ${on ? 'bg-amber-50 border border-amber-200/60' : 'bg-black/3 hover:bg-black/6'}`}>
                        <div className="text-[0.9rem]">{item.icon}</div>
                        <div className="text-[0.36rem] text-black/40 mt-0.5">{item.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={placeOrder} disabled={!selectedItems.length}
                className="w-full py-2 rounded-xl text-[0.5rem] tracking-widest font-medium text-white cursor-pointer disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #0e7490)' }}>
                🚁 드론 배송 주문
              </motion.button>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {orders.length === 0 ? (
                <div className="rounded-xl border border-black/8 bg-white p-4 text-center">
                  <p className="text-[0.44rem] text-black/25">주문 내역 없음</p>
                </div>
              ) : (
                [...orders].reverse().map((o) => {
                  const ship = SHIPS.find((s) => s.id === o.shipId)!;
                  return (
                    <motion.div key={o.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-black/8 bg-white p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[0.44rem] font-mono text-black/40">{o.id}</span>
                        <span className="text-[0.38rem] px-1.5 py-0.5 rounded-full"
                          style={{ background: `${STATUS_COLOR[o.status]}20`, color: STATUS_COLOR[o.status] }}>
                          {STATUS_LABEL[o.status]}
                        </span>
                      </div>
                      <p className="text-[0.44rem] text-black/55">🚢 {ship.name}</p>
                      <div className="flex gap-0.5 mt-1">
                        {o.items.map((i) => {
                          const m = MENU_ITEMS.find((mi) => mi.id === i);
                          return m ? <span key={i} className="text-[0.7rem]">{m.icon}</span> : null;
                        })}
                      </div>
                      {o.status === 'drone-moving' && (
                        <div className="mt-1.5 w-full h-1 bg-black/6 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-amber-400 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 5, ease: 'linear' }} />
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
