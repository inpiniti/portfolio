'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Phase = 'idle' | 'collecting' | 'chart' | 'analyzing' | 'done';

const LOG_LINES = [
  '[10:24:01] RECV order_created     event_id=1042',
  '[10:24:01] RECV inventory_check   event_id=1043',
  '[10:24:02] RECV inventory_check   event_id=1044',
  '[10:24:03] RECV shipment_process  event_id=1045',
  '[10:24:04] RECV order_created     event_id=1046',
  '[10:24:05] RECV inventory_check   event_id=1047',
  '[10:24:06] RECV shipment_process  event_id=1048',
  '[10:24:07] RECV delivery_complete event_id=1049',
];

// SVG layout constants
const NODE_W = 64;
const NODE_H = 30;
const ROW_Y = 55;
// x-centers for top-row nodes: Start, 주문접수, 재고확인, 출고처리, 배송완료, End
const TOP_X = [20, 96, 190, 284, 370, 450];
// 재발주 node below 재고확인
const REORDER_X = 190;
const REORDER_Y = 108;

interface NodeProps {
  cx: number;
  cy: number;
  label: string;
  sub: string;
  highlight?: 'none' | 'warn' | 'bottle' | 'delay';
  done?: boolean;
}

function ProcessNode({ cx, cy, label, sub, highlight = 'none', done = false }: NodeProps) {
  const borderColor =
    highlight === 'bottle' ? '#d32f2f' :
    highlight === 'delay'  ? '#e65100' :
    highlight === 'warn'   ? '#f57c00' :
    done ? '#1565c0' : '#90a4ae';

  const bgColor =
    highlight === 'bottle' ? 'rgba(211,47,47,0.08)' :
    highlight === 'delay'  ? 'rgba(230,81,0,0.08)' :
    highlight === 'warn'   ? 'rgba(245,124,0,0.08)' :
    '#fff';

  const x = cx - NODE_W / 2;
  const y = cy - NODE_H / 2;

  return (
    <g>
      <rect
        x={x} y={y} width={NODE_W} height={NODE_H}
        rx={5} ry={5}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={highlight === 'bottle' || highlight === 'delay' ? 1.5 : 1}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={6.5} fontWeight={600} fill="#333">{label}</text>
      <text x={cx} y={cy + 7} textAnchor="middle" fontSize={5.5} fill={highlight === 'warn' || highlight === 'bottle' ? '#b71c1c' : '#888'}>{sub}</text>
      {highlight === 'bottle' && (
        <>
          <rect x={x + NODE_W - 22} y={y - 8} width={20} height={9} rx={4} fill="#d32f2f" />
          <text x={x + NODE_W - 12} y={y - 1.5} textAnchor="middle" fontSize={5} fill="#fff" fontWeight={700}>⚠ 병목</text>
        </>
      )}
      {highlight === 'delay' && (
        <>
          <rect x={x + NODE_W - 16} y={y - 8} width={14} height={9} rx={4} fill="#e65100" />
          <text x={x + NODE_W - 9} y={y - 1.5} textAnchor="middle" fontSize={5} fill="#fff" fontWeight={700}>지연</text>
        </>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;
  // shorten ends
  const sx = x1 + ux * 2;
  const sy = y1 + uy * 2;
  const ex = x2 - ux * 6;
  const ey = y2 - uy * 6;

  return (
    <line
      x1={sx} y1={sy} x2={ex} y2={ey}
      stroke="#90a4ae" strokeWidth={1}
      markerEnd="url(#arrowhead)"
    />
  );
}

function ProcessSVG({ done }: { done: boolean }) {
  // Top row edges: Start→주문접수→재고확인→출고처리→배송완료→End
  // Start circle at TOP_X[0], End circle at TOP_X[5]
  const topEdges: [number, number, number, number][] = [];
  for (let i = 0; i < TOP_X.length - 1; i++) {
    topEdges.push([TOP_X[i] + (i === 0 ? 10 : NODE_W / 2), ROW_Y, TOP_X[i + 1] - (i + 1 === TOP_X.length - 1 ? 10 : NODE_W / 2), ROW_Y]);
  }

  return (
    <svg width={490} height={145} style={{ display: 'block' }}>
      <defs>
        <marker id="arrowhead" markerWidth={6} markerHeight={6} refX={3} refY={3} orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#90a4ae" />
        </marker>
      </defs>

      {/* Top row arrows */}
      {topEdges.map(([x1, y1, x2, y2], i) => (
        <Arrow key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}

      {/* Arrow from 재고확인 down to 재발주 */}
      <Arrow
        x1={TOP_X[2]}
        y1={ROW_Y + NODE_H / 2}
        x2={REORDER_X}
        y2={REORDER_Y - NODE_H / 2}
      />

      {/* Start circle */}
      <circle cx={TOP_X[0]} cy={ROW_Y} r={10} fill={done ? '#1565c0' : '#546e7a'} />
      <text x={TOP_X[0]} y={ROW_Y + 3} textAnchor="middle" fontSize={6} fill="#fff" fontWeight={700}>S</text>

      {/* Process nodes */}
      <ProcessNode cx={TOP_X[1]} cy={ROW_Y} label="주문접수" sub="avg: 3min" done={done} />
      <ProcessNode
        cx={TOP_X[2]} cy={ROW_Y}
        label="재고확인" sub="avg: 42min"
        highlight={done ? 'bottle' : 'warn'}
      />
      <ProcessNode cx={TOP_X[3]} cy={ROW_Y} label="출고처리" sub="avg: 8min" done={done} />
      <ProcessNode cx={TOP_X[4]} cy={ROW_Y} label="배송완료" sub="avg: 12min" done={done} />

      {/* End circle */}
      <circle cx={TOP_X[5]} cy={ROW_Y} r={10} fill={done ? '#1565c0' : '#546e7a'} />
      <text x={TOP_X[5]} y={ROW_Y + 3} textAnchor="middle" fontSize={6} fill="#fff" fontWeight={700}>E</text>

      {/* Reorder node */}
      <ProcessNode
        cx={REORDER_X} cy={REORDER_Y}
        label="재발주" sub="avg: 65min"
        highlight={done ? 'delay' : 'none'}
      />
    </svg>
  );
}

export function IprDemo({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [logLines, setLogLines] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const startCollecting = () => {
    setPhase('collecting');
    setLogLines([]);

    // Reveal log lines one by one
    LOG_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setLogLines(prev => [...prev, line]);
        if (logRef.current) {
          logRef.current.scrollTop = logRef.current.scrollHeight;
        }
      }, i * 220);
      timeoutsRef.current.push(t);
    });

    // Transition to chart after all lines
    const t = setTimeout(() => {
      setPhase('chart');
    }, LOG_LINES.length * 220 + 400);
    timeoutsRef.current.push(t);
  };

  const startAnalyzing = () => {
    setPhase('analyzing');
    const t = setTimeout(() => {
      setPhase('done');
    }, 1200);
    timeoutsRef.current.push(t);
  };

  const reset = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setPhase('idle');
    setLogLines([]);
  };

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <motion.button
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
        onClick={onBack}
        className="absolute top-8 left-8 z-20 flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none"
      >
        <span className="text-base leading-none text-black/20 group-hover:text-black transition-colors duration-200">‹</span>
        <span className="text-[0.58rem] tracking-[0.28em] text-black/25 group-hover:text-black transition-colors duration-200 uppercase">뒤로가기</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
        className="flex flex-col items-center gap-1 pt-16 pb-3 shrink-0"
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">아이오코드</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">IPR 프로세스 마이닝</h2>
      </motion.div>

      <div className="flex-1 flex items-center justify-center" style={{ paddingBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Monitor bezel */}
          <div style={{ background: '#2c2c2e', borderRadius: 10, padding: 6, boxShadow: '0 6px 24px rgba(0,0,0,0.28)' }}>
            <div style={{ width: 560, background: '#fff', borderRadius: 5, overflow: 'hidden' }}>

              {/* macOS-style title bar */}
              <div style={{
                background: '#f2f2f2',
                borderBottom: '1px solid #ddd',
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ fontSize: 7, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.2em', marginLeft: 6 }}>
                  IPR Process Mining v2.1
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: '14px 18px 16px', minHeight: 260 }}>
                <AnimatePresence mode="wait">

                  {/* IDLE */}
                  {phase === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Factory → PC layout */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 14 }}>
                        {/* Factory box */}
                        <div style={{
                          border: '1px solid #90a4ae',
                          borderRadius: 8,
                          padding: '10px 14px',
                          textAlign: 'center',
                          background: '#f5f7fa',
                          width: 110,
                        }}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>🏭</div>
                          <div style={{ fontSize: 8, fontWeight: 700, color: '#333' }}>공장 시스템</div>
                          <div style={{ fontSize: 6.5, color: '#888', marginTop: 2 }}>ERP / MES</div>
                        </div>

                        {/* Connector */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120 }}>
                          <div style={{ fontSize: 6.5, color: '#888', marginBottom: 4 }}>로그 데이터</div>
                          <div style={{ position: 'relative', width: '100%', height: 12, display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              width: '100%',
                              borderTop: '1px dashed #90a4ae',
                            }} />
                            <span style={{ position: 'absolute', right: 2, fontSize: 10, color: '#90a4ae', lineHeight: 1 }}>→</span>
                          </div>
                        </div>

                        {/* PC box */}
                        <div style={{
                          border: '1px solid #1565c0',
                          borderRadius: 8,
                          padding: '10px 14px',
                          textAlign: 'center',
                          background: 'rgba(21,101,192,0.05)',
                          width: 110,
                        }}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>💻</div>
                          <div style={{ fontSize: 8, fontWeight: 700, color: '#333' }}>분석 시스템</div>
                          <div style={{ fontSize: 6.5, color: '#888', marginTop: 2 }}>IPR Engine</div>
                        </div>
                      </div>

                      {/* Log console placeholder */}
                      <div style={{
                        background: '#1e1e2e',
                        borderRadius: 6,
                        padding: '8px 10px',
                        height: 70,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                        fontFamily: 'monospace',
                      }}>
                        <span style={{ fontSize: 7, color: '#555' }}>데이터 수집을 시작하세요</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          onClick={startCollecting}
                          style={{
                            padding: '6px 18px',
                            fontSize: 8,
                            borderRadius: 6,
                            border: 'none',
                            background: '#1565c0',
                            color: '#fff',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            letterSpacing: '0.05em',
                          }}
                        >
                          ▶ 데이터 수집 시작
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* COLLECTING */}
                  {phase === 'collecting' && (
                    <motion.div
                      key="collecting"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {/* Factory → PC with animated packets */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <div style={{
                          border: '1px solid #90a4ae',
                          borderRadius: 8,
                          padding: '10px 14px',
                          textAlign: 'center',
                          background: '#f5f7fa',
                          width: 110,
                        }}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>🏭</div>
                          <div style={{ fontSize: 8, fontWeight: 700, color: '#333' }}>공장 시스템</div>
                          <div style={{ fontSize: 6.5, color: '#888', marginTop: 2 }}>ERP / MES</div>
                        </div>

                        {/* Animated connector */}
                        <div style={{ position: 'relative', width: 120, height: 40, display: 'flex', alignItems: 'center' }}>
                          <div style={{ fontSize: 6.5, color: '#888', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>로그 데이터</div>
                          <div style={{ width: '100%', borderTop: '1px dashed #1565c0', position: 'absolute' }} />
                          {/* Animated packets */}
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              style={{
                                position: 'absolute',
                                left: 0,
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: '#1565c0',
                                opacity: 0.85,
                              }}
                              animate={{ left: ['0%', '100%'] }}
                              transition={{
                                duration: 0.9,
                                delay: i * 0.3,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />
                          ))}
                          <span style={{ position: 'absolute', right: 2, fontSize: 10, color: '#1565c0', lineHeight: 1 }}>→</span>
                        </div>

                        <div style={{
                          border: '1px solid #1565c0',
                          borderRadius: 8,
                          padding: '10px 14px',
                          textAlign: 'center',
                          background: 'rgba(21,101,192,0.05)',
                          width: 110,
                        }}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>💻</div>
                          <div style={{ fontSize: 8, fontWeight: 700, color: '#333' }}>분석 시스템</div>
                          <div style={{ fontSize: 6.5, color: '#888', marginTop: 2 }}>IPR Engine</div>
                        </div>
                      </div>

                      {/* Log console */}
                      <div
                        ref={logRef}
                        style={{
                          background: '#1e1e2e',
                          borderRadius: 6,
                          padding: '8px 10px',
                          height: 90,
                          overflowY: 'auto',
                          fontFamily: 'monospace',
                          marginBottom: 12,
                        }}
                      >
                        {logLines.map((line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{ fontSize: 6.5, color: '#a6e3a1', marginBottom: 2, whiteSpace: 'pre' }}
                          >
                            {line}
                          </motion.div>
                        ))}
                        {logLines.length === 0 && (
                          <span style={{ fontSize: 7, color: '#555' }}>수집 중...</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          style={{ fontSize: 7, color: '#1565c0', letterSpacing: '0.1em' }}
                        >
                          ● 데이터 수집 중...
                        </motion.span>
                      </div>
                    </motion.div>
                  )}

                  {/* CHART */}
                  {phase === 'chart' && (
                    <motion.div
                      key="chart"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p style={{ fontSize: 7.5, fontWeight: 700, color: '#333', marginBottom: 8, letterSpacing: '0.05em' }}>
                        프로세스 플로우 차트
                      </p>
                      <div style={{ overflowX: 'auto' }}>
                        <ProcessSVG done={false} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                        <button
                          onClick={startAnalyzing}
                          style={{
                            padding: '6px 18px',
                            fontSize: 8,
                            borderRadius: 6,
                            border: 'none',
                            background: '#1565c0',
                            color: '#fff',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            letterSpacing: '0.05em',
                          }}
                        >
                          📊 프로세스 분석
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ANALYZING */}
                  {phase === 'analyzing' && (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        style={{
                          width: 32,
                          height: 32,
                          border: '3px solid rgba(21,101,192,0.2)',
                          borderTop: '3px solid #1565c0',
                          borderRadius: '50%',
                        }}
                      />
                      <span style={{ fontSize: 8, color: '#1565c0', letterSpacing: '0.1em' }}>분석 중...</span>
                    </motion.div>
                  )}

                  {/* DONE */}
                  {phase === 'done' && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p style={{ fontSize: 7.5, fontWeight: 700, color: '#333', marginBottom: 8, letterSpacing: '0.05em' }}>
                        병목 분석 결과
                      </p>
                      <div style={{ overflowX: 'auto' }}>
                        {/* Pulse animation on bottleneck */}
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <ProcessSVG done={true} />
                          {/* Pulsing overlay for 재고확인 */}
                          <motion.div
                            animate={{ opacity: [0.15, 0.4, 0.15] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{
                              position: 'absolute',
                              left: TOP_X[2] - NODE_W / 2 - 2,
                              top: ROW_Y - NODE_H / 2 - 2,
                              width: NODE_W + 4,
                              height: NODE_H + 4,
                              borderRadius: 7,
                              border: '2px solid #d32f2f',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* Metrics panel */}
                      <div style={{
                        background: '#f5f7fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 6,
                        padding: '8px 12px',
                        marginTop: 8,
                        marginBottom: 10,
                      }}>
                        <div style={{ display: 'flex', gap: 14, marginBottom: 6 }}>
                          {[
                            { label: '케이스 수', value: '1,247건' },
                            { label: '평균 사이클', value: '130분' },
                            { label: '병목 구간', value: '재고확인 (42min avg)', red: true },
                          ].map((m) => (
                            <div key={m.label} style={{ flex: 1 }}>
                              <div style={{ fontSize: 6, color: '#888', marginBottom: 2 }}>{m.label}</div>
                              <div style={{ fontSize: 8, fontWeight: 700, color: m.red ? '#c62828' : '#333' }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{
                          background: 'rgba(21,101,192,0.06)',
                          border: '1px solid rgba(21,101,192,0.2)',
                          borderRadius: 4,
                          padding: '5px 8px',
                          fontSize: 7,
                          color: '#1565c0',
                          lineHeight: 1.5,
                        }}>
                          💡 <strong>개선 가이드:</strong> 재고확인 자동화 시 사이클 타임 32% 단축 예상
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                          onClick={reset}
                          style={{
                            padding: '6px 18px',
                            fontSize: 8,
                            borderRadius: 6,
                            border: '1px solid rgba(0,0,0,0.15)',
                            background: '#f5f5f5',
                            color: '#555',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            letterSpacing: '0.05em',
                          }}
                        >
                          ↺ 초기화
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Monitor stand */}
          <div style={{ width: 20, height: 10, background: '#3a3a3c' }} />
          <div style={{ width: 80, height: 6, background: '#3a3a3c', borderRadius: '0 0 6px 6px' }} />
        </motion.div>
      </div>
    </div>
  );
}
