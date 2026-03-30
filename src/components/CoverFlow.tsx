"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";

export interface CoverFlowItem {
  id: string;
  /** 앨범 커버처럼 표시될 상단 색상/이모지 */
  color: string;
  emoji: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  body?: string;
  extra?: React.ReactNode;
}

interface Props {
  items: CoverFlowItem[];
  heading?: string;
}

const CARD_W = 260;
const CARD_GAP = 32;
const SIDE_ANGLE = 55;    // 옆 카드 Y축 회전각
const SIDE_SCALE = 0.78;  // 옆 카드 스케일
const SIDE_OFFSET = 220;  // 옆 카드 X 오프셋

export function CoverFlow({ items, heading }: Props) {
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);

  // active 값을 spring으로 부드럽게 보간
  const springActive = useSpring(0, { stiffness: 280, damping: 32 });

  useEffect(() => {
    springActive.set(active);
  }, [active, springActive]);

  const prev = useCallback(() => setActive((a) => Math.max(0, a - 1)), []);
  const next = useCallback(() => setActive((a) => Math.min(items.length - 1, a + 1)), [items.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    isDragging.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    if (Math.abs(e.clientX - startX.current) > 5) isDragging.current = true;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (isDragging.current) {
      if (dx < -40) next();
      else if (dx > 40) prev();
    }
    startX.current = null;
    isDragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  return (
    <div className="w-full select-none" aria-roledescription="carousel" aria-label={heading}>
      {heading && (
        <h2 className="text-xl font-semibold mb-6 px-1">{heading}</h2>
      )}

      {/* Stage */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 320, perspective: "900px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="listbox"
        aria-activedescendant={`cflow-${items[active]?.id}`}
      >
        {items.map((item, i) => {
          const offset = i - active;
          return (
            <CoverFlowCard
              key={item.id}
              item={item}
              index={i}
              offset={offset}
              isActive={i === active}
              springActive={springActive}
              totalItems={items.length}
              onClick={() => {
                if (!isDragging.current) setActive(i);
              }}
            />
          );
        })}
      </div>

      {/* Reflection strip */}
      <div
        className="relative flex items-center justify-center pointer-events-none"
        style={{ height: 60, perspective: "900px" }}
        aria-hidden="true"
      >
        {items.map((item, i) => (
          <CoverFlowReflection
            key={item.id}
            item={item}
            index={i}
            springActive={springActive}
            totalItems={items.length}
          />
        ))}
        {/* fade-out gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* Label + dots */}
      <div className="mt-3 flex flex-col items-center gap-2">
        <motion.p
          key={active}
          className="text-sm font-medium text-foreground text-center"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {items[active]?.title}
        </motion.p>
        {items[active]?.subtitle && (
          <motion.p
            key={`sub-${active}`}
            className="text-xs text-muted-foreground text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            {items[active].subtitle}
          </motion.p>
        )}

        {/* tag badges */}
        {items[active]?.tags && (
          <motion.div
            key={`tags-${active}`}
            className="flex flex-wrap justify-center gap-1.5 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {items[active].tags!.map((t) => (
              <span key={t} className="text-[10px] bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">{t}</span>
            ))}
          </motion.div>
        )}

        {/* body text */}
        {items[active]?.body && (
          <motion.p
            key={`body-${active}`}
            className="text-xs text-muted-foreground text-center max-w-md leading-relaxed mt-1 px-2"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
          >
            {items[active].body}
          </motion.p>
        )}

        {/* extra slot */}
        {items[active]?.extra && (
          <motion.div
            key={`extra-${active}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            {items[active].extra}
          </motion.div>
        )}

        {/* dots */}
        <div className="flex gap-1.5 mt-2" role="tablist">
          {items.map((item, i) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={i === active}
              aria-label={item.title}
              onClick={() => setActive(i)}
              className="cursor-pointer"
            >
              <motion.span
                className="block rounded-full bg-foreground"
                animate={{ width: i === active ? 16 : 6, height: 6, opacity: i === active ? 1 : 0.25 }}
                transition={{ duration: 0.25 }}
              />
            </button>
          ))}
        </div>

        {/* arrow hint */}
        <div className="flex gap-6 mt-1">
          <button
            onClick={prev}
            disabled={active === 0}
            aria-label="이전"
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 cursor-pointer text-lg px-2"
          >‹</button>
          <button
            onClick={next}
            disabled={active === items.length - 1}
            aria-label="다음"
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 cursor-pointer text-lg px-2"
          >›</button>
        </div>
      </div>
    </div>
  );
}

// ─── Individual card ─────────────────────────────────────
function CoverFlowCard({
  item,
  index,
  isActive,
  springActive,
  totalItems,
  onClick,
}: {
  item: CoverFlowItem;
  index: number;
  offset: number;
  isActive: boolean;
  springActive: ReturnType<typeof useSpring>;
  totalItems: number;
  onClick: () => void;
}) {
  // 실시간 offset (float)
  const floatOffset = useTransform(springActive, (a) => index - a);

  const rotateY = useTransform(floatOffset, (o) => {
    const clamped = Math.max(-2.5, Math.min(2.5, o));
    if (Math.abs(clamped) < 0.01) return 0;
    return clamped > 0 ? SIDE_ANGLE : -SIDE_ANGLE;
  });

  const translateX = useTransform(floatOffset, (o) => {
    const clamped = Math.max(-(totalItems - 1), Math.min(totalItems - 1, o));
    const dir = clamped > 0 ? 1 : clamped < 0 ? -1 : 0;
    const absO = Math.abs(clamped);
    if (absO < 0.01) return 0;
    // 첫 번째 옆 카드는 SIDE_OFFSET, 그 이후는 추가 간격 좁게
    const firstOffset = dir * SIDE_OFFSET;
    const extra = dir * (absO - 1) * (CARD_W * 0.35 + CARD_GAP * 0.5);
    return absO < 1 ? dir * SIDE_OFFSET * absO : firstOffset + extra;
  });

  const scale = useTransform(floatOffset, (o) => {
    const abs = Math.min(Math.abs(o), 1);
    return 1 - abs * (1 - SIDE_SCALE);
  });

  const opacity = useTransform(floatOffset, (o) => {
    const abs = Math.abs(o);
    if (abs > 2.8) return 0;
    if (abs > 1.5) return 1 - (abs - 1.5) / 1.3;
    return 1;
  });

  const zIndex = useTransform(floatOffset, (o) => Math.round(100 - Math.abs(o) * 10));

  const brightness = useTransform(floatOffset, (o) => {
    const abs = Math.min(Math.abs(o), 1);
    return 1 - abs * 0.38;
  });

  return (
    <motion.div
      id={`cflow-${item.id}`}
      role="option"
      aria-selected={isActive}
      aria-label={item.title}
      onClick={onClick}
      className="absolute cursor-pointer"
      style={{
        width: CARD_W,
        rotateY,
        x: translateX,
        scale,
        opacity,
        zIndex,
        transformStyle: "preserve-3d",
        originX: "center",
      }}
    >
      <motion.div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: CARD_W,
          height: 230,
          filter: useTransform(brightness, (b) => `brightness(${b})`),
        }}
      >
        {/* Album cover */}
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-2 relative"
          style={{ background: item.color }}
        >
          <span className="text-5xl" aria-hidden="true">{item.emoji}</span>
          {/* gloss overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(170deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 45%, transparent 50%)",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Reflection ──────────────────────────────────────────
function CoverFlowReflection({
  item,
  index,
  springActive,
  totalItems,
}: {
  item: CoverFlowItem;
  index: number;
  springActive: ReturnType<typeof useSpring>;
  totalItems: number;
}) {
  const floatOffset = useTransform(springActive, (a) => index - a);

  const rotateY = useTransform(floatOffset, (o) => {
    const clamped = Math.max(-2.5, Math.min(2.5, o));
    if (Math.abs(clamped) < 0.01) return 0;
    return clamped > 0 ? SIDE_ANGLE : -SIDE_ANGLE;
  });

  const translateX = useTransform(floatOffset, (o) => {
    const clamped = Math.max(-(totalItems - 1), Math.min(totalItems - 1, o));
    const dir = clamped > 0 ? 1 : clamped < 0 ? -1 : 0;
    const absO = Math.abs(clamped);
    if (absO < 0.01) return 0;
    const firstOffset = dir * SIDE_OFFSET;
    const extra = dir * (absO - 1) * (CARD_W * 0.35 + CARD_GAP * 0.5);
    return absO < 1 ? dir * SIDE_OFFSET * absO : firstOffset + extra;
  });

  const scale = useTransform(floatOffset, (o) => {
    const abs = Math.min(Math.abs(o), 1);
    return 1 - abs * (1 - SIDE_SCALE);
  });

  const opacity = useTransform(floatOffset, (o) => {
    const abs = Math.abs(o);
    if (abs > 2.8) return 0;
    if (abs > 1.5) return (1 - (abs - 1.5) / 1.3) * 0.35;
    return 0.35;
  });

  const zIndex = useTransform(floatOffset, (o) => Math.round(100 - Math.abs(o) * 10));

  return (
    <motion.div
      aria-hidden="true"
      className="absolute"
      style={{
        width: CARD_W,
        height: 60,
        rotateY,
        x: translateX,
        scale,
        opacity,
        zIndex,
        transformStyle: "preserve-3d",
        scaleY: -1,
        transformOrigin: "top center",
        overflow: "hidden",
      }}
    >
      <div
        className="rounded-b-2xl"
        style={{
          width: CARD_W,
          height: 90,
          background: item.color,
          marginTop: -30,
        }}
      />
    </motion.div>
  );
}
