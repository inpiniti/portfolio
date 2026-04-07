'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── CII (Carbon Intensity Indicator) ──────── */
type CiiGrade = 'A' | 'B' | 'C' | 'D' | 'E';

interface VoyageLog {
  id: string;
  date: string;
  from: string;
  to: string;
  distanceNm: number;
  fuelTon: number;
  cargoTon: number;
  co2Ton: number;
}

const LOGS: VoyageLog[] = [
  { id: 'l1', date: '2025-10-01', from: 'KRPUS', to: 'CNSHA', distanceNm: 920, fuelTon: 42.5, cargoTon: 18000, co2Ton: 133.0 },
  { id: 'l2', date: '2025-10-08', from: 'CNSHA', to: 'JPYOK', distanceNm: 1080, fuelTon: 50.2, cargoTon: 21000, co2Ton: 157.1 },
  { id: 'l3', date: '2025-10-16', from: 'JPYOK', to: 'KRPUS', distanceNm: 960, fuelTon: 44.8, cargoTon: 16500, co2Ton: 140.2 },
  { id: 'l4', date: '2025-10-24', from: 'KRPUS', to: 'SGSIN', distanceNm: 2880, fuelTon: 132.1, cargoTon: 22000, co2Ton: 413.2 },
  { id: 'l5', date: '2025-11-02', from: 'SGSIN', to: 'KRPUS', distanceNm: 2880, fuelTon: 128.5, cargoTon: 19500, co2Ton: 401.9 },
];

// CII = CO2 / (Capacity × Distance) × 1e6 grams
// Required CII reference line for tanker 25000 DWT (simplified)
const CII_REQUIRED = 9.5; // g/ton·nm

function calcCii(log: VoyageLog): number {
  return (log.co2Ton * 1e6) / (log.cargoTon * log.distanceNm);
}

function ciiGrade(cii: number): CiiGrade {
  const ratio = cii / CII_REQUIRED;
  if (ratio < 0.86) return 'A';
  if (ratio < 0.93) return 'B';
  if (ratio < 1.05) return 'C';
  if (ratio < 1.14) return 'D';
  return 'E';
}

