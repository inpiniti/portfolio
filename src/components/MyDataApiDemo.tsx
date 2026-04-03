'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Flow steps ─────────────────────────────────────────
  고객 → 마이데이터 → 금융회사 → 마이데이터 (응답)
                  → 중계기관  → 중소형금융 → 중계기관 (응답)
                              ← 마이데이터 (응답)
  ──────────────────────────────────────────────────────── */

type NodeId = 'customer' | 'mydata' | 'finance' | 'broker' | 'smallfinance';
type StepId = 0|1|2|3|4|5|6|7|8;

interface Step {
  id: StepId;
  from: NodeId;
  to: NodeId;
  label: string;
  color: string;
}

const STEPS: Step[] = [
  { id:0, from:'customer',     to:'mydata',       label:'1. 조회요청',      color:'#4299e1' },
  { id:1, from:'mydata',       to:'finance',      label:'2. 조회요청',      color:'#4299e1' },
  { id:2, from:'mydata',       to:'broker',       label:'2. 조회요청',      color:'#4299e1' },
  { id:3, from:'broker',       to:'smallfinance', label:'2.1 조회요청',     color:'#9f7aea' },
  { id:4, from:'smallfinance', to:'broker',       label:'2.2 조회응답',     color:'#9f7aea' },
  { id:5, from:'finance',      to:'mydata',       label:'3. 조회응답',      color:'#48bb78' },
  { id:6, from:'broker',       to:'mydata',       label:'3. 조회응답',      color:'#48bb78' },
  { id:7, from:'mydata',       to:'customer',     label:'4. 통합조회 결과', color:'#48bb78' },
];

// Visual layout positions (relative to SVG 560x260)
const NODE_POS: Record<NodeId, {x:number, y:number}> = {
  customer:     { x: 55,  y: 130 },
  mydata:       { x: 185, y: 130 },
  finance:      { x: 345, y: 60  },
  broker:       { x: 345, y: 190 },
  smallfinance: { x: 490, y: 190 },
};

const NODE_LABELS: Record<NodeId, {main:string, sub?:string}> = {
  customer:     { main: '① 고객' },
  mydata:       { main: '② 마이데이터' },
  finance:      { main: '③ 금융회사', sub:'(신용정보제공·이용자)' },
  broker:       { main: '④ 중계기관' },
  smallfinance: { main: '중소형\n금융회사' },
};

const NODE_ICON: Record<NodeId, string> = {
  customer:     '👤',
  mydata:       '💼',
  finance:      '🏛️',
  broker:       '🏢',
  smallfinance: '🏦',
};

