'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── AAS (Asset Administration Shell) concept ── */
type Tab = 'overview' | 'aas-editor' | 'aasx-server';

interface AasAsset {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  eclass: string;
  cdd: string;
  submodels: string[];
  status: 'online' | 'offline' | 'syncing';
}

const ASSETS: AasAsset[] = [
  {
    id: 'asset-001',
    name: 'CNC 가공기 #1',
    type: 'Manufacturing',
    manufacturer: '현대위아',
    eclass: '27-01-04-01',
    cdd: 'IEC61360-2',
    submodels: ['Nameplate', 'TechnicalData', 'Documentation', 'Maintenance'],
    status: 'online',
  },
  {
    id: 'asset-002',
    name: '협동 로봇 UR10e',
    type: 'Robot',
    manufacturer: 'Universal Robots',
    eclass: '27-03-01-01',
    cdd: 'IEC61360-2',
    submodels: ['Nameplate', 'TechnicalData', 'SafetyData'],
    status: 'syncing',
  },
  {
    id: 'asset-003',
    name: 'PLC 제어반',
    type: 'Control',
    manufacturer: 'Siemens',
    eclass: '27-02-08-01',
    cdd: 'IEC61360-2',
    submodels: ['Nameplate', 'TechnicalData', 'PLC_Program'],
    status: 'online',
  },
];

