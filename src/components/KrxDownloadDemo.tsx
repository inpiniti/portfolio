'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FileItem {
  id: number;
  name: string;
  size: string;
  bytes: number;
  status: 'idle' | 'downloading' | 'paused' | 'done';
  progress: number;
}

const INITIAL_FILES: FileItem[] = [
  { id:1, name:'KRX_주식_일별시세_2024.csv',     size:'128 MB', bytes:128, status:'idle', progress:0 },
  { id:2, name:'KRX_파생상품_거래내역_2024.csv',  size:'84 MB',  bytes:84,  status:'idle', progress:0 },
  { id:3, name:'KRX_채권_수익률_2023-2024.csv',   size:'52 MB',  bytes:52,  status:'idle', progress:0 },
  { id:4, name:'KRX_ETF_NAV_2024.csv',            size:'37 MB',  bytes:37,  status:'idle', progress:0 },
  { id:5, name:'KRX_코스피200_구성종목.csv',       size:'12 MB',  bytes:12,  status:'idle', progress:0 },
];

const TOTAL_BYTES = INITIAL_FILES.reduce((s, f) => s + f.bytes, 0);

export function KrxDownloadDemo({ onBack }: { onBack: () => void }) {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const intervals     = useRef<Record<number, ReturnType<typeof setInterval>>>({});
  const seqMode       = useRef(false); // 순차 다운로드 모드

  useEffect(() => () => Object.values(intervals.current).forEach(clearInterval), []);

  // 순차 모드일 때: 다운로드 중인 파일이 없으면 다음 idle 파일 자동 시작
  useEffect(() => {
    if (!seqMode.current) return;
    const anyDownloading = files.some(f => f.status === 'downloading');
    if (anyDownloading) return;
    const next = files.find(f => f.status === 'idle');
    if (next) startOne(next.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const startOne = (id: number) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'downloading' } : f));
    intervals.current[id] = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id !== id || f.status !== 'downloading') return f;
        const next = Math.min(100, f.progress + 2 + Math.random() * 2);
        if (next >= 100) {
          clearInterval(intervals.current[id]);
          delete intervals.current[id];
          return { ...f, progress: 100, status: 'done' };
        }
        return { ...f, progress: next };
      }));
    }, 120);
  };

  const pauseOne = (id: number) => {
    clearInterval(intervals.current[id]);
    delete intervals.current[id];
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'paused' } : f));
  };

  // 전체 다운로드: 순차 모드 ON → 현재 downloading 없으면 첫 idle 시작
  const startAll = () => {
    seqMode.current = true;
    const anyDownloading = files.some(f => f.status === 'downloading');
    if (!anyDownloading) {
      const first = files.find(f => f.status === 'idle' || f.status === 'paused');
      if (first) startOne(first.id);
    }
  };

  // 일시정지: 순차 모드 OFF + 현재 다운로드 중인 파일 정지
  const pauseAll = () => {
    seqMode.current = false;
    files.forEach(f => { if (f.status === 'downloading') pauseOne(f.id); });
  };

  const resetAll = () => {
    seqMode.current = false;
    Object.values(intervals.current).forEach(clearInterval);
    intervals.current = {};
    setFiles(INITIAL_FILES.map(f => ({ ...f })));
  };

  const doneCount  = files.filter(f => f.status === 'done').length;
  const allDone    = doneCount === files.length;
  const anyRunning = files.some(f => f.status === 'downloading');

  const overallPct    = files.reduce((s, f) => s + (f.bytes * f.progress) / 100, 0) / TOTAL_BYTES * 100;
  const downloadedMB  = files.reduce((s, f) => s + (f.bytes * f.progress) / 100, 0);
  const currentFile   = files.find(f => f.status === 'downloading');

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
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">KRX 대용량 다운로드</h2>
      </motion.div>

      <div className="flex-1 flex items-center justify-center" style={{ paddingBottom:24 }}>
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.2, duration:0.5 }}
          style={{ display:'flex', flexDirection:'column', alignItems:'center' }}
        >
          {/* Monitor */}
          <div style={{ background:'#2c2c2e', borderRadius:10, padding:6, boxShadow:'0 6px 24px rgba(0,0,0,0.28)' }}>
            <div style={{ width:540, background:'#fff', borderRadius:5, overflow:'hidden' }}>

              {/* Title bar */}
              <div style={{ background:'#f2f2f2', borderBottom:'1px solid #ddd', padding:'5px 10px', display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#ff5f57' }} />
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#febc2e' }} />
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#28c840' }} />
                <span style={{ fontSize:7, color:'rgba(0,0,0,0.35)', letterSpacing:'0.2em', marginLeft:6 }}>KRX 대용량 파일 다운로드</span>
              </div>

              {/* ── 파일 상태 패널 ── */}
              <div style={{ background:'#f7f9fc', borderBottom:'2px solid #e0e8f0', padding:'10px 16px' }}>
                <div style={{ fontSize:8, fontWeight:700, color:'rgba(0,0,0,0.5)', letterSpacing:'0.15em', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ display:'inline-block', width:10, height:10, background:'rgba(0,80,200,0.15)', border:'1px solid rgba(0,80,200,0.3)', borderRadius:2 }} />
                  파일 상태
                </div>

                {/* 현재 파일 진행바 */}
                <div style={{ marginBottom:6 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                    <span style={{ fontSize:7, color:'rgba(0,0,0,0.4)', letterSpacing:'0.08em' }}>현재 파일</span>
                    <span style={{ fontSize:7, color:'rgba(0,0,0,0.35)' }}>
                      {currentFile
                        ? `${((currentFile.bytes * currentFile.progress)/100).toFixed(1)} / ${currentFile.bytes} MB`
                        : allDone ? '완료' : '–'}
                    </span>
                  </div>
                  <div style={{ height:11, background:'#e8eef5', borderRadius:3, overflow:'hidden', border:'1px solid #d8e4ef' }}>
                    <motion.div
                      animate={{ width:`${currentFile ? currentFile.progress : allDone ? 100 : 0}%` }}
                      transition={{ duration:0.15 }}
                      style={{
                        height:'100%', borderRadius:2,
                        background: allDone
                          ? 'linear-gradient(90deg,#28a052,#3dd68c)'
                          : 'linear-gradient(90deg,#4a90d9,#66b2ff)',
                      }}
                    />
                  </div>
                </div>

                {/* 전체 파일 진행바 */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                    <span style={{ fontSize:7, color:'rgba(0,0,0,0.4)', letterSpacing:'0.08em' }}>전체 파일</span>
                    <span style={{ fontSize:7, color:'rgba(0,0,0,0.35)' }}>
                      {downloadedMB.toFixed(1)} / {TOTAL_BYTES} MB &nbsp;({doneCount}/{files.length})
                    </span>
                  </div>
                  <div style={{ height:11, background:'#e8eef5', borderRadius:3, overflow:'hidden', border:'1px solid #d8e4ef' }}>
                    <motion.div
                      animate={{ width:`${overallPct}%` }}
                      transition={{ duration:0.15 }}
                      style={{
                        height:'100%', borderRadius:2,
                        background: allDone
                          ? 'linear-gradient(90deg,#28a052,#3dd68c)'
                          : 'linear-gradient(90deg,#4a90d9,#66b2ff)',
                      }}
                    />
                  </div>
                </div>

                {/* Speed + controls */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    {anyRunning && (
                      <motion.span
                        animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.2, repeat:Infinity }}
                        style={{ fontSize:7, color:'rgba(0,80,200,0.6)', letterSpacing:'0.08em' }}
                      >
                        ↓ {(8 + Math.random()*4).toFixed(1)} MB/s
                      </motion.span>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <motion.button
                      whileTap={{ scale:0.95 }}
                      onClick={anyRunning ? pauseAll : startAll}
                      disabled={allDone}
                      style={{
                        padding:'3px 12px', fontSize:7.5, letterSpacing:'0.1em', borderRadius:5,
                        cursor: allDone ? 'default' : 'pointer', fontFamily:'inherit',
                        background: anyRunning ? 'rgba(200,140,0,0.1)' : 'rgba(0,80,200,0.1)',
                        border: anyRunning ? '1px solid rgba(200,140,0,0.35)' : '1px solid rgba(0,80,200,0.3)',
                        color: anyRunning ? 'rgba(140,90,0,0.85)' : 'rgba(0,60,160,0.8)',
                        opacity: allDone ? 0.4 : 1,
                      }}
                    >
                      {anyRunning ? '⏸ 일시정지' : allDone ? '✓ 완료' : '▶ 전체 다운로드'}
                    </motion.button>
                    <button
                      onClick={resetAll}
                      style={{ padding:'3px 10px', fontSize:7.5, letterSpacing:'0.08em', borderRadius:5, cursor:'pointer', fontFamily:'inherit', background:'rgba(0,0,0,0.04)', border:'1px solid rgba(0,0,0,0.12)', color:'rgba(0,0,0,0.4)' }}
                    >초기화</button>
                  </div>
                </div>
              </div>

              {/* ── 저장 위치 바 ── */}
              <div style={{ background:'#f2f5f8', borderBottom:'1px solid #e0e8f0', padding:'5px 14px', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:7, color:'rgba(0,0,0,0.3)', letterSpacing:'0.06em' }}>저장위치</span>
                <div style={{ flex:1, background:'#fff', border:'1px solid #d8e4ef', borderRadius:3, padding:'2px 8px', fontSize:7, color:'rgba(0,0,0,0.4)' }}>
                  C:\Users\KRX\Downloads\
                </div>
              </div>

              {/* ── 개별 파일 목록 헤더 ── */}
              <div style={{ display:'flex', alignItems:'center', padding:'4px 14px', borderBottom:'1px solid #eee', background:'#fafafa' }}>
                <span style={{ flex:1,   fontSize:6.5, color:'rgba(0,0,0,0.3)', letterSpacing:'0.1em' }}>파일</span>
                <span style={{ width:80, fontSize:6.5, color:'rgba(0,0,0,0.3)', textAlign:'center', letterSpacing:'0.06em' }}>상태</span>
                <span style={{ width:52, fontSize:6.5, color:'rgba(0,0,0,0.3)', textAlign:'right', letterSpacing:'0.06em' }}>크기</span>
                <span style={{ width:44 }} />
              </div>

              {/* ── 개별 파일 행 ── */}
              {files.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:i*0.04, duration:0.25 }}
                  style={{
                    display:'flex', alignItems:'center',
                    padding:'5px 14px',
                    borderBottom:'1px solid #f5f5f5',
                    background: f.status === 'downloading' ? 'rgba(0,80,200,0.03)' : '#fff',
                  }}
                >
                  {/* Icon + name */}
                  <div style={{ flex:1, display:'flex', alignItems:'center', gap:5, minWidth:0 }}>
                    <span style={{ fontSize:10, flexShrink:0 }}>
                      {f.status==='done' ? '✅' : f.status==='downloading' ? '📥' : f.status==='paused' ? '⏸️' : '📄'}
                    </span>
                    <span style={{ fontSize:7.5, color:'rgba(0,0,0,0.6)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {f.name}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width:80, padding:'0 6px', flexShrink:0 }}>
                    <div style={{ height:7, background:'#ececec', borderRadius:2, overflow:'hidden', border:'1px solid #e0e0e0', marginBottom:1 }}>
                      <motion.div
                        animate={{ width:`${f.progress}%` }}
                        transition={{ duration:0.1 }}
                        style={{
                          height:'100%',
                          background: f.status==='done'
                            ? 'linear-gradient(90deg,#28a052,#3dd68c)'
                            : f.status==='paused'
                            ? 'rgba(200,140,0,0.55)'
                            : 'linear-gradient(90deg,#4a90d9,#66b2ff)',
                        }}
                      />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:5.5, color:'rgba(0,0,0,0.28)' }}>{((f.bytes*f.progress)/100).toFixed(1)}/{f.bytes}MB</span>
                      <span style={{ fontSize:5.5, color:'rgba(0,0,0,0.28)' }}>{Math.floor(f.progress)}%</span>
                    </div>
                  </div>

                  {/* Size */}
                  <span style={{ width:52, fontSize:7, color:'rgba(0,0,0,0.35)', textAlign:'right', flexShrink:0 }}>{f.size}</span>

                  {/* Individual control */}
                  <div style={{ width:44, display:'flex', justifyContent:'center', flexShrink:0 }}>
                    {f.status === 'done' ? (
                      <span style={{ fontSize:6.5, color:'rgba(40,160,80,0.8)' }}>완료</span>
                    ) : f.status === 'downloading' ? (
                      <button
                        onClick={() => { seqMode.current = false; pauseOne(f.id); }}
                        style={{ padding:'2px 5px', fontSize:6, borderRadius:3, border:'1px solid rgba(200,140,0,0.3)', background:'rgba(200,140,0,0.08)', color:'rgba(140,90,0,0.8)', cursor:'pointer', fontFamily:'inherit' }}
                      >정지</button>
                    ) : (
                      <button
                        onClick={() => startOne(f.id)}
                        style={{ padding:'2px 6px', fontSize:6, borderRadius:3, border:'1px solid rgba(0,80,200,0.25)', background:'rgba(0,80,200,0.07)', color:'rgba(0,60,160,0.75)', cursor:'pointer', fontFamily:'inherit' }}
                      >
                        {f.status === 'paused' ? '재개' : '시작'}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* All done footer */}
              <AnimatePresence>
                {allDone && (
                  <motion.div
                    initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    style={{ padding:'8px 14px', textAlign:'center', background:'rgba(40,160,80,0.05)', borderTop:'1px solid rgba(40,160,80,0.15)' }}
                  >
                    <span style={{ fontSize:7.5, color:'rgba(40,160,80,0.85)', letterSpacing:'0.2em' }}>✓ 모든 파일 다운로드 완료</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{ width:20, height:10, background:'#3a3a3c' }} />
          <div style={{ width:80, height:6, background:'#3a3a3c', borderRadius:'0 0 6px 6px' }} />
        </motion.div>
      </div>
    </div>
  );
}