/* Midpoint of a connection for label placement */
function midpoint(from: NodeId, to: NodeId) {
  const a = NODE_POS[from], b = NODE_POS[to];
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function arrowD(from: NodeId, to: NodeId, offset = 0) {
  const a = NODE_POS[from], b = NODE_POS[to];
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.sqrt(dx*dx+dy*dy);
  const ux = dx/len, uy = dy/len;
  const r = 22; // node radius clearance
  const ox = uy * offset, oy = -ux * offset;
  return {
    x1: a.x + ux*r + ox, y1: a.y + uy*r + oy,
    x2: b.x - ux*r + ox, y2: b.y - uy*r + oy,
  };
}

/* ─── Animated packet along a line ── */
function Packet({ from, to, active, color, offset=0 }: { from:NodeId; to:NodeId; active:boolean; color:string; offset?:number }) {
  const a = arrowD(from, to, offset);
  return (
    <AnimatePresence>
      {active && (
        <motion.circle
          key="pk"
          r={4}
          fill={color}
          filter="url(#glow)"
          initial={{ cx: a.x1, cy: a.y1, opacity:0 }}
          animate={{ cx: a.x2, cy: a.y2, opacity:[0,1,1,0] }}
          exit={{ opacity:0 }}
          transition={{ duration:0.55, ease:'easeInOut' }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─── Node component ── */
function NodeCircle({ id, blinking }: { id: NodeId; blinking: boolean }) {
  const pos = NODE_POS[id];
  const label = NODE_LABELS[id];
  return (
    <g>
      <motion.circle
        cx={pos.x} cy={pos.y} r={20}
        fill="#fff"
        stroke={blinking ? '#4299e1' : '#d0dce8'}
        strokeWidth={blinking ? 2 : 1.5}
        animate={blinking ? { boxShadow: undefined, strokeWidth:[1.5,2.5,1.5] } : {}}
        transition={{ duration:0.4, repeat: blinking ? Infinity : 0 }}
      />
      {blinking && (
        <motion.circle
          cx={pos.x} cy={pos.y} r={20}
          fill="none"
          stroke="#4299e1"
          strokeWidth={3}
          animate={{ r:[20,27,20], opacity:[0.5,0,0.5], strokeWidth:[2,0,2] }}
          transition={{ duration:0.8, repeat:Infinity }}
        />
      )}
      <text x={pos.x} y={pos.y+4} textAnchor="middle" fontSize={11} style={{pointerEvents:'none'}}>{NODE_ICON[id]}</text>
      <text x={pos.x} y={pos.y+28} textAnchor="middle" fontSize={7} fill="rgba(0,0,0,0.55)" fontWeight="600" style={{pointerEvents:'none'}}>
        {label.main}
      </text>
      {label.sub && (
        <text x={pos.x} y={pos.y+37} textAnchor="middle" fontSize={5.5} fill="rgba(0,0,0,0.35)" style={{pointerEvents:'none'}}>
          {label.sub}
        </text>
      )}
    </g>
  );
}

/* ─── Main ── */
export function MyDataApiDemo({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'idle'|'running'|'done'>('idle');
  const [activeStep, setActiveStep] = useState<StepId|null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<StepId>>(new Set());
  const [blinking, setBlinking] = useState<Set<NodeId>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  // Step sequence with timing
  const SEQUENCE: { step: StepId; blink: NodeId[]; ms: number }[] = [
    { step:0, blink:['customer','mydata'],        ms: 800 },
    { step:1, blink:['mydata','finance'],          ms: 700 },
    { step:2, blink:['mydata','broker'],           ms: 700 },
    { step:3, blink:['broker','smallfinance'],     ms: 700 },
    { step:4, blink:['smallfinance','broker'],     ms: 700 },
    { step:5, blink:['finance','mydata'],          ms: 700 },
    { step:6, blink:['broker','mydata'],           ms: 700 },
    { step:7, blink:['mydata','customer'],         ms: 800 },
  ];

  const runSequence = () => {
    setPhase('running');
    setCompletedSteps(new Set());
    setActiveStep(null);
    setBlinking(new Set());

    let delay = 0;
    SEQUENCE.forEach(({ step, blink, ms }, i) => {
      // blink nodes
      timerRef.current = setTimeout(() => {
        setBlinking(new Set(blink as NodeId[]));
        setActiveStep(step as StepId);
      }, delay);
      delay += ms;
      // mark complete, clear blink
      timerRef.current = setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, step as StepId]));
        setActiveStep(null);
        setBlinking(new Set());
        if (i === SEQUENCE.length - 1) setPhase('done');
      }, delay);
      delay += 200;
    });
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const reset = () => {
    setPhase('idle'); setActiveStep(null);
    setCompletedSteps(new Set()); setBlinking(new Set());
  };

  // Which connections to show static lines for
  const CONNECTIONS: { from:NodeId; to:NodeId; offset?:number }[] = [
    { from:'customer',     to:'mydata' },
    { from:'mydata',       to:'finance' },
    { from:'mydata',       to:'broker' },
    { from:'broker',       to:'smallfinance' },
  ];

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <motion.button
        initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }}
        transition={{ delay:0.08, duration:0.5, ease:[0.34,1.2,0.64,1] }}
        onClick={onBack}
        className="absolute top-8 left-8 z-20 flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none"
      >
        <span className="text-base leading-none text-black/20 group-hover:text-black transition-colors duration-200">‹</span>
        <span className="text-[0.58rem] tracking-[0.28em] text-black/25 group-hover:text-black transition-colors duration-200 uppercase">뒤로가기</span>
      </motion.button>

      <motion.div
        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
        transition={{ delay:0.12, duration:0.5 }}
        className="flex flex-col items-center gap-1 pt-16 pb-3 shrink-0"
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">사이버이메지네이션</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">대신증권 마이데이터 API</h2>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center" style={{ paddingBottom: 24 }}>
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.2, duration:0.5 }}
          style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}
        >
          {/* SVG diagram */}
          <div style={{ background:'#f0f6ff', borderRadius:14, padding:'16px 20px', border:'1px solid rgba(66,153,225,0.15)' }}>
            <svg width={560} height={270} style={{ overflow:'visible' }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="rgba(0,0,0,0.18)" />
                </marker>
                <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#4299e1" />
                </marker>
                <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#48bb78" />
                </marker>
              </defs>

              {/* Static connection lines */}
              {CONNECTIONS.map(({ from, to }, i) => {
                const a = arrowD(from, to);
                return (
                  <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                    stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeDasharray="4 3"
                    markerEnd="url(#arrow)"
                  />
                );
              })}
              {/* Return lines (offset slightly) */}
              {[
                { from:'finance' as NodeId, to:'mydata' as NodeId },
                { from:'broker'  as NodeId, to:'mydata' as NodeId },
                { from:'smallfinance' as NodeId, to:'broker' as NodeId },
                { from:'mydata' as NodeId, to:'customer' as NodeId },
              ].map(({ from, to }, i) => {
                const a = arrowD(from, to, i < 2 ? 5 : 0);
                return (
                  <line key={`r${i}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                    stroke="rgba(0,0,0,0.08)" strokeWidth={1} strokeDasharray="4 3"
                    markerEnd="url(#arrow)"
                  />
                );
              })}

              {/* Completed step labels */}
              {STEPS.map(step => {
                if (!completedSteps.has(step.id)) return null;
                const mid = midpoint(step.from, step.to);
                return (
                  <motion.text key={step.id}
                    x={mid.x} y={mid.y - 4}
                    textAnchor="middle" fontSize={6.5}
                    fill={step.color} fontWeight="600"
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.3 }}
                  >{step.label}</motion.text>
                );
              })}

              {/* Active packets */}
              {activeStep !== null && (() => {
                const step = STEPS[activeStep];
                return <Packet from={step.from} to={step.to} active color={step.color} />;
              })()}

              {/* Nodes */}
              {(Object.keys(NODE_POS) as NodeId[]).map(id => (
                <NodeCircle key={id} id={id} blinking={blinking.has(id)} />
              ))}
            </svg>
          </div>

          {/* Controls */}
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            {phase === 'idle' && (
              <motion.button
                whileTap={{ scale:0.95 }}
                onClick={runSequence}
                style={{
                  padding:'6px 20px', fontSize:9, letterSpacing:'0.2em',
                  background:'rgba(66,153,225,0.1)', border:'1px solid rgba(66,153,225,0.35)',
                  borderRadius:8, color:'rgba(30,100,200,0.8)', cursor:'pointer', fontFamily:'inherit',
                }}
              >
                데이터 요청 시작
              </motion.button>
            )}
            {phase === 'running' && (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <motion.div animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:1, repeat:Infinity }}
                  style={{ width:6, height:6, borderRadius:'50%', background:'#4299e1' }} />
                <span style={{ fontSize:8, color:'rgba(0,0,0,0.4)', letterSpacing:'0.15em' }}>처리 중…</span>
              </div>
            )}
            {phase === 'done' && (
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:8, color:'rgba(40,160,80,0.85)', letterSpacing:'0.15em' }}>✓ 통합 조회 완료</span>
                <button onClick={reset} style={{ padding:'4px 12px', fontSize:7.5, letterSpacing:'0.1em', background:'rgba(0,0,0,0.04)', border:'1px solid rgba(0,0,0,0.1)', borderRadius:6, color:'rgba(0,0,0,0.4)', cursor:'pointer', fontFamily:'inherit' }}>
                  다시
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
