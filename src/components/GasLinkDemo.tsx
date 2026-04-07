'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Types ─────────────────────────────────── */
type InspectionStatus = 'pending' | 'in-progress' | 'done' | 'issue';
type CheckItemStatus = 'unchecked' | 'pass' | 'fail';

interface CheckItem {
  id: string;
  label: string;
  status: CheckItemStatus;
  note?: string;
}

interface Household {
  id: string;
  address: string;
  resident: string;
  phone: string;
  floor: string;
  status: InspectionStatus;
  items: CheckItem[];
  scheduledAt: string;
}

const INITIAL_CHECKLIST: CheckItem[] = [
  { id: 'c1', label: '보일러 외관 상태', status: 'unchecked' },
  { id: 'c2', label: '가스 배관 누설 여부', status: 'unchecked' },
  { id: 'c3', label: '계량기 정상 작동', status: 'unchecked' },
  { id: 'c4', label: '환기구 막힘 여부', status: 'unchecked' },
  { id: 'c5', label: '연소기 상태 확인', status: 'unchecked' },
  { id: 'c6', label: '안전밸브 기능 점검', status: 'unchecked' },
];

const HOUSEHOLDS: Household[] = [
  {
    id: 'h1', address: '부산시 남구 문현동 123-4', resident: '김영희', phone: '010-1234-5678',
    floor: '3층 301호', status: 'done', scheduledAt: '10:00',
    items: INITIAL_CHECKLIST.map((c) => ({ ...c, status: 'pass' as CheckItemStatus })),
  },
  {
    id: 'h2', address: '부산시 남구 문현동 125-2', resident: '이철수', phone: '010-2345-6789',
    floor: '2층 201호', status: 'issue', scheduledAt: '10:30',
    items: INITIAL_CHECKLIST.map((c, i) => ({ ...c, status: i === 1 ? 'fail' : 'pass' as CheckItemStatus, note: i === 1 ? '미세 누설 감지' : undefined })),
  },
  {
    id: 'h3', address: '부산시 남구 대연동 88-1', resident: '박민준', phone: '010-3456-7890',
    floor: '5층 501호', status: 'in-progress', scheduledAt: '11:00',
    items: INITIAL_CHECKLIST.map((c, i) => ({ ...c, status: i < 3 ? 'pass' : 'unchecked' as CheckItemStatus })),
  },
  {
    id: 'h4', address: '부산시 남구 대연동 90-3', resident: '최수진', phone: '010-4567-8901',
    floor: '1층 101호', status: 'pending', scheduledAt: '11:30',
    items: [...INITIAL_CHECKLIST],
  },
  {
    id: 'h5', address: '부산시 남구 용호동 44-7', resident: '정기호', phone: '010-5678-9012',
    floor: '4층 402호', status: 'pending', scheduledAt: '14:00',
    items: [...INITIAL_CHECKLIST],
  },
];

const STATUS_COLOR: Record<InspectionStatus, string> = {
  pending: '#94a3b8', 'in-progress': '#3b82f6', done: '#22c55e', issue: '#ef4444',
};
const STATUS_BG: Record<InspectionStatus, string> = {
  pending: 'bg-gray-50 border-gray-200/50 text-gray-400',
  'in-progress': 'bg-blue-50 border-blue-200/50 text-blue-500',
  done: 'bg-emerald-50 border-emerald-200/50 text-emerald-600',
  issue: 'bg-red-50 border-red-200/50 text-red-500',
};
const STATUS_LABEL: Record<InspectionStatus, string> = {
  pending: '대기', 'in-progress': '점검중', done: '완료', issue: '이상',
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

/* ─── Phone shell ─────────────────────────────── */
function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 100%)',
      borderRadius: 30, padding: '10px 8px 12px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      boxShadow: '0 8px 32px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.1)',
      width: 280, flexShrink: 0,
    }}>
      <div style={{ width: 42, height: 8, background: '#000', borderRadius: 999 }} />
      <div className="mt-2 flex-1 w-full rounded-[16px] overflow-hidden bg-[#f7f8fa] border border-white/10 flex flex-col">
        <div className="bg-orange-500 px-3 py-2 flex items-center justify-between shrink-0">
          <span className="text-[0.44rem] tracking-[0.22em] text-white/90 uppercase font-medium">GasLink 안전매니저</span>
          <span className="text-[0.4rem] text-white/60">점검앱</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', marginTop: 8 }} />
    </div>
  );
}

