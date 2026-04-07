'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Types ─────────────────────────────────── */
type ShipmentStatus = 'booking' | 'customs' | 'transport' | 'warehouse' | 'delivered';
type TradeDirection = 'export' | 'import';
type PartyRole = 'forwarder' | 'customs' | 'carrier' | 'inspector' | 'warehouse' | 'insurance';

interface Shipment {
  id: string;
  direction: TradeDirection;
  origin: string;
  destination: string;
  goods: string;
  weight: string;
  status: ShipmentStatus;
  parties: PartyRole[];
  incoterms: string;
  eta: string;
}

const SHIPMENTS: Shipment[] = [
  {
    id: 'TRD-2025-001',
    direction: 'export',
    origin: 'KRPUS',
    destination: 'USLAX',
    goods: '전자부품',
    weight: '12,400 kg',
    status: 'customs',
    parties: ['forwarder', 'customs', 'carrier', 'insurance'],
    incoterms: 'FOB',
    eta: '2025-12-05',
  },
  {
    id: 'TRD-2025-002',
    direction: 'import',
    origin: 'DEHAM',
    destination: 'KRINC',
    goods: '기계장비',
    weight: '28,200 kg',
    status: 'transport',
    parties: ['forwarder', 'customs', 'carrier', 'warehouse', 'inspector'],
    incoterms: 'CIF',
    eta: '2025-11-25',
  },
  {
    id: 'TRD-2025-003',
    direction: 'export',
    origin: 'KRICN',
    destination: 'JPOSA',
    goods: '화학원료',
    weight: '5,800 kg',
    status: 'warehouse',
    parties: ['forwarder', 'customs', 'carrier', 'warehouse', 'insurance'],
    incoterms: 'DDP',
    eta: '2025-11-18',
  },
];

