'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Types ─────────────────────────────────── */
type TaskStatus = 'pending' | 'running' | 'done' | 'error';

interface RpaTask {
  id: string;
  name: string;
  schedule: string;
  steps: string[];
  status: TaskStatus;
  progress: number;
  lastRun?: string;
  log: string[];
}

const INITIAL_TASKS: RpaTask[] = [
  {
    id: 't1',
    name: '일일 보고서 자동 생성',
    schedule: '매일 08:00',
    steps: ['DB 쿼리 실행', 'Excel 파일 생성', '이메일 발송', '로그 기록'],
    status: 'pending',
    progress: 0,
    lastRun: '어제 08:00',
    log: [],
  },
  {
    id: 't2',
    name: '거래 데이터 동기화',
    schedule: '1시간마다',
    steps: ['API 데이터 수집', '데이터 변환', 'DB 저장', '검증 확인'],
    status: 'pending',
    progress: 0,
    lastRun: '1시간 전',
    log: [],
  },
  {
    id: 't3',
    name: '사용자 권한 점검',
    schedule: '매주 월요일 09:00',
    steps: ['계정 목록 조회', '권한 유효성 검사', '만료 계정 비활성화', '관리자 알림'],
    status: 'pending',
    progress: 0,
    lastRun: '3일 전',
    log: [],
  },
];

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

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: 'bg-black/15 text-black/40',
  running: 'bg-blue-100 text-blue-600',
  done: 'bg-emerald-100 text-emerald-600',
  error: 'bg-red-100 text-red-500',
};
const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: '대기', running: '실행 중', done: '완료', error: '오류',
};

/* ─── RPA Task Card ──────────────────────────── */
function TaskCard({ task, onRun, onReset }: {
  task: RpaTask;
  onRun: (id: string) => void;
  onReset: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      className="rounded-2xl border border-black/8 bg-white p-4 flex flex-col gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.6rem] font-medium tracking-[0.08em] text-black/65">{task.name}</p>
          <p className="text-[0.44rem] tracking-[0.15em] text-black/30 mt-0.5">⏰ {task.schedule}</p>
        </div>
        <span className={`text-[0.4rem] tracking-[0.18em] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[task.status]}`}>
          {STATUS_LABEL[task.status]}
        </span>
      </div>

      {/* Steps */}
      <div className="flex gap-1 flex-wrap">
        {task.steps.map((step, i) => {
          const stepDone = task.progress > (i / task.steps.length) * 100;
          const stepActive = task.status === 'running' && Math.floor((task.progress / 100) * task.steps.length) === i;
          return (
            <div key={step} className="flex items-center gap-1">
              <motion.div
                animate={stepActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: stepActive ? Infinity : 0 }}
                className={`px-1.5 py-0.5 rounded text-[0.38rem] tracking-wide transition-all duration-300 ${
                  stepDone ? 'bg-emerald-100 text-emerald-600' :
                  stepActive ? 'bg-blue-100 text-blue-600' :
                  'bg-black/4 text-black/30'
                }`}>
                {step}
              </motion.div>
              {i < task.steps.length - 1 && <span className="text-[0.4rem] text-black/15">→</span>}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {task.status !== 'pending' && (
        <div>
          <div className="w-full h-1 bg-black/6 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${task.status === 'error' ? 'bg-red-400' : 'bg-emerald-400'}`}
              animate={{ width: `${task.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[0.38rem] text-black/25">{task.progress.toFixed(0)}%</span>
            {task.lastRun && <span className="text-[0.38rem] text-black/20">최근: {task.lastRun}</span>}
          </div>
        </div>
      )}

      {/* Log tail */}
      <AnimatePresence>
        {task.log.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="rounded-lg bg-gray-950 p-2 overflow-hidden">
            {task.log.slice(-3).map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                className="text-[0.38rem] font-mono text-emerald-400 leading-relaxed">
                {'>'} {line}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
          onClick={() => onRun(task.id)}
          disabled={task.status === 'running'}
          className="flex-1 py-1.5 rounded-xl text-[0.46rem] tracking-widest font-medium text-white cursor-pointer disabled:opacity-40"
          style={{ background: task.status === 'running' ? '#94a3b8' : '#2563eb' }}>
          {task.status === 'running' ? '실행 중...' : '▶ 실행'}
        </motion.button>
        {(task.status === 'done' || task.status === 'error') && (
          <button onClick={() => onReset(task.id)}
            className="px-3 py-1.5 rounded-xl border border-black/10 text-[0.44rem] tracking-widest text-black/40 cursor-pointer bg-white">
            초기화
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function WinsRpaDemo({ onBack }: { onBack: () => void }) {
  const [tasks, setTasks] = useState<RpaTask[]>(INITIAL_TASKS);
  const timerRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  useEffect(() => {
    const refs = timerRefs.current;
    return () => Object.values(refs).forEach(clearInterval);
  }, []);

  const runTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === 'running') return;

    setTasks((prev) => prev.map((t) => t.id === id
      ? { ...t, status: 'running', progress: 0, log: ['태스크 시작...'] }
      : t));

    let pct = 0;
    const stepMs = 80;
    const logs = task.steps.flatMap((s) => [`${s} 시작`, `${s} 완료`]);
    let logIdx = 0;

    timerRefs.current[id] = setInterval(() => {
      pct += 2.5;
      const newLog = logIdx < logs.length ? [logs[logIdx++]] : [];

      if (pct >= 100) {
        clearInterval(timerRefs.current[id]);
        const now = new Date();
        const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        setTasks((prev) => prev.map((t2) => t2.id === id
          ? { ...t2, status: 'done', progress: 100, lastRun: `오늘 ${t}`, log: [...t2.log, '✅ 완료'] }
          : t2));
      } else {
        setTasks((prev) => prev.map((t2) => t2.id === id
          ? { ...t2, progress: Math.min(pct, 99), log: newLog.length ? [...t2.log, ...newLog] : t2.log }
          : t2));
      }
    }, stepMs);
  };

  const resetTask = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id
      ? { ...t, status: 'pending', progress: 0, log: [] }
      : t));
  };

  const runningCount = tasks.filter((t) => t.status === 'running').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <BackButton onBack={onBack} />

      <motion.div className="flex flex-col items-center gap-1 pt-14 pb-3 shrink-0"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[0.44rem] tracking-[0.45em] text-black/20 uppercase">아이오코드</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.32em] text-black/55">WINS RPA 자동화</h2>
        <div className="flex gap-3 mt-1.5">
          <div className="flex items-center gap-1">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-400"
              animate={runningCount > 0 ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }} />
            <span className="text-[0.4rem] tracking-wide text-black/30">실행중 {runningCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[0.4rem] tracking-wide text-black/30">완료 {doneCount}</span>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
        {/* RPA concept strip */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-black/6 bg-white/60">
          {['트리거', '→', '조건 분기', '→', '자동 실행', '→', '결과 처리'].map((item, i) => (
            <span key={i} className={`text-[0.4rem] ${item === '→' ? 'text-black/15' : 'text-black/40 tracking-wide'}`}>{item}</span>
          ))}
        </div>

        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onRun={runTask} onReset={resetTask} />
        ))}
      </div>
    </div>
  );
}
