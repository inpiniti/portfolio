'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Types ─────────────────────────────────── */
interface Vessel {
  id: string;
  name: string;
  type: string;
  flag: string;
  mmsi: string;
  speed: number;
  heading: number;
  lat: number;
  lon: number;
  destination?: string;
  status: 'underway' | 'anchored' | 'moored';
}

/* ─── Mock world vessels ─────────────────────── */
const INITIAL_VESSELS: Vessel[] = [
  { id: 'v1', name: 'PACIFIC EAGLE', type: 'Container', flag: '🇰🇷', mmsi: '440123456', speed: 18.4, heading: 245, lat: 35.1, lon: 129.3, destination: 'USLAX', status: 'underway' },
  { id: 'v2', name: 'GOLDEN STAR', type: 'Tanker', flag: '🇯🇵', mmsi: '431234567', speed: 14.2, heading: 90, lat: 33.8, lon: 131.5, destination: 'JPYOK', status: 'underway' },
  { id: 'v3', name: 'MSC EUROPE', type: 'Container', flag: '🇵🇦', mmsi: '352345678', speed: 0, heading: 180, lat: 37.4, lon: 126.8, destination: 'KRINC', status: 'anchored' },
  { id: 'v4', name: 'BUSAN SPIRIT', type: 'Bulk Carrier', flag: '🇰🇷', mmsi: '440654321', speed: 11.0, heading: 30, lat: 34.5, lon: 135.2, destination: 'CNSHA', status: 'underway' },
  { id: 'v5', name: 'OCEAN GIANT', type: 'Container', flag: '🇨🇳', mmsi: '412987654', speed: 0, heading: 0, lat: 31.2, lon: 121.5, destination: '', status: 'moored' },
  { id: 'v6', name: 'NORD BREEZE', type: 'Tanker', flag: '🇳🇴', mmsi: '257123456', speed: 16.5, heading: 180, lat: 38.9, lon: 140.2, destination: 'SGSIN', status: 'underway' },
];

/* Simple lat/lon → SVG percentage (East Asia focus) */
const LAT_MIN = 28, LAT_MAX = 42, LON_MIN = 118, LON_MAX = 148;
const toSvg = (lat: number, lon: number) => ({
  x: ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100,
  y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100,
});

const STATUS_COLOR = { underway: '#22c55e', anchored: '#f59e0b', moored: '#3b82f6' };
const STATUS_LABEL = { underway: '항해중', anchored: '정박중', moored: '접안중' };

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

