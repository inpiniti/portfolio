'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Types ─────────────────────────────────── */
type DeviceType = 'crane' | 'agv' | 'sensor' | 'camera' | 'gate';
type DeviceStatus = 'normal' | 'warning' | 'error' | 'offline';

interface PortDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  mapX: number;
  mapY: number;
  value?: string;
  unit?: string;
  alerts?: string[];
}

const INITIAL_DEVICES: PortDevice[] = [
  { id: 'd1', name: '크레인 #1', type: 'crane', status: 'normal', mapX: 20, mapY: 30, value: '42.3', unit: 'ton' },
  { id: 'd2', name: '크레인 #2', type: 'crane', status: 'warning', mapX: 40, mapY: 30, value: '38.1', unit: 'ton', alerts: ['과부하 경고'] },
  { id: 'd3', name: 'AGV #1', type: 'agv', status: 'normal', mapX: 30, mapY: 55, value: '12.4', unit: 'km/h' },
  { id: 'd4', name: 'AGV #2', type: 'agv', status: 'normal', mapX: 60, mapY: 55, value: '8.7', unit: 'km/h' },
  { id: 'd5', name: '온도 센서 A', type: 'sensor', status: 'normal', mapX: 70, mapY: 25, value: '24.5', unit: '°C' },
  { id: 'd6', name: '습도 센서 B', type: 'sensor', status: 'error', mapX: 75, mapY: 65, value: '--', unit: '%', alerts: ['통신 오류'] },
  { id: 'd7', name: 'CCTV #1', type: 'camera', status: 'normal', mapX: 15, mapY: 70, value: 'LIVE' },
  { id: 'd8', name: '출입 게이트', type: 'gate', status: 'normal', mapX: 85, mapY: 48, value: 'OPEN' },
];

const DEVICE_ICON: Record<DeviceType, string> = {
  crane: '🏗', agv: '🚛', sensor: '📡', camera: '📷', gate: '🚧',
};

const STATUS_COLOR: Record<DeviceStatus, string> = {
  normal: '#22c55e', warning: '#f59e0b', error: '#ef4444', offline: '#9ca3af',
};

