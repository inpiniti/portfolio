'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

type FlowStep =
  | 'idle'
  | 'ordered'
  | 'pickup-moving'
  | 'washing-ready'
  | 'washing'
  | 'delivery-ready'
  | 'delivery-moving'
  | 'done';

type Shop = {
  id: string;
  name: string;
  eta: string;
  mapX: number;
  mapY: number;
};

type Cloth = {
  id: string;
  label: string;
  icon: string;
};

const SHOPS: Shop[] = [
  { id: 's1', name: '버블클린 문현점', eta: '수거 25분', mapX: 72, mapY: 24 },
  { id: 's2', name: '화이트런드리 대연점', eta: '수거 40분', mapX: 78, mapY: 52 },
  { id: 's3', name: '프레시워시 남천점', eta: '수거 35분', mapX: 62, mapY: 72 },
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
  { step: 'ordered', label: '주문 접수', hint: '기사 배차를 기다리는 중', wait: 0 },
  { step: 'pickup-moving', label: '수거 이동', hint: '기사님이 고객 위치로 이동 중', wait: 0 },
  { step: 'washing', label: '세탁 진행', hint: '세탁기가 동작중입니다', wait: 0 },
  { step: 'delivery-moving', label: '배송 이동', hint: '세탁 완료 후 배송 기사 이동 중', wait: 0 },
  { step: 'done', label: '배송 완료', hint: '문 앞 배송이 완료되었습니다', wait: 0 },
];

const HOME_POINT = { x: 24, y: 78 };

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
  const phaseToIndex: Record<FlowStep, number> = {
    idle: 0,
    ordered: 0,
    'pickup-moving': 1,
    'washing-ready': 1,
    washing: 2,
    'delivery-ready': 2,
    'delivery-moving': 3,
    done: 4,
  };

  const activeIndex = phaseToIndex[current];

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