const GRADE_COLOR: Record<CiiGrade, string> = {
  A: '#15803d', B: '#22c55e', C: '#eab308', D: '#f97316', E: '#ef4444',
};
const GRADE_BG: Record<CiiGrade, string> = {
  A: 'bg-green-100 text-green-700', B: 'bg-emerald-100 text-emerald-600',
  C: 'bg-yellow-100 text-yellow-600', D: 'bg-orange-100 text-orange-600',
  E: 'bg-red-100 text-red-600',
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

/* ─── Mini bar chart ──────────────────────────── */
function CiiChart({ logs }: { logs: VoyageLog[] }) {
  const values = logs.map((l) => calcCii(l));
  const maxVal = Math.max(...values, CII_REQUIRED * 1.3);

  return (
    <div className="rounded-xl border border-black/8 bg-white p-3">
      <p className="text-[0.42rem] tracking-[0.28em] text-black/25 uppercase mb-2.5">항차별 CII (g/ton·nm)</p>
      <div className="flex items-end gap-2 h-20 relative">
        {/* Required line */}
        <div className="absolute left-0 right-0 border-t border-dashed border-red-300/70"
          style={{ bottom: `${(CII_REQUIRED / maxVal) * 80}px` }}>
          <span className="absolute right-0 -top-3 text-[0.36rem] text-red-400 bg-white px-0.5">IMO 기준 {CII_REQUIRED}</span>
        </div>

        {logs.map((l, i) => {
          const cii = values[i];
          const grade = ciiGrade(cii);
          const h = (cii / maxVal) * 80;
          return (
            <div key={l.id} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full rounded-t"
                style={{ background: GRADE_COLOR[grade] + '90', height: h }}
                initial={{ height: 0 }} animate={{ height: h }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'backOut' }} />
              <span className="text-[0.34rem] text-black/35 font-mono">{cii.toFixed(1)}</span>
              <span className={`text-[0.38rem] font-bold px-0.5 rounded ${GRADE_BG[grade]}`}>{grade}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-2 flex-wrap">
        {(['A', 'B', 'C', 'D', 'E'] as CiiGrade[]).map((g) => (
          <div key={g} className="flex items-center gap-0.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: GRADE_COLOR[g] }} />
            <span className="text-[0.34rem] text-black/30">{g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogbookDemo({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<VoyageLog | null>(null);

  const totalCo2 = LOGS.reduce((s, l) => s + l.co2Ton, 0);
  const avgCii = LOGS.reduce((s, l) => s + calcCii(l), 0) / LOGS.length;
  const avgGrade = ciiGrade(avgCii);
  const exceeding = LOGS.filter((l) => calcCii(l) > CII_REQUIRED).length;

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <motion.div className="flex flex-col items-center gap-1 pt-14 pb-3 shrink-0"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">에코마린</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">로그북 · CII 탄소배출 관리</h2>
      </motion.div>

      <div className="flex-1 flex gap-3 px-4 pb-4 min-h-0 overflow-hidden">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto min-w-0">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            {[
              { label: '총 CO₂', val: `${totalCo2.toFixed(0)}t`, sub: '배출량' },
              { label: '평균 CII', val: avgCii.toFixed(1), sub: 'g/ton·nm' },
              { label: 'IMO 초과', val: `${exceeding}회`, sub: '항차 중' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-black/8 bg-white p-2.5 text-center">
                <p className="text-[0.7rem] font-light text-black/55">{s.val}</p>
                <p className="text-[0.38rem] tracking-[0.15em] text-black/25 mt-0.5">{s.label}</p>
                <p className="text-[0.34rem] text-black/18">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Overall grade */}
          <div className="rounded-xl border border-black/8 bg-white p-3 flex items-center gap-4 shrink-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold ${GRADE_BG[avgGrade]}`}>
              {avgGrade}
            </div>
            <div>
              <p className="text-[0.55rem] font-medium text-black/60">2025년 종합 CII 등급</p>
              <p className="text-[0.42rem] text-black/30 mt-0.5">IMO CII 기준 대비 {((avgCii / CII_REQUIRED) * 100 - 100).toFixed(1)}%</p>
              {avgGrade === 'D' || avgGrade === 'E' ? (
                <p className="text-[0.4rem] text-red-400 mt-0.5">⚠ 개선 계획 수립 필요</p>
              ) : (
                <p className="text-[0.4rem] text-emerald-500 mt-0.5">✓ IMO 기준 충족</p>
              )}
            </div>
          </div>

          <CiiChart logs={LOGS} />
        </div>

        {/* Right column: voyage list + detail */}
        <div className="w-44 shrink-0 flex flex-col gap-2 overflow-y-auto">
          <p className="text-[0.4rem] tracking-[0.3em] text-black/25 uppercase shrink-0">항차 로그</p>
          {LOGS.map((log) => {
            const cii = calcCii(log);
            const grade = ciiGrade(cii);
            const over = cii > CII_REQUIRED;
            return (
              <motion.button key={log.id} whileHover={{ x: 2 }}
                onClick={() => setSelected(selected?.id === log.id ? null : log)}
                className={`text-left rounded-xl border p-2.5 cursor-pointer transition-all duration-200 ${selected?.id === log.id ? 'border-blue-300/60 bg-blue-50' : 'border-black/8 bg-white'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.4rem] text-black/30">{log.date}</span>
                  <span className={`text-[0.4rem] font-bold px-1 rounded ${GRADE_BG[grade]}`}>{grade}</span>
                </div>
                <p className="text-[0.46rem] font-medium text-black/55">{log.from} → {log.to}</p>
                <div className="flex gap-2 mt-0.5">
                  <span className="text-[0.38rem] text-black/30">{log.co2Ton}t CO₂</span>
                  {over && <span className="text-[0.38rem] text-red-400">기준 초과</span>}
                </div>
              </motion.button>
            );
          })}

          {/* Detail popup */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl border border-blue-200/60 bg-blue-50 p-2.5 shrink-0">
                <p className="text-[0.46rem] font-medium text-blue-600 mb-1.5">{selected.from} → {selected.to}</p>
                {[
                  ['거리', `${selected.distanceNm} nm`],
                  ['연료', `${selected.fuelTon} ton`],
                  ['화물', `${selected.cargoTon.toLocaleString()} ton`],
                  ['CO₂', `${selected.co2Ton} ton`],
                  ['CII', `${calcCii(selected).toFixed(2)} g/ton·nm`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-blue-100 py-0.5">
                    <span className="text-[0.38rem] text-black/30">{k}</span>
                    <span className="text-[0.42rem] font-medium text-black/55 font-mono">{v}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