const STATUS_BG: Record<DeviceStatus, string> = {
  normal: 'bg-emerald-50 border-emerald-200/60',
  warning: 'bg-amber-50 border-amber-200/60',
  error: 'bg-red-50 border-red-200/60',
  offline: 'bg-gray-50 border-gray-200/60',
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

/* ─── Mobius oneM2M data flow ─────────────────── */
function DataFlowBadge({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/6 bg-white/70">
      <span className="text-[0.38rem] tracking-[0.22em] text-black/25 uppercase">Device → Mobius → API → Frontend</span>
      {active && (
        <motion.div className="flex gap-0.5" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-1 h-1 rounded-full bg-blue-400"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export function IoTPortDemo({ onBack }: { onBack: () => void }) {
  const [devices, setDevices] = useState<PortDevice[]>(INITIAL_DEVICES);
  const [selected, setSelected] = useState<PortDevice | null>(null);
  const [tick, setTick] = useState(0);

  // Simulate live sensor updates
  useEffect(() => {
    const t = setInterval(() => {
      setTick((n) => n + 1);
      setDevices((prev) => prev.map((d) => {
        if (d.type === 'sensor' && d.status !== 'error') {
          const base = d.unit === '°C' ? 24.5 : 62;
          const noise = (Math.random() - 0.5) * 2;
          return { ...d, value: (base + noise).toFixed(1) };
        }
        if (d.type === 'agv') {
          const base = parseFloat(d.value ?? '10');
          const noise = (Math.random() - 0.5) * 1.5;
          return { ...d, value: Math.max(0, base + noise).toFixed(1) };
        }
        return d;
      }));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const alerts = devices.filter((d) => d.alerts?.length);
  const normalCount = devices.filter((d) => d.status === 'normal').length;

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <motion.div className="flex flex-col items-center gap-1 pt-14 pb-2 shrink-0"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">아이오코드</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">IoT 항만물류 모니터링</h2>
      </motion.div>

      <div className="flex justify-center pb-2 shrink-0">
        <DataFlowBadge active={true} />
      </div>

      <div className="flex-1 flex gap-3 px-4 pb-4 min-h-0 overflow-hidden">
        {/* Map */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Stats row */}
          <div className="flex gap-2 shrink-0">
            {[
              { label: '장치', val: devices.length, color: 'text-black/55' },
              { label: '정상', val: normalCount, color: 'text-emerald-500' },
              { label: '경고', val: devices.filter((d) => d.status === 'warning').length, color: 'text-amber-500' },
              { label: '오류', val: devices.filter((d) => d.status === 'error').length, color: 'text-red-400' },
            ].map((s) => (
              <div key={s.label} className="flex-1 rounded-xl border border-black/8 bg-white p-2 text-center">
                <p className={`text-[0.75rem] font-light ${s.color}`}>{s.val}</p>
                <p className="text-[0.38rem] tracking-[0.2em] text-black/25">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Port map */}
          <div className="flex-1 rounded-2xl border border-black/8 bg-gradient-to-br from-blue-50 to-cyan-50 relative overflow-hidden min-h-0">
            {/* Water area */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.15) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-blue-200/30 rounded-b-2xl" />
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[0.38rem] tracking-[0.3em] text-blue-400/60 uppercase">바다</p>
            <p className="absolute top-2 left-1/2 -translate-x-1/2 text-[0.38rem] tracking-[0.3em] text-black/20 uppercase">항만 부두</p>

            {/* Devices */}
            {devices.map((d) => (
              <motion.button key={d.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 cursor-pointer group"
                style={{ left: `${d.mapX}%`, top: `${d.mapY}%` }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(selected?.id === d.id ? null : d)}>
                <div className="relative">
                  <span className="text-lg leading-none">{DEVICE_ICON[d.type]}</span>
                  {/* Status dot */}
                  <motion.div
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                    style={{ background: STATUS_COLOR[d.status] }}
                    animate={d.status !== 'normal' ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }} />
                </div>
                <span className="text-[0.32rem] text-black/40 leading-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.name}
                </span>
              </motion.button>
            ))}

            {/* Selected tooltip */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className={`absolute rounded-xl border p-2.5 shadow-lg ${STATUS_BG[selected.status]}`}
                  style={{ left: Math.min(selected.mapX + 5, 55) + '%', top: Math.min(selected.mapY - 5, 70) + '%', zIndex: 10, minWidth: 110 }}>
                  <p className="text-[0.5rem] font-medium text-black/65">{selected.name}</p>
                  {selected.value && (
                    <p className="text-[0.62rem] font-light text-black/55 mt-0.5">
                      {selected.value} <span className="text-[0.38rem] text-black/30">{selected.unit}</span>
                    </p>
                  )}
                  {selected.alerts?.map((a) => (
                    <p key={a} className="text-[0.4rem] text-red-500 mt-0.5">⚠ {a}</p>
                  ))}
                  <p className="text-[0.36rem] text-black/25 mt-1 font-mono">ID: {selected.id}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Alert panel */}
        <div className="w-40 shrink-0 flex flex-col gap-2 overflow-y-auto">
          <p className="text-[0.4rem] tracking-[0.3em] text-black/25 uppercase shrink-0">알람</p>
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-black/8 bg-white p-3 flex items-center justify-center">
              <p className="text-[0.42rem] text-emerald-500">정상 운영중</p>
            </div>
          ) : (
            alerts.map((d) => (
              <motion.div key={d.id} animate={{ x: [0, 2, 0] }} transition={{ duration: 0.5, repeat: 2 }}
                className="rounded-xl border border-red-200/60 bg-red-50 p-2.5">
                <p className="text-[0.48rem] font-medium text-red-500">{d.name}</p>
                {d.alerts?.map((a) => (
                  <p key={a} className="text-[0.4rem] text-red-400 mt-0.5">⚠ {a}</p>
                ))}
              </motion.div>
            ))
          )}

          {/* Live feed indicator */}
          <div className="rounded-xl border border-black/8 bg-white p-2.5 mt-auto">
            <div className="flex items-center gap-1.5 mb-1">
              <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-400"
                animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-[0.4rem] tracking-[0.18em] text-black/35">LIVE</span>
            </div>
            <p className="text-[0.38rem] text-black/25">Mobius CSE</p>
            <p className="text-[0.38rem] text-black/20 font-mono">oneM2M · HTTP/2</p>
            <p className="text-[0.38rem] text-black/20 mt-0.5">Tick #{tick}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