export function OceanLookDemo({ onBack }: { onBack: () => void }) {
  const [vessels, setVessels] = useState<Vessel[]>(INITIAL_VESSELS);
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [tick, setTick] = useState(0);

  // Animate underway vessels
  useEffect(() => {
    const t = setInterval(() => {
      setTick((n) => n + 1);
      setVessels((prev) => prev.map((v) => {
        if (v.status !== 'underway') return v;
        const rad = (v.heading * Math.PI) / 180;
        const dLon = Math.sin(rad) * 0.03;
        const dLat = Math.cos(rad) * 0.02;
        return {
          ...v,
          lat: Math.max(LAT_MIN + 0.5, Math.min(LAT_MAX - 0.5, v.lat + dLat)),
          lon: Math.max(LON_MIN + 0.5, Math.min(LON_MAX - 0.5, v.lon + dLon)),
          speed: v.speed + (Math.random() - 0.5) * 0.3,
        };
      }));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  const types = ['ALL', ...Array.from(new Set(INITIAL_VESSELS.map((v) => v.type)))];
  const displayed = filter === 'ALL' ? vessels : vessels.filter((v) => v.type === filter);

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <motion.div className="flex flex-col items-center gap-1 pt-14 pb-2 shrink-0"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">에코마린</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">OceanLook 선박 모니터링</h2>
      </motion.div>

      {/* Filter + stats */}
      <div className="flex items-center justify-between px-4 pb-2 shrink-0">
        <div className="flex gap-1">
          {types.map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-2 py-0.5 rounded-full text-[0.4rem] tracking-wide cursor-pointer transition-all duration-150 ${filter === t ? 'bg-black/10 text-black/60' : 'text-black/25 hover:text-black/40'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-400"
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-[0.4rem] tracking-wide text-black/30">LIVE · {vessels.length}척</span>
        </div>
      </div>

      <div className="flex-1 flex gap-3 px-4 pb-4 min-h-0 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-black/8 min-w-0"
          style={{ background: 'linear-gradient(180deg, #0f2d52 0%, #1a4a7a 40%, #0e7490 100%)' }}>
          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <line x1={v} y1="0" x2={v} y2="100" stroke="white" strokeWidth="0.3" />
                <line x1="0" y1={v} x2="100" y2={v} stroke="white" strokeWidth="0.3" />
              </g>
            ))}
          </svg>

          {/* Landmass hint (simplified Korea/Japan outline) */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Korea */}
            <ellipse cx="28" cy="30" rx="6" ry="11" fill="rgba(34,197,94,0.18)" />
            {/* Japan mainland */}
            <ellipse cx="75" cy="22" rx="5" ry="14" fill="rgba(34,197,94,0.14)" transform="rotate(-25 75 22)" />
            {/* China coast */}
            <rect x="0" y="25" width="14" height="30" rx="2" fill="rgba(34,197,94,0.12)" />
          </svg>

          {/* Country labels */}
          <p className="absolute text-[0.32rem] text-white/25" style={{ left: '22%', top: '22%' }}>한국</p>
          <p className="absolute text-[0.32rem] text-white/25" style={{ left: '70%', top: '10%' }}>일본</p>
          <p className="absolute text-[0.32rem] text-white/25" style={{ left: '5%', top: '32%' }}>중국</p>

          {/* Vessels */}
          {displayed.map((v) => {
            const pos = toSvg(v.lat, v.lon);
            const isSelected = selected?.id === v.id;
            return (
              <motion.button key={v.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                transition={{ duration: 1.6, ease: 'linear' }}
                onClick={() => setSelected(isSelected ? null : v)}>
                <motion.div
                  style={{ rotate: v.heading - 90, color: STATUS_COLOR[v.status] }}
                  animate={v.status === 'underway' ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-sm leading-none drop-shadow">
                  ✈
                </motion.div>
                {isSelected && (
                  <motion.div className="absolute -inset-2 rounded-full border border-white/40"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }} />
                )}
              </motion.button>
            );
          })}

          {/* Status legend */}
          <div className="absolute bottom-2 left-2 flex flex-col gap-1">
            {Object.entries(STATUS_COLOR).map(([s, c]) => (
              <div key={s} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                <span className="text-[0.32rem] text-white/40">{STATUS_LABEL[s as keyof typeof STATUS_LABEL]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel */}
        <div className="w-44 shrink-0 flex flex-col gap-2 overflow-y-auto">
          {/* Selected vessel detail */}
          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl border border-blue-200/60 bg-blue-50 p-2.5 shrink-0">
                <div className="flex items-center gap-1 mb-1.5">
                  <span>{selected.flag}</span>
                  <p className="text-[0.52rem] font-medium text-black/65 leading-none">{selected.name}</p>
                </div>
                <div className="space-y-0.5">
                  {[
                    ['MMSI', selected.mmsi],
                    ['유형', selected.type],
                    ['속도', `${selected.speed.toFixed(1)} kn`],
                    ['방위', `${selected.heading}°`],
                    ['목적지', selected.destination || '-'],
                    ['상태', STATUS_LABEL[selected.status]],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[0.38rem] text-black/30">{k}</span>
                      <span className="text-[0.42rem] font-medium text-black/55 font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vessel list */}
          <p className="text-[0.4rem] tracking-[0.3em] text-black/25 uppercase shrink-0">선박 목록</p>
          {displayed.map((v) => (
            <motion.button key={v.id} whileHover={{ x: 2 }}
              onClick={() => setSelected(selected?.id === v.id ? null : v)}
              className={`text-left rounded-xl border p-2 cursor-pointer transition-all duration-200 ${selected?.id === v.id ? 'border-blue-300/60 bg-blue-50' : 'border-black/8 bg-white'}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[0.7rem]">{v.flag}</span>
                <span className="text-[0.44rem] font-medium text-black/60 truncate">{v.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full" style={{ background: STATUS_COLOR[v.status] }} />
                <span className="text-[0.38rem] text-black/30">{v.type}</span>
                <span className="text-[0.38rem] text-black/20">{v.speed.toFixed(1)}kn</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