const SUBMODEL_DATA: Record<string, Record<string, string>> = {
  Nameplate: {
    ManufacturerName: 'HYUNDAI WIA',
    ManufacturerProductDesignation: 'KH 40G',
    SerialNumber: 'HW-2022-001234',
    YearOfConstruction: '2022',
  },
  TechnicalData: {
    MaxSpindleSpeed: '12000 rpm',
    TableSize: '1000 x 500 mm',
    MaxToolWeight: '8 kg',
    WorkingVoltage: '380V / 50Hz',
  },
  Documentation: {
    OperationManual: 'DOC_HW_OP_001.pdf',
    MaintenanceGuide: 'DOC_HW_MT_001.pdf',
    SafetyInstruction: 'DOC_HW_SF_001.pdf',
  },
  Maintenance: {
    LastMaintenanceDate: '2025-09-15',
    NextMaintenanceDate: '2026-03-15',
    MaintenanceCycle: '6개월',
    ResponsiblePerson: '김기사',
  },
  SafetyData: {
    SafetyCategory: 'PLd / Cat.3',
    StopTime: '< 200ms',
    ForceLimitSetting: '150N',
  },
  PLC_Program: {
    ProgramVersion: 'v3.2.1',
    CycleTime: '10ms',
    IOCount: 'DI:64 / DO:64',
  },
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

const STATUS_STYLE = {
  online: 'bg-emerald-100 text-emerald-600',
  offline: 'bg-gray-100 text-gray-400',
  syncing: 'bg-blue-100 text-blue-500',
};

/* ─── Overview tab ───────────────────────────── */
function OverviewTab() {
  const [selectedAsset, setSelectedAsset] = useState<AasAsset>(ASSETS[0]);
  const [selectedSubmodel, setSelectedSubmodel] = useState('Nameplate');

  return (
    <div className="flex gap-3 h-full overflow-hidden">
      {/* Asset list */}
      <div className="w-36 shrink-0 flex flex-col gap-2 overflow-y-auto">
        <p className="text-[0.4rem] tracking-[0.3em] text-black/25 uppercase shrink-0">자산 목록</p>
        {ASSETS.map((asset) => (
          <motion.button key={asset.id} whileHover={{ x: 2 }}
            onClick={() => { setSelectedAsset(asset); setSelectedSubmodel('Nameplate'); }}
            className={`text-left rounded-xl border p-2.5 cursor-pointer transition-all duration-200 ${selectedAsset.id === asset.id ? 'border-blue-300/60 bg-blue-50' : 'border-black/8 bg-white'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-1.5 h-1.5 rounded-full ${
                asset.status === 'online' ? 'bg-emerald-400' :
                asset.status === 'syncing' ? 'bg-blue-400' : 'bg-gray-300'
              }`} />
              <span className="text-[0.44rem] font-medium text-black/60 leading-none">{asset.name}</span>
            </div>
            <p className="text-[0.38rem] text-black/30">{asset.type}</p>
            <span className={`text-[0.36rem] px-1.5 py-0.5 rounded-full mt-1 inline-block ${STATUS_STYLE[asset.status]}`}>
              {asset.status === 'syncing' ? '동기화중' : asset.status}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Asset detail */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto min-w-0">
        <div className="rounded-xl border border-black/8 bg-white p-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[0.6rem] font-medium text-black/65">{selectedAsset.name}</p>
              <p className="text-[0.44rem] text-black/30 mt-0.5">{selectedAsset.id}</p>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <span className="text-[0.38rem] text-black/30">eCl@ss: <span className="text-black/50 font-mono">{selectedAsset.eclass}</span></span>
              <span className="text-[0.38rem] text-black/30">CDD: <span className="text-black/50 font-mono">{selectedAsset.cdd}</span></span>
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {selectedAsset.submodels.map((sm) => (
              <button key={sm}
                onClick={() => setSelectedSubmodel(sm)}
                className={`px-2 py-0.5 rounded-lg text-[0.4rem] tracking-wide cursor-pointer transition-all duration-150 ${
                  selectedSubmodel === sm ? 'bg-blue-500 text-white' : 'bg-black/5 text-black/45 hover:bg-black/10'
                }`}>
                {sm}
              </button>
            ))}
          </div>
        </div>

        {/* Submodel data */}
        <AnimatePresence mode="wait">
          <motion.div key={selectedSubmodel}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border border-black/8 bg-white p-3">
            <p className="text-[0.42rem] tracking-[0.25em] text-black/25 uppercase mb-2">{selectedSubmodel}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {Object.entries(SUBMODEL_DATA[selectedSubmodel] ?? {}).map(([k, v]) => (
                <div key={k} className="border-b border-black/4 pb-1">
                  <p className="text-[0.38rem] text-black/30">{k}</p>
                  <p className="text-[0.46rem] font-medium text-black/60 font-mono mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── AASX Server tab ─────────────────────────── */
function AasxServerTab() {
  const [logs, setLogs] = useState<string[]>([
    '[INFO] AASX Server v3.0 started on :5001',
    '[INFO] Loaded 3 AAS packages',
    '[INFO] REST API: /api/v3.0/shells',
  ]);
  const [fetching, setFetching] = useState(false);

  const simulateFetch = async (endpoint: string) => {
    setFetching(true);
    setLogs((p) => [...p, `[GET] ${endpoint}`]);
    await new Promise((r) => setTimeout(r, 600));
    setLogs((p) => [...p, `[200] OK — ${Math.floor(Math.random() * 3) + 1} records`]);
    setFetching(false);
  };

  const ENDPOINTS = [
    '/api/v3.0/shells',
    '/api/v3.0/shells/asset-001/submodels',
    '/api/v3.0/submodels/Nameplate',
    '/api/v3.0/concept-descriptions',
  ];

  return (
    <div className="flex gap-3 h-full overflow-hidden">
      <div className="w-44 shrink-0 flex flex-col gap-2">
        <p className="text-[0.4rem] tracking-[0.3em] text-black/25 uppercase">AASX 서버 엔드포인트</p>
        <div className="flex flex-col gap-1.5">
          {ENDPOINTS.map((ep) => (
            <motion.button key={ep} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
              onClick={() => simulateFetch(ep)}
              disabled={fetching}
              className="text-left rounded-xl border border-black/8 bg-white p-2 cursor-pointer hover:border-blue-300 disabled:opacity-50 transition-colors">
              <span className="text-[0.36rem] font-bold text-blue-500 mr-1">GET</span>
              <span className="text-[0.38rem] text-black/50 font-mono break-all">{ep}</span>
            </motion.button>
          ))}
        </div>
        <div className="mt-2 rounded-xl border border-black/8 bg-white p-2.5">
          <p className="text-[0.38rem] tracking-[0.22em] text-black/25 uppercase mb-1.5">표준</p>
          {['IEC 63278', 'IEC 61360', 'eCl@ss 12.0', 'oneM2M'].map((s) => (
            <div key={s} className="flex items-center gap-1.5 py-0.5">
              <div className="w-1 h-1 rounded-full bg-blue-400" />
              <span className="text-[0.4rem] text-black/45">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log terminal */}
      <div className="flex-1 flex flex-col rounded-xl border border-black/8 overflow-hidden">
        <div className="bg-gray-900 px-3 py-2 flex items-center gap-2 shrink-0">
          <div className="flex gap-1.5">
            {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
              <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <span className="text-[0.4rem] text-gray-400 font-mono">AASX Server — localhost:5001</span>
        </div>
        <div className="flex-1 bg-gray-950 p-3 overflow-y-auto font-mono">
          {logs.map((line, i) => (
            <motion.p key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              className={`text-[0.4rem] leading-relaxed ${
                line.startsWith('[INFO]') ? 'text-gray-400' :
                line.startsWith('[GET]') ? 'text-yellow-400' :
                line.startsWith('[200]') ? 'text-emerald-400' : 'text-gray-500'
              }`}>
              {line}
            </motion.p>
          ))}
          {fetching && (
            <motion.p className="text-[0.4rem] text-blue-400 font-mono"
              animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity }}>
              처리 중...
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SmartManufacturingDemo({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'AAS 자산' },
    { id: 'aasx-server', label: 'AASX 서버' },
  ];

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <motion.div className="flex flex-col items-center gap-1 pt-14 pb-3 shrink-0"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">아이오코드</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">스마트제조혁신 · AAS</h2>
      </motion.div>

      {/* Tab bar */}
      <div className="flex justify-center gap-1 pb-3 shrink-0">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-[0.46rem] tracking-[0.18em] cursor-pointer transition-all duration-200 ${
              tab === t.id ? 'bg-black/8 text-black/65' : 'text-black/30 hover:text-black/50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 px-5 pb-5 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={tab} className="h-full"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {tab === 'overview' && <OverviewTab />}
            {tab === 'aasx-server' && <AasxServerTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
