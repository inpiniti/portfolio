'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Types ─────────────────────────────────── */
type ApiType = 'domestic' | 'international' | 'safe-number';
type CallStep = 'idle' | 'requesting' | 'processing' | 'success' | 'error';

const API_CATALOG: {
  id: ApiType;
  name: string;
  method: string;
  path: string;
  desc: string;
  callers: string[];
  color: string;
}[] = [
  {
    id: 'domestic',
    name: '국내 운송 API',
    method: 'POST',
    path: '/api/v1/delivery/domestic',
    desc: '국내 택배 접수 · 추적 · 상태 조회',
    callers: ['한진앱', '쿠팡', 'G마켓', '11번가'],
    color: '#2563eb',
  },
  {
    id: 'international',
    name: '국제 택배 API',
    method: 'POST',
    path: '/api/v1/delivery/international',
    desc: '해외 배송 접수 · 통관 상태 · ETA',
    callers: ['한진앱', '쿠팡', '쿠팡외 업체'],
    color: '#7c3aed',
  },
  {
    id: 'safe-number',
    name: 'LG 안심번호 API',
    method: 'GET',
    path: '/api/v1/safety-number/issue',
    desc: '발신자 번호 가상화 · 개인정보 보호',
    callers: ['한진앱', '기사 앱', '쿠팡'],
    color: '#059669',
  },
];

const MOCK_REQUESTS: Record<ApiType, object> = {
  domestic: {
    senderName: '김철수',
    senderPhone: '010-1234-5678',
    receiverName: '이영희',
    receiverAddr: '서울시 강남구 테헤란로 123',
    weight: '2.5kg',
    productName: '전자제품',
  },
  international: {
    senderCountry: 'KR',
    receiverCountry: 'US',
    trackingType: 'EXPRESS',
    weight: '1.2kg',
    declaredValue: 150,
    currency: 'USD',
  },
  'safe-number': {
    originalPhone: '010-9876-5432',
    purpose: 'DELIVERY',
    expireMinutes: 60,
    assignedDriverId: 'DRV_00412',
  },
};