export function GasLinkDemo({ onBack }: { onBack: () => void }) {
  const [households, setHouseholds] = useState<Household[]>(INITIAL_HOUSEHOLDS_STATE());
  const [selected, setSelected] = useState<Household>(households[2]);
  const [view, setView] = useState<'list' | 'checklist'>('list');

  function INITIAL_HOUSEHOLDS_STATE() { return HOUSEHOLDS.map((h) => ({ ...h })); }

  const toggleCheck = (itemId: string, newStatus: CheckItemStatus) => {
    setHouseholds((prev) => prev.map((h) => {
      if (h.id !== selected.id) return h;
      const items = h.items.map((c) => c.id === itemId ? { ...c, status: newStatus } : c);
      const allChecked = items.every((c) => c.status !== 'unchecked');
      const hasFail = items.some((c) => c.status === 'fail');
      const status: InspectionStatus = allChecked ? (hasFail ? 'issue' : 'done') : 'in-progress';
      return { ...h, items, status };
    }));
    setSelected((prev) => {
      const items = prev.items.map((c) => c.id === itemId ? { ...c, status: newStatus } : c);
      const allChecked = items.every((c) => c.status !== 'unchecked');
      const hasFail = items.some((c) => c.status === 'fail');
      const status: InspectionStatus = allChecked ? (hasFail ? 'issue' : 'done') : 'in-progress';
      return { ...prev, items, status };
    });
  };

  const doneCount = households.filter((h) => h.status === 'done' || h.status === 'issue').length;

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <motion.div className="flex flex-col items-center gap-1 pt-14 pb-3 shrink-0"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">GRM</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">가스링크 · 안전 점검</h2>
        <p className="text-[0.44rem] tracking-[0.18em] text-black/30 mt-0.5">오늘 방문 {doneCount}/{households.length} 완료</p>
      </motion.div>

      <div className="flex-1 flex items-center justify-center gap-6 px-4 pb-4 overflow-hidden">
        {/* Phone */}
        <PhoneShell>
          {/* Tab */}
          <div className="flex border-b border-black/6 shrink-0">
            {(['list', 'checklist'] as const).map((t) => (
              <button key={t} onClick={() => setView(t)}
                className={`flex-1 py-2 text-[0.44rem] tracking-[0.15em] cursor-pointer transition-all ${view === t ? 'text-orange-500 border-b-2 border-orange-400 bg-orange-50/50' : 'text-black/30'}`}>
                {t === 'list' ? '방문 일정' : '점검 체크리스트'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <motion.div key="list" className="px-2.5 py-2.5 space-y-2"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                {households.map((h) => (
                  <motion.button key={h.id} whileHover={{ x: 2 }}
                    onClick={() => { setSelected(h); setView('checklist'); }}
                    className={`w-full text-left rounded-xl border p-2.5 cursor-pointer transition-all ${selected.id === h.id ? `border-orange-200/80 bg-orange-50/60` : 'border-black/8 bg-white'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.44rem] font-medium text-black/60">{h.scheduledAt} · {h.floor}</span>
                      <span className={`text-[0.38rem] px-1.5 py-0.5 rounded-full border ${STATUS_BG[h.status]}`}>
                        {STATUS_LABEL[h.status]}
                      </span>
                    </div>
                    <p className="text-[0.48rem] font-medium text-black/65">{h.resident}</p>
                    <p className="text-[0.38rem] text-black/30 mt-0.5 truncate">{h.address}</p>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div key="checklist" className="px-2.5 py-2.5"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                {/* Resident info */}
                <div className="rounded-xl border border-black/8 bg-white p-2.5 mb-2.5">
                  <p className="text-[0.52rem] font-medium text-black/65">{selected.resident}</p>
                  <p className="text-[0.4rem] text-black/30 mt-0.5">{selected.address}</p>
                  <p className="text-[0.4rem] text-black/30">{selected.floor}</p>
                </div>

                {/* Checklist */}
                <div className="space-y-1.5">
                  {selected.items.map((item) => (
                    <div key={item.id} className="rounded-xl border border-black/8 bg-white px-2.5 py-2">
                      <p className="text-[0.46rem] text-black/60 mb-1.5">{item.label}</p>
                      {item.note && <p className="text-[0.38rem] text-red-400 mb-1">⚠ {item.note}</p>}
                      <div className="flex gap-1.5">
                        {(['pass', 'fail', 'unchecked'] as CheckItemStatus[]).map((s) => {
                          const labels = { pass: '정상', fail: '이상', unchecked: '미확인' };
                          const colors = {
                            pass: item.status === 'pass' ? 'bg-emerald-500 text-white' : 'bg-black/4 text-black/30',
                            fail: item.status === 'fail' ? 'bg-red-500 text-white' : 'bg-black/4 text-black/30',
                            unchecked: item.status === 'unchecked' ? 'bg-gray-400 text-white' : 'bg-black/4 text-black/30',
                          };
                          return (
                            <button key={s} onClick={() => toggleCheck(item.id, s)}
                              className={`px-2 py-0.5 rounded-lg text-[0.38rem] font-medium cursor-pointer transition-all ${colors[s]}`}>
                              {labels[s]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="mt-2.5 rounded-xl border border-black/8 bg-white p-2.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-[0.38rem] text-black/30">점검 진행률</span>
                    <span className="text-[0.38rem] text-black/40">
                      {selected.items.filter((c) => c.status !== 'unchecked').length}/{selected.items.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/6 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: selected.status === 'issue' ? '#ef4444' : '#f97316' }}
                      animate={{ width: `${(selected.items.filter((c) => c.status !== 'unchecked').length / selected.items.length) * 100}%` }}
                      transition={{ duration: 0.3 }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PhoneShell>

        {/* Summary panel */}
        <div className="flex flex-col gap-3 w-36">
          <p className="text-[0.44rem] tracking-[0.3em] text-black/25 uppercase">오늘 현황</p>
          {[
            { label: '완료', count: households.filter((h) => h.status === 'done').length, color: 'text-emerald-500' },
            { label: '이상', count: households.filter((h) => h.status === 'issue').length, color: 'text-red-400' },
            { label: '점검중', count: households.filter((h) => h.status === 'in-progress').length, color: 'text-blue-500' },
            { label: '대기', count: households.filter((h) => h.status === 'pending').length, color: 'text-black/30' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <p className={`text-[0.9rem] font-light w-6 text-right ${s.color}`}>{s.count}</p>
              <p className="text-[0.44rem] tracking-[0.15em] text-black/35">{s.label}</p>
            </div>
          ))}

          <div className="w-full h-px bg-black/6 my-1" />

          <div className="rounded-xl border border-black/8 bg-white p-2.5">
            <p className="text-[0.4rem] tracking-[0.2em] text-black/25 uppercase mb-2">점검 항목</p>
            {['보일러', '가스배관', '계량기', '환기구', '연소기', '안전밸브'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 py-0.5">
                <div className="w-1 h-1 rounded-full bg-orange-400" />
                <span className="text-[0.4rem] text-black/40">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
