'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type FlowStep = 'idle' | 'ordered' | 'pickup' | 'washing' | 'delivery' | 'done';

type Shop = {
  id: string;
  name: string;
  eta: string;
};

type Cloth = {
  id: string;
  label: string;
  icon: string;
};

const SHOPS: Shop[] = [
  { id: 's1', name: '버블클린 문현점', eta: '수거 25분' },
  { id: 's2', name: '화이트런드리 대연점', eta: '수거 40분' },
  { id: 's3', name: '프레시워시 남천점', eta: '수거 35분' },
];

const CLOTHES: Cloth[] = [
  { id: 'shirt', label: '셔츠', icon: '👔' },
  { id: 'coat', label: '코트', icon: '🧥' },
  { id: 'blanket', label: '이불', icon: '🛏' },
  { id: 'shoes', label: '신발', icon: '👟' },
  { id: 'dress', label: '원피스', icon: '👗' },
  { id: 'suit', label: '정장', icon: '🕴' },
];

const FLOW: { step: FlowStep; label: string; hint: string; wait: number }[] = [
  { step: 'ordered', label: '주문 접수', hint: '세탁소가 수거 준비 중', wait: 900 },
  { step: 'pickup', label: '기사 수거', hint: '옷을 픽업했습니다', wait: 1200 },
  { step: 'washing', label: '세탁 진행', hint: '세탁/건조/검수 중', wait: 1600 },
  { step: 'delivery', label: '배송 출발', hint: '도착까지 17분', wait: 1300 },
  { step: 'done', label: '배송 완료', hint: '문 앞 배송 완료', wait: 0 },
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

function StepRail({ current }: { current: FlowStep }) {
  const activeIndex = FLOW.findIndex((f) => f.step === current);

  return (
    <div className="flex items-center justify-between gap-2">
      {FLOW.map((item, idx) => {
        const on = activeIndex >= idx;
        const pulse = item.step === current && current !== 'done';
        return (
          <div key={item.step} className="flex items-center gap-2 flex-1 min-w-0">
            <motion.div
              animate={pulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.8, repeat: pulse ? Infinity : 0 }}
              className="h-6 min-w-6 rounded-full flex items-center justify-center"
              style={{
                background: on ? 'rgba(22,163,74,0.15)' : 'rgba(0,0,0,0.05)',
                color: on ? 'rgba(21,128,61,0.9)' : 'rgba(0,0,0,0.3)',
                border: `1px solid ${on ? 'rgba(22,163,74,0.35)' : 'rgba(0,0,0,0.08)'}`,
              }}
            >
              <span className="text-[0.52rem] tracking-[0.08em]">{idx + 1}</span>
            </motion.div>
            {idx < FLOW.length - 1 && (
              <div className="h-px flex-1" style={{ background: on ? 'rgba(22,163,74,0.28)' : 'rgba(0,0,0,0.08)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LaundryO2ODemo({ onBack }: { onBack: () => void }) {
  const [selectedShopId, setSelectedShopId] = useState<string>(SHOPS[0].id);
  const [selectedClothes, setSelectedClothes] = useState<string[]>(['shirt', 'coat']);
  const [flowStep, setFlowStep] = useState<FlowStep>('idle');
  const [flowHint, setFlowHint] = useState<string>('세탁할 옷과 세탁소를 고른 뒤 주문을 시작하세요.');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedShop = useMemo(
    () => SHOPS.find((shop) => shop.id === selectedShopId) ?? SHOPS[0],
    [selectedShopId],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const toggleCloth = (id: string) => {
    if (flowStep !== 'idle') return;
    setSelectedClothes((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  };

  const resetFlow = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setFlowStep('idle');
    setFlowHint('세탁할 옷과 세탁소를 고른 뒤 주문을 시작하세요.');
  };

  const runFlow = (index: number) => {
    const curr = FLOW[index];
    setFlowStep(curr.step);
    setFlowHint(curr.hint);
    if (!curr.wait) return;

    timerRef.current = setTimeout(() => {
      const next = index + 1;
      if (next < FLOW.length) runFlow(next);
    }, curr.wait);
  };

  const startOrder = () => {
    if (!selectedClothes.length) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    runFlow(0);
  };

  const selectedCount = selectedClothes.length;
  const flowLabel =
    flowStep === 'idle'
      ? '주문 전'
      : FLOW.find((item) => item.step === flowStep)?.label ?? '진행중';

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="flex flex-col items-center gap-1 pt-16 pb-2 shrink-0"
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">온웨어</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.3em] text-black/55">O2O 세탁 서비스</h2>
      </motion.div>

      <div className="flex-1 flex items-center justify-center px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-[minmax(0,420px)_minmax(0,360px)] gap-4 md:gap-6 w-full max-w-4xl"
        >
          <section
            className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-4 md:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
            style={{ minHeight: 360 }}
          >
            <p className="text-[0.52rem] tracking-[0.24em] text-black/30 uppercase mb-3">주문 설정</p>

            <div className="mb-4">
              <p className="text-[0.56rem] tracking-[0.16em] text-black/45 uppercase mb-2">세탁할 옷</p>
              <div className="grid grid-cols-3 gap-2">
                {CLOTHES.map((cloth) => {
                  const on = selectedClothes.includes(cloth.id);
                  return (
                    <button
                      key={cloth.id}
                      onClick={() => toggleCloth(cloth.id)}
                      disabled={flowStep !== 'idle'}
                      className="rounded-xl px-2 py-2 transition-all duration-200"
                      style={{
                        border: `1px solid ${on ? 'rgba(14,116,144,0.45)' : 'rgba(0,0,0,0.09)'}`,
                        background: on ? 'rgba(8,145,178,0.1)' : 'rgba(0,0,0,0.015)',
                        opacity: flowStep === 'idle' ? 1 : 0.8,
                        cursor: flowStep === 'idle' ? 'pointer' : 'default',
                      }}
                    >
                      <div className="text-sm mb-1">{cloth.icon}</div>
                      <div className="text-[0.56rem] tracking-[0.08em] text-black/55">{cloth.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-[0.56rem] tracking-[0.16em] text-black/45 uppercase mb-2">세탁소 선택</p>
              <div className="space-y-2">
                {SHOPS.map((shop) => {
                  const on = shop.id === selectedShopId;
                  return (
                    <button
                      key={shop.id}
                      onClick={() => flowStep === 'idle' && setSelectedShopId(shop.id)}
                      disabled={flowStep !== 'idle'}
                      className="w-full text-left rounded-xl px-3 py-2 transition-colors duration-200"
                      style={{
                        border: `1px solid ${on ? 'rgba(22,163,74,0.35)' : 'rgba(0,0,0,0.09)'}`,
                        background: on ? 'rgba(22,163,74,0.08)' : 'rgba(0,0,0,0.015)',
                        opacity: flowStep === 'idle' ? 1 : 0.78,
                        cursor: flowStep === 'idle' ? 'pointer' : 'default',
                      }}
                    >
                      <p className="text-[0.64rem] tracking-[0.04em] text-black/70">{shop.name}</p>
                      <p className="text-[0.5rem] tracking-[0.08em] text-black/35 uppercase">{shop.eta}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={startOrder}
                disabled={flowStep !== 'idle' || !selectedClothes.length}
                className="rounded-xl px-4 py-2 text-[0.6rem] tracking-[0.14em] uppercase transition-colors"
                style={{
                  background:
                    flowStep === 'idle' && selectedClothes.length
                      ? 'linear-gradient(135deg, rgba(14,165,233,0.9), rgba(22,163,74,0.9))'
                      : 'rgba(0,0,0,0.1)',
                  color: flowStep === 'idle' && selectedClothes.length ? '#fff' : 'rgba(0,0,0,0.32)',
                  cursor: flowStep === 'idle' && selectedClothes.length ? 'pointer' : 'default',
                }}
              >
                주문하기
              </button>
              <button
                onClick={resetFlow}
                className="rounded-xl px-3 py-2 text-[0.56rem] tracking-widest uppercase"
                style={{
                  border: '1px solid rgba(0,0,0,0.12)',
                  color: 'rgba(0,0,0,0.45)',
                  background: 'rgba(255,255,255,0.65)',
                }}
              >
                초기화
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 bg-white/80 backdrop-blur-sm p-4 md:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
            <p className="text-[0.52rem] tracking-[0.24em] text-black/30 uppercase mb-3">주문 상태</p>

            <div className="rounded-2xl border border-black/8 bg-white p-3 mb-3">
              <StepRail current={flowStep === 'idle' ? 'ordered' : flowStep} />
            </div>

            <div className="rounded-2xl border border-black/8 bg-[#fbfbfb] p-3 mb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[0.5rem] tracking-[0.16em] text-black/35 uppercase">현재 단계</p>
                <p className="text-[0.52rem] tracking-[0.12em] text-emerald-700/75 uppercase">{flowLabel}</p>
              </div>
              <p className="text-[0.62rem] tracking-[0.04em] text-black/60">{flowHint}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-xl border border-black/8 bg-white p-3">
                <p className="text-[0.48rem] tracking-[0.14em] text-black/32 uppercase mb-1">선택 세탁소</p>
                <p className="text-[0.62rem] tracking-[0.03em] text-black/70">{selectedShop.name}</p>
              </div>
              <div className="rounded-xl border border-black/8 bg-white p-3">
                <p className="text-[0.48rem] tracking-[0.14em] text-black/32 uppercase mb-1">의류 수량</p>
                <p className="text-[0.62rem] tracking-[0.03em] text-black/70">총 {selectedCount}벌</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={flowStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                className="rounded-xl border border-black/8 bg-white px-3 py-2"
              >
                <p className="text-[0.5rem] tracking-[0.14em] text-black/35 uppercase mb-1">라이브 로그</p>
                <p className="text-[0.58rem] tracking-[0.03em] text-black/62">
                  {flowStep === 'idle' && '주문을 시작하면 수거 -> 세탁 -> 배송 플로우가 자동 진행됩니다.'}
                  {flowStep === 'ordered' && '주문이 세탁소로 전달되었습니다. 기사 배차를 시작합니다.'}
                  {flowStep === 'pickup' && '기사님이 방문해 의류를 수거했습니다.'}
                  {flowStep === 'washing' && '세탁소에서 분류, 세탁, 건조, 검수 작업을 진행합니다.'}
                  {flowStep === 'delivery' && '세탁 완료 후 고객 주소로 재배송 중입니다.'}
                  {flowStep === 'done' && '문 앞 배송까지 완료되었습니다. 주문을 다시 생성할 수 있습니다.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
