'use client';

import { useRef, useMemo, useCallback, useEffect } from 'react';

const FACE_COUNT = 8;
const DEG = 360 / FACE_COUNT; // 45° per face
const FACE_W = 200;
const FACE_H = 132;
const DRUM_R = 260; // px — drum radius

type Project = { id: string; label: string; dates: string };

type State = {
  rotDeg: number;
  targetDeg: number;
  dragging: boolean;
  dragStartX: number;
  dragStartRot: number;
  wasDrag: boolean;
  rafId: number;
  clickedFaceIdx: number; // face index physically clicked, -1 if none
};

export function DrumCarousel({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (id: string) => void;
}) {
  const faces = useMemo<(Project | null)[]>(() => {
    const arr: (Project | null)[] = [...projects];
    while (arr.length < FACE_COUNT) arr.push(null);
    return arr;
  }, [projects]);

  const drumRef = useRef<HTMLDivElement>(null);
  const faceRefs = useRef<(HTMLDivElement | null)[]>(Array(FACE_COUNT).fill(null));
  const s = useRef<State>({
    rotDeg: 0,
    targetDeg: 0,
    dragging: false,
    dragStartX: 0,
    dragStartRot: 0,
    wasDrag: false,
    rafId: 0,
    clickedFaceIdx: -1,
  });

  const applyRotation = useCallback(() => {
    if (drumRef.current)
      drumRef.current.style.transform = `rotateY(${s.current.rotDeg}deg)`;
  }, []);

  const tick = useCallback(() => {
    const st = s.current;
    if (st.dragging) return;
    const diff = st.targetDeg - st.rotDeg;
    if (Math.abs(diff) < 0.04) {
      st.rotDeg = st.targetDeg;
      applyRotation();
      return;
    }
    st.rotDeg += diff * 0.22;
    applyRotation();
    st.rafId = requestAnimationFrame(tick);
  }, [applyRotation]);

  const startTick = useCallback(() => {
    cancelAnimationFrame(s.current.rafId);
    s.current.rafId = requestAnimationFrame(tick);
  }, [tick]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const st = s.current;
    cancelAnimationFrame(st.rafId);
    st.dragging = true;
    st.dragStartX = e.clientX;
    st.dragStartRot = st.rotDeg;
    st.wasDrag = false;
    // Detect which face was physically clicked
    st.clickedFaceIdx = -1;
    const target = e.target as Node;
    faceRefs.current.forEach((el, i) => {
      if (el && el.contains(target)) st.clickedFaceIdx = i;
    });
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const st = s.current;
    if (!st.dragging) return;
    const dx = e.clientX - st.dragStartX;
    if (Math.abs(dx) > 5) st.wasDrag = true;
    st.rotDeg = st.dragStartRot + (dx / 380) * 360;
    applyRotation();
  }, [applyRotation]);

  const onPointerUp = useCallback(() => {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;

    const snapIndex = Math.round(st.rotDeg / DEG);
    st.targetDeg = snapIndex * DEG;

    if (!st.wasDrag) {
      // Use the face that was physically clicked, not the computed front face
      const idx = st.clickedFaceIdx >= 0
        ? st.clickedFaceIdx
        : ((-snapIndex) % FACE_COUNT + FACE_COUNT) % FACE_COUNT;
      const proj = faces[idx];
      if (proj) onSelect(proj.id);
    }

    startTick();
  }, [faces, onSelect, startTick]);

  // Reset rotation when company changes
  useEffect(() => {
    const st = s.current;
    cancelAnimationFrame(st.rafId);
    st.rotDeg = 0;
    st.targetDeg = 0;
    applyRotation();
  }, [projects, applyRotation]);

  useEffect(() => () => cancelAnimationFrame(s.current.rafId), []);

  return (
    <div
      className="select-none cursor-grab active:cursor-grabbing"
      style={{
        width: '100%',
        height: 260,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '900px',
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { s.current.dragging = false; }}
    >
      <div
        ref={drumRef}
        style={{
          position: 'relative',
          width: FACE_W,
          height: FACE_H,
          transformStyle: 'preserve-3d',
          transform: 'rotateY(0deg)',
        }}
      >
        {faces.map((proj, i) => (
          <div
            key={i}
            ref={(el) => { faceRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              inset: 0,
              transform: `rotateY(${i * DEG}deg) translateZ(${DRUM_R}px)`,
              backfaceVisibility: 'hidden',
            }}
          >
            {proj ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'white',
                  borderRadius: 14,
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 18px rgba(0,0,0,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '0 20px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'rgba(0,0,0,0.22)';
                  el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.13)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'rgba(0,0,0,0.08)';
                  el.style.boxShadow = '0 2px 18px rgba(0,0,0,0.07)';
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    color: 'rgba(0,0,0,0.55)',
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  {proj.label}
                </span>
                <div style={{ height: 1, width: 28, background: 'rgba(0,0,0,0.08)' }} />
                <span
                  style={{
                    fontSize: 8.5,
                    letterSpacing: '0.2em',
                    color: 'rgba(0,0,0,0.28)',
                    textAlign: 'center',
                  }}
                >
                  {proj.dates}
                </span>
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0,0,0,0.015)',
                  borderRadius: 14,
                  border: '1px dashed rgba(0,0,0,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    letterSpacing: '0.3em',
                    color: 'rgba(0,0,0,0.14)',
                    fontWeight: 300,
                  }}
                >
                  nodata
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
