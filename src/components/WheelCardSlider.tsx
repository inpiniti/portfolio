"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Renderer } from "@json-render/react";
import { registry } from "@/lib/render-setup";
import { toSpec } from "@/lib/nested-to-spec";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NestedSpec = Record<string, any>;

interface Props {
  heading: string;
  slides: NestedSpec[];
}

const THROTTLE_MS = 500;
const ease = [0.215, 0.61, 0.355, 1] as const;

export function WheelCardSlider({ heading, slides }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1=next(right→left), -1=prev(left→right)
  const containerRef = useRef<HTMLDivElement>(null);
  // refs so the wheel handler always reads fresh state without re-attaching
  const stateRef = useRef({ index: 0, length: slides.length });
  const lastTrigger = useRef(0);

  useEffect(() => {
    stateRef.current = { index, length: slides.length };
  }, [index, slides.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      const { index: cur, length } = stateRef.current;
      const dir = e.deltaY > 0 ? 1 : -1; // 1=down/next, -1=up/prev

      const canGo = (dir === 1 && cur < length - 1) || (dir === -1 && cur > 0);
      if (!canGo) {
        // at boundary → let outer scroll-snap handle section navigation naturally
        return;
      }

      // mid-flight throttle: block outer scroll but don't advance twice
      e.preventDefault();
      if (now - lastTrigger.current < THROTTLE_MS) return;
      lastTrigger.current = now;

      setDirection(dir);
      setIndex(cur + dir);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []); // empty deps — state accessed via ref

  const navigate = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  const variants = {
    enter: (d: number) => ({ x: d >= 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d >= 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">{heading}</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => index > 0 && navigate(index - 1)}
            disabled={index === 0}
            aria-label="이전"
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 cursor-pointer text-xl leading-none px-1"
          >‹</button>
          <span className="text-xs text-muted-foreground tabular-nums">{index + 1} / {slides.length}</span>
          <button
            onClick={() => index < slides.length - 1 && navigate(index + 1)}
            disabled={index === slides.length - 1}
            aria-label="다음"
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 cursor-pointer text-xl leading-none px-1"
          >›</button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-5" role="tablist">
        {slides.map((_, i) => (
          <button key={i} role="tab" aria-selected={i === index} aria-label={`${i + 1}번`} onClick={() => navigate(i)} className="cursor-pointer">
            <motion.span
              className="block rounded-full bg-foreground"
              animate={{ width: i === index ? 16 : 6, height: 6, opacity: i === index ? 1 : 0.25 }}
              transition={{ duration: 0.2 }}
            />
          </button>
        ))}
      </div>

      {/* Card area */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease }}
          >
            <Renderer registry={registry} spec={toSpec(slides[index] as Parameters<typeof toSpec>[0])} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hint */}
      <p className="text-[11px] text-muted-foreground mt-4 text-center select-none">
        스크롤 ↕ 로 카드 넘기기 · 마지막 카드에서 스크롤하면 다음 섹션
      </p>
    </div>
  );
}