function WashingMachine({ active, progress }: { active: boolean; progress: number }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white px-3 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[0.5rem] tracking-[0.14em] text-black/35 uppercase">세탁기</p>
        <p className="text-[0.52rem] tracking-[0.12em] text-black/45 uppercase">{Math.round(progress)}%</p>
      </div>

      <div className="relative mx-auto w-28 h-28 rounded-2xl border border-black/10 bg-[#f8fafc] flex items-center justify-center overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-black/10" />
        <motion.div
          animate={active ? { rotate: 360 } : { rotate: 0 }}
          transition={active ? { duration: 1.1, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
          className="relative w-16 h-16 rounded-full border border-cyan-300/70 bg-linear-to-b from-cyan-100 to-cyan-50 flex items-center justify-center"
        >
          <div className="w-9 h-9 rounded-full border border-cyan-400/45 bg-cyan-200/35" />
          <AnimatePresence>
            {active && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: [0, 0.9, 0], y: -10 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-2 h-2 rounded-full bg-white/90 left-2 top-8"
                />
                <motion.div
                  initial={{ opacity: 0, y: 1 }}
                  animate={{ opacity: [0, 0.8, 0], y: -12 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.05, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-cyan-100 right-3 top-9"
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function MapPanel({
  shop,
  courier,
  isMoving,
  mode,
}: {
  shop: Shop;
  courier: { x: number; y: number };
  isMoving: boolean;
  mode: 'pickup' | 'delivery' | 'idle';
}) {
  const routeText =
    mode === 'pickup'
      ? '세탁소 -> 고객 위치'
      : mode === 'delivery'
        ? '세탁소 -> 고객 배송'
        : '대기중';

  return (
    <div className="rounded-2xl border border-black/8 bg-white px-3 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[0.5rem] tracking-[0.14em] text-black/35 uppercase">실시간 지도</p>
        <p className="text-[0.5rem] tracking-widest text-emerald-700/70 uppercase">{routeText}</p>
      </div>

      <div className="relative rounded-xl border border-black/8 overflow-hidden h-36 bg-[linear-gradient(180deg,#eff6ff_0%,#ecfeff_100%)]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path
            d={`M ${shop.mapX} ${shop.mapY} C ${(shop.mapX + HOME_POINT.x) / 2 + 8} ${(shop.mapY + HOME_POINT.y) / 2 - 12}, ${(shop.mapX + HOME_POINT.x) / 2 - 10} ${(shop.mapY + HOME_POINT.y) / 2 + 10}, ${HOME_POINT.x} ${HOME_POINT.y}`}
            stroke="rgba(14,116,144,0.45)"
            strokeWidth="1.3"
            strokeDasharray="3 2"
            fill="none"
          />
        </svg>

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md border border-emerald-600/35 bg-emerald-100/90"
          style={{ left: `${shop.mapX}%`, top: `${shop.mapY}%` }}
        >
          <span className="text-[0.46rem] tracking-[0.06em] text-emerald-800/85">세탁소</span>
        </div>

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md border border-indigo-600/35 bg-indigo-100/90"
          style={{ left: `${HOME_POINT.x}%`, top: `${HOME_POINT.y}%` }}
        >
          <span className="text-[0.46rem] tracking-[0.06em] text-indigo-800/85">고객집</span>
        </div>

        <motion.div
          animate={isMoving ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.7, repeat: isMoving ? Infinity : 0 }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${courier.x}%`, top: `${courier.y}%` }}
        >
          <div className="w-7 h-7 rounded-full border border-amber-500/50 bg-amber-100 shadow-[0_2px_6px_rgba(0,0,0,0.18)] flex items-center justify-center text-[0.7rem]">
            🚕
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function LaundryO2ODemo({ onBack }: { onBack: () => void }) {
  const [selectedShopId, setSelectedShopId] = useState<string>(SHOPS[0].id);
  const [selectedClothes, setSelectedClothes] = useState<string[]>(['shirt', 'coat']);
  const [flowStep, setFlowStep] = useState<FlowStep>('idle');
  const [flowHint, setFlowHint] = useState<string>('의류와 세탁소를 선택하고 주문을 접수하세요.');
  const [washingProgress, setWashingProgress] = useState(0);
  const [courier, setCourier] = useState({ x: SHOPS[0].mapX, y: SHOPS[0].mapY });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedShop = useMemo(
    () => SHOPS.find((shop) => shop.id === selectedShopId) ?? SHOPS[0],
    [selectedShopId],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setFlowStep('idle');
    setFlowHint('의류와 세탁소를 선택하고 주문을 접수하세요.');
    setWashingProgress(0);
    setCourier({ x: selectedShop.mapX, y: selectedShop.mapY });
  };

  const animateCourier = (
    from: { x: number; y: number },
    to: { x: number; y: number },
    onDone: () => void,
  ) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const duration = 5400;
    const stepMs = 80;
    const total = Math.floor(duration / stepMs);
    let tick = 0;

    setCourier(from);
    intervalRef.current = setInterval(() => {
      tick += 1;
      const t = Math.min(tick / total, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      setCourier({
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
      });

      if (t >= 1) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onDone();
      }
    }, stepMs);
  };

  const startPickup = () => {
    setFlowStep('pickup-moving');
    setFlowHint('수거 기사님이 고객 위치로 이동하고 있습니다.');
    animateCourier(
      { x: selectedShop.mapX, y: selectedShop.mapY },
      { x: HOME_POINT.x, y: HOME_POINT.y },
      () => {
        setFlowStep('washing-ready');
        setFlowHint('의류 수거 완료. 세탁을 시작해 주세요.');
        setCourier({ x: selectedShop.mapX, y: selectedShop.mapY });
      },
    );
  };

  const startWashing = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setFlowStep('washing');
    setFlowHint('세탁기 작동중. 오염 제거 및 건조를 진행합니다.');
    setWashingProgress(0);

    intervalRef.current = setInterval(() => {
      setWashingProgress((prev) => {
        const next = Math.min(prev + 3.5, 100);
        if (next >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setFlowStep('delivery-ready');
          setFlowHint('세탁 완료. 배송을 시작해 주세요.');
        }
        return next;
      });
    }, 120);
  };

  const startDelivery = () => {
    setFlowStep('delivery-moving');
    setFlowHint('배송 기사님이 고객 주소로 이동 중입니다.');
    animateCourier(
      { x: selectedShop.mapX, y: selectedShop.mapY },
      { x: HOME_POINT.x, y: HOME_POINT.y },
      () => {
        setFlowStep('done');
        setFlowHint('문 앞 배송이 완료되었습니다.');
      },
    );
  };

  const startOrder = () => {
    if (!selectedClothes.length) return;
    setFlowStep('ordered');
    setFlowHint('주문 접수 완료. 수거를 시작해 주세요.');
  };

  const selectedCount = selectedClothes.length;
  const flowLabel =
    flowStep === 'idle'
      ? '주문 전'
      : FLOW.find((item) => item.step === flowStep)?.label ?? '진행중';

  const canEditOrder = flowStep === 'idle';
  const pickupMoving = flowStep === 'pickup-moving';
  const deliveryMoving = flowStep === 'delivery-moving';
  const washingActive = flowStep === 'washing';

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

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="w-full flex items-center justify-center"
        >
          <div
            style={{
              background: 'linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 100%)',
              borderRadius: 30,
              padding: '10px 8px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.1)',
              width: 350,
              maxWidth: '100%',
              height: 700,
              maxHeight: 'calc(100dvh - 160px)',
            }}
          >
            <div style={{ width: 42, height: 8, background: '#000', borderRadius: 999 }} />

            <div className="mt-2 flex-1 w-full rounded-[16px] overflow-hidden bg-[#f7f8fa] border border-white/10 flex flex-col">
              <div className="bg-white/90 border-b border-black/6 px-3 py-2 flex items-center justify-between shrink-0">
                <span className="text-[0.48rem] tracking-[0.2em] text-black/35 uppercase">O2O Laundry App</span>
                <span className="text-[0.48rem] tracking-[0.12em] text-black/35">{flowLabel}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                <div className="rounded-2xl border border-black/8 bg-white px-3 py-3">
                  <p className="text-[0.5rem] tracking-[0.14em] text-black/35 uppercase mb-2">주문 설정</p>

                  <p className="text-[0.5rem] tracking-[0.12em] text-black/35 uppercase mb-1">세탁할 옷</p>
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {CLOTHES.map((cloth) => {
                      const on = selectedClothes.includes(cloth.id);
                      return (
                        <button
                          key={cloth.id}
                          onClick={() => toggleCloth(cloth.id)}
                          disabled={!canEditOrder}
                          className="rounded-xl px-1.5 py-2 transition-all duration-200"
                          style={{
                            border: `1px solid ${on ? 'rgba(14,116,144,0.45)' : 'rgba(0,0,0,0.09)'}`,
                            background: on ? 'rgba(8,145,178,0.1)' : 'rgba(0,0,0,0.015)',
                            opacity: canEditOrder ? 1 : 0.7,
                            cursor: canEditOrder ? 'pointer' : 'default',
                          }}
                        >
                          <div className="text-[0.86rem] mb-0.5">{cloth.icon}</div>
                          <div className="text-[0.5rem] tracking-[0.04em] text-black/55">{cloth.label}</div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[0.5rem] tracking-[0.12em] text-black/35 uppercase mb-1">세탁소 선택</p>
                  <div className="space-y-1.5 mb-3">
                    {SHOPS.map((shop) => {
                      const on = shop.id === selectedShopId;
                      return (
                        <button
                          key={shop.id}
                          onClick={() => {
                            if (!canEditOrder) return;
                            setSelectedShopId(shop.id);
                            setCourier({ x: shop.mapX, y: shop.mapY });
                          }}
                          disabled={!canEditOrder}
                          className="w-full text-left rounded-xl px-2.5 py-2 transition-colors duration-200"
                          style={{
                            border: `1px solid ${on ? 'rgba(22,163,74,0.35)' : 'rgba(0,0,0,0.09)'}`,
                            background: on ? 'rgba(22,163,74,0.08)' : 'rgba(0,0,0,0.015)',
                            opacity: canEditOrder ? 1 : 0.75,
                            cursor: canEditOrder ? 'pointer' : 'default',
                          }}
                        >
                          <p className="text-[0.56rem] tracking-[0.03em] text-black/70">{shop.name}</p>
                          <p className="text-[0.46rem] tracking-[0.08em] text-black/35 uppercase">{shop.eta}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={startOrder}
                      disabled={!canEditOrder || !selectedClothes.length}
                      className="rounded-xl px-3 py-2 text-[0.52rem] tracking-[0.12em] uppercase"
                      style={{
                        background:
                          canEditOrder && selectedClothes.length
                            ? 'linear-gradient(135deg, rgba(14,165,233,0.95), rgba(22,163,74,0.9))'
                            : 'rgba(0,0,0,0.1)',
                        color: canEditOrder && selectedClothes.length ? '#fff' : 'rgba(0,0,0,0.32)',
                        cursor: canEditOrder && selectedClothes.length ? 'pointer' : 'default',
                      }}
                    >
                      주문하기
                    </button>

                    <button
                      onClick={startPickup}
                      disabled={flowStep !== 'ordered'}
                      className="rounded-xl px-3 py-2 text-[0.52rem] tracking-[0.12em] uppercase"
                      style={{
                        border: '1px solid rgba(0,0,0,0.12)',
                        color: flowStep === 'ordered' ? 'rgba(8,145,178,0.95)' : 'rgba(0,0,0,0.3)',
                        background: flowStep === 'ordered' ? 'rgba(8,145,178,0.1)' : 'rgba(255,255,255,0.65)',
                        cursor: flowStep === 'ordered' ? 'pointer' : 'default',
                      }}
                    >
                      수거 시작
                    </button>

                    <button
                      onClick={startWashing}
                      disabled={flowStep !== 'washing-ready'}
                      className="rounded-xl px-3 py-2 text-[0.52rem] tracking-[0.12em] uppercase"
                      style={{
                        border: '1px solid rgba(0,0,0,0.12)',
                        color: flowStep === 'washing-ready' ? 'rgba(21,128,61,0.95)' : 'rgba(0,0,0,0.3)',
                        background: flowStep === 'washing-ready' ? 'rgba(21,128,61,0.1)' : 'rgba(255,255,255,0.65)',
                        cursor: flowStep === 'washing-ready' ? 'pointer' : 'default',
                      }}
                    >
                      세탁 시작
                    </button>

                    <button
                      onClick={startDelivery}
                      disabled={flowStep !== 'delivery-ready'}
                      className="rounded-xl px-3 py-2 text-[0.52rem] tracking-[0.12em] uppercase"
                      style={{
                        border: '1px solid rgba(0,0,0,0.12)',
                        color: flowStep === 'delivery-ready' ? 'rgba(109,40,217,0.95)' : 'rgba(0,0,0,0.3)',
                        background: flowStep === 'delivery-ready' ? 'rgba(109,40,217,0.1)' : 'rgba(255,255,255,0.65)',
                        cursor: flowStep === 'delivery-ready' ? 'pointer' : 'default',
                      }}
                    >
                      배송 시작
                    </button>

                    <button
                      onClick={resetFlow}
                      className="rounded-xl px-3 py-2 text-[0.52rem] tracking-widest uppercase"
                      style={{
                        border: '1px solid rgba(0,0,0,0.12)',
                        color: 'rgba(0,0,0,0.45)',
                        background: 'rgba(255,255,255,0.65)',
                      }}
                    >
                      초기화
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/8 bg-white px-3 py-3">
                  <StepRail current={flowStep} />
                  <div className="mt-2 rounded-xl border border-black/8 bg-[#fbfbfb] px-2.5 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[0.48rem] tracking-[0.14em] text-black/35 uppercase">현재 상태</p>
                      <p className="text-[0.5rem] tracking-[0.12em] text-emerald-700/75 uppercase">{flowLabel}</p>
                    </div>
                    <p className="text-[0.54rem] tracking-[0.03em] text-black/62">{flowHint}</p>
                  </div>
                </div>

                <MapPanel
                  shop={selectedShop}
                  courier={courier}
                  isMoving={pickupMoving || deliveryMoving}
                  mode={pickupMoving ? 'pickup' : deliveryMoving ? 'delivery' : 'idle'}
                />

                <WashingMachine active={washingActive} progress={washingProgress} />

                <div className="rounded-2xl border border-black/8 bg-white px-3 py-2.5">
                  <p className="text-[0.5rem] tracking-[0.14em] text-black/35 uppercase mb-1">주문 요약</p>
                  <p className="text-[0.56rem] tracking-[0.03em] text-black/62">선택 세탁소: {selectedShop.name}</p>
                  <p className="text-[0.56rem] tracking-[0.03em] text-black/62">의류 수량: 총 {selectedCount}벌</p>
                </div>
              </div>

              <div className="bg-white/90 border-t border-black/6 px-3 py-2 shrink-0">
                <p className="text-[0.46rem] tracking-[0.14em] text-black/35 uppercase">
                  인터랙션: 주문 {'>'} 수거 시작 {'>'} 세탁 시작 {'>'} 배송 시작
                </p>
              </div>
            </div>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.06)',
                marginTop: 8,
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