const MOCK_RESPONSES: Record<ApiType, object> = {
  domestic: {
    status: 'SUCCESS',
    trackingNo: 'HJ20251107001234',
    estimatedArrival: '2025-11-09',
    currentStatus: '배송 준비중',
    waybill: 'https://www.hanjin.com/kor/waybill/...',
  },
  international: {
    status: 'SUCCESS',
    trackingNo: 'HJI2025KR11001',
    customsClearance: 'PENDING',
    estimatedArrival: '2025-11-14',
    carrier: 'HANJIN EXPRESS',
  },
  'safe-number': {
    status: 'SUCCESS',
    safeNumber: '050-7120-8234',
    expireAt: '2025-11-07T15:30:00Z',
    maskedOriginal: '010-****-5432',
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

function JsonBox({ data, title }: { data: object; title: string }) {
  return (
    <div className="rounded-xl border border-black/8 bg-white overflow-hidden">
      <div className="px-3 py-1.5 border-b border-black/6 flex items-center gap-2">
        <span className="text-[0.38rem] tracking-[0.28em] text-black/30 uppercase">{title}</span>
      </div>
      <pre className="text-[0.42rem] leading-relaxed text-black/55 p-3 overflow-x-auto whitespace-pre-wrap break-all font-mono">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/* ─── Caller chips flow ───────────────────────── */
function CallerFlow({ callers, apiName, color, step }: {
  callers: string[];
  apiName: string;
  color: string;
  step: CallStep;
}) {
  const active = step === 'requesting' || step === 'processing' || step === 'success';
  return (
    <div className="rounded-xl border border-black/8 bg-white p-3">
      <p className="text-[0.4rem] tracking-[0.28em] text-black/25 uppercase mb-3">API 호출 흐름</p>
      <div className="flex items-center gap-2 flex-wrap">
        {callers.map((caller, i) => (
          <div key={caller} className="flex items-center gap-2">
            <motion.div
              animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.6, delay: i * 0.15, repeat: active ? Infinity : 0 }}
              className="px-2 py-1 rounded-lg text-[0.42rem] tracking-wide border"
              style={{
                borderColor: active ? `${color}60` : 'rgba(0,0,0,0.1)',
                background: active ? `${color}12` : 'rgba(0,0,0,0.02)',
                color: active ? color : 'rgba(0,0,0,0.4)',
              }}>
              {caller}
            </motion.div>
            {i < callers.length - 1 && (
              <motion.span className="text-[0.5rem] text-black/20"
                animate={active ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0.3 }}
                transition={{ duration: 0.8, delay: i * 0.1, repeat: active ? Infinity : 0 }}>
                →
              </motion.span>
            )}
          </div>
        ))}
        <motion.span className="text-[0.5rem] text-black/20"
          animate={active ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0.3 }}
          transition={{ duration: 0.8, repeat: active ? Infinity : 0 }}>→</motion.span>
        <motion.div
          animate={step === 'success' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="px-2 py-1 rounded-lg text-[0.42rem] tracking-wide border font-medium"
          style={{ borderColor: `${color}80`, background: `${color}18`, color }}>
          D-Bridge Server
        </motion.div>
      </div>
    </div>
  );
}

export function HanjinApiDemo({ onBack }: { onBack: () => void }) {
  const [selected, setSelected] = useState<ApiType>('domestic');
  const [step, setStep] = useState<CallStep>('idle');

  const api = API_CATALOG.find((a) => a.id === selected)!;

  const callApi = async () => {
    setStep('requesting');
    await new Promise((r) => setTimeout(r, 800));
    setStep('processing');
    await new Promise((r) => setTimeout(r, 1200));
    setStep('success');
  };

  const reset = () => setStep('idle');

  const stepColors: Record<CallStep, string> = {
    idle: 'text-black/25',
    requesting: 'text-amber-500',
    processing: 'text-blue-500',
    success: 'text-emerald-500',
    error: 'text-red-400',
  };
  const stepLabels: Record<CallStep, string> = {
    idle: '대기',
    requesting: '요청 전송 중...',
    processing: '서버 처리 중...',
    success: '응답 완료',
    error: '오류',
  };

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <motion.div className="flex flex-col items-center gap-1 pt-14 pb-3 shrink-0"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">사이버이메지네이션</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">한진택배 D-Bridge API</h2>
      </motion.div>

      <div className="flex-1 flex gap-4 px-5 pb-5 min-h-0 overflow-hidden">
        {/* Left: API list */}
        <div className="flex flex-col gap-2 w-44 shrink-0 overflow-y-auto">
          <p className="text-[0.4rem] tracking-[0.3em] text-black/25 uppercase mb-1">API 목록</p>
          {API_CATALOG.map((api) => (
            <motion.button key={api.id}
              whileHover={{ x: 2 }}
              onClick={() => { setSelected(api.id); reset(); }}
              className="text-left rounded-xl border p-2.5 transition-all duration-200 cursor-pointer"
              style={{
                borderColor: selected === api.id ? `${api.color}50` : 'rgba(0,0,0,0.08)',
                background: selected === api.id ? `${api.color}0e` : 'white',
              }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[0.38rem] font-bold tracking-wide px-1 py-0.5 rounded"
                  style={{ background: api.color, color: 'white' }}>
                  {api.method}
                </span>
                <span className="text-[0.42rem] font-medium" style={{ color: api.color }}>{api.name}</span>
              </div>
              <p className="text-[0.4rem] text-black/35 font-mono">{api.path}</p>
              <p className="text-[0.38rem] text-black/30 mt-0.5 leading-snug">{api.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Right: Detail + Request/Response */}
        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto min-w-0">
          <CallerFlow callers={api.callers} apiName={api.name} color={api.color} step={step} />

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-black/6" />
            <span className={`text-[0.44rem] tracking-[0.2em] font-medium transition-colors ${stepColors[step]}`}>
              {stepLabels[step]}
            </span>
            <div className="flex-1 h-px bg-black/6" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <JsonBox data={MOCK_REQUESTS[selected]} title="Request Body" />
            <AnimatePresence mode="wait">
              {step === 'success' ? (
                <motion.div key="resp"
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                  <JsonBox data={MOCK_RESPONSES[selected]} title="Response" />
                </motion.div>
              ) : (
                <motion.div key="waiting" className="rounded-xl border border-black/8 bg-white flex items-center justify-center min-h-24"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {step === 'idle' ? (
                    <p className="text-[0.44rem] tracking-[0.2em] text-black/20">응답 대기</p>
                  ) : (
                    <motion.div className="flex gap-1"
                      animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-black/25"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={callApi}
              disabled={step !== 'idle'}
              className="flex-1 py-2 rounded-xl text-[0.5rem] tracking-widest font-medium text-white cursor-pointer disabled:opacity-40"
              style={{ background: api.color }}>
              API 호출
            </motion.button>
            {step === 'success' && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={reset}
                className="px-4 py-2 rounded-xl border border-black/10 text-[0.48rem] tracking-widest text-black/40 cursor-pointer bg-white">
                초기화
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