const STATUS_STEPS: ShipmentStatus[] = ['booking', 'customs', 'transport', 'warehouse', 'delivered'];
const STATUS_LABEL: Record<ShipmentStatus, string> = {
  booking: '예약', customs: '통관', transport: '운송', warehouse: '창고', delivered: '완료',
};
const PARTY_ICON: Record<PartyRole, string> = {
  forwarder: '🚢', customs: '🏛', carrier: '🚛', inspector: '🔍', warehouse: '🏭', insurance: '🛡',
};
const PARTY_LABEL: Record<PartyRole, string> = {
  forwarder: '포워더', customs: '관세사', carrier: '운송사', inspector: '검수', warehouse: '창고', insurance: '보험사',
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

function StatusRail({ current }: { current: ShipmentStatus }) {
  const idx = STATUS_STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-1">
      {STATUS_STEPS.map((s, i) => {
        const on = idx >= i;
        const active = s === current;
        return (
          <div key={s} className="flex items-center gap-1 flex-1 min-w-0">
            <motion.div
              animate={active ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.8, repeat: active ? Infinity : 0 }}
              className="w-4 h-4 rounded-full flex items-center justify-center text-[0.34rem] shrink-0 transition-all"
              style={{
                background: on ? '#0ea5e9' : 'rgba(0,0,0,0.06)',
                color: on ? 'white' : 'rgba(0,0,0,0.3)',
              }}>
              {i + 1}
            </motion.div>
            {i < STATUS_STEPS.length - 1 && (
              <div className="h-px flex-1 transition-all"
                style={{ background: on && idx > i ? '#0ea5e9' : 'rgba(0,0,0,0.08)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TradersDemo({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<Shipment>(SHIPMENTS[0]);
  const [dirFilter, setDirFilter] = useState<'all' | TradeDirection>('all');

  const filtered = dirFilter === 'all' ? SHIPMENTS : SHIPMENTS.filter((s) => s.direction === dirFilter);

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <motion.div className="flex flex-col items-center gap-1 pt-14 pb-2 shrink-0"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">에코마린</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">트레이더스 · 수출입 물류</h2>
      </motion.div>

      {/* Filter */}
      <div className="flex justify-center gap-1 pb-2 shrink-0">
        {[['all', '전체'], ['export', '수출'], ['import', '수입']].map(([v, l]) => (
          <button key={v} onClick={() => setDirFilter(v as typeof dirFilter)}
            className={`px-3 py-1 rounded-full text-[0.44rem] tracking-wide cursor-pointer transition-all ${dirFilter === v ? 'bg-black/8 text-black/65' : 'text-black/25 hover:text-black/45'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex-1 flex gap-3 px-4 pb-4 min-h-0 overflow-hidden">
        {/* Shipment list */}
        <div className="w-44 shrink-0 flex flex-col gap-2 overflow-y-auto">
          <p className="text-[0.4rem] tracking-[0.3em] text-black/25 uppercase shrink-0">화물 목록</p>
          {filtered.map((s) => (
            <motion.button key={s.id} whileHover={{ x: 2 }}
              onClick={() => setSelected(s)}
              className={`text-left rounded-xl border p-2.5 cursor-pointer transition-all duration-200 ${selected.id === s.id ? 'border-blue-300/60 bg-blue-50' : 'border-black/8 bg-white'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-[0.38rem] px-1 py-0.5 rounded font-medium ${s.direction === 'export' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                  {s.direction === 'export' ? '수출' : '수입'}
                </span>
                <span className="text-[0.4rem] font-mono text-black/40">{s.id}</span>
              </div>
              <p className="text-[0.5rem] font-medium text-black/60">{s.goods}</p>
              <p className="text-[0.4rem] text-black/30 mt-0.5">{s.origin} → {s.destination}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1 h-1 rounded-full bg-blue-400" />
                <span className="text-[0.38rem] text-black/35">{STATUS_LABEL[s.status]}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Detail */}
        <AnimatePresence mode="wait">
          <motion.div key={selected.id}
            className="flex-1 flex flex-col gap-2.5 overflow-y-auto min-w-0"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>

            {/* Header */}
            <div className="rounded-2xl border border-black/8 bg-white p-3 shrink-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className={`text-[0.4rem] px-1.5 py-0.5 rounded font-medium ${selected.direction === 'export' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {selected.direction === 'export' ? '수출' : '수입'} · {selected.incoterms}
                  </span>
                  <p className="text-[0.62rem] font-medium text-black/65 mt-1">{selected.goods}</p>
                  <p className="text-[0.44rem] text-black/35">{selected.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.5rem] font-mono text-black/55">{selected.origin}</p>
                  <p className="text-[0.38rem] text-black/20">↓</p>
                  <p className="text-[0.5rem] font-mono text-black/55">{selected.destination}</p>
                </div>
              </div>
              <StatusRail current={selected.status} />
              <div className="flex gap-3 mt-2">
                <span className="text-[0.38rem] text-black/30">중량: {selected.weight}</span>
                <span className="text-[0.38rem] text-black/30">ETA: {selected.eta}</span>
              </div>
            </div>

            {/* Parties */}
            <div className="rounded-2xl border border-black/8 bg-white p-3">
              <p className="text-[0.42rem] tracking-[0.28em] text-black/25 uppercase mb-2">참여 업체</p>
              <div className="flex gap-2 flex-wrap">
                {selected.parties.map((role) => (
                  <motion.div key={role}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border border-black/8 bg-gray-50">
                    <span className="text-lg">{PARTY_ICON[role]}</span>
                    <span className="text-[0.4rem] tracking-wide text-black/45">{PARTY_LABEL[role]}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Flow */}
            <div className="rounded-2xl border border-black/8 bg-white p-3">
              <p className="text-[0.42rem] tracking-[0.28em] text-black/25 uppercase mb-2">물류 흐름</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['발주·예약', '→', '통관·세관', '→', '운송·선적', '→', '창고 보관', '→', '배송 완료'].map((item, i) => {
                  const stepIdx = Math.floor(i / 2);
                  const isStep = i % 2 === 0;
                  const active = isStep && STATUS_STEPS.indexOf(selected.status) >= stepIdx;
                  return (
                    <span key={i} className={[
                      isStep ? `text-[0.44rem] px-1.5 py-0.5 rounded-lg font-medium transition-all` : 'text-[0.4rem] text-black/15',
                      isStep && active ? 'bg-blue-100 text-blue-600' : isStep ? 'text-black/25' : '',
                    ].join(' ')}>
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
