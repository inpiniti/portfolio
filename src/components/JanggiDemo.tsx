'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Piece { col: number; row: number; char: string; side: 'han' | 'cho' }

/* ─── Board geometry ── */
const COLS = 9, ROWS = 10;
const PAD = 10, CG = 18, RG = 14;
const BW = PAD * 2 + (COLS - 1) * CG; // 176
const BH = PAD * 2 + (ROWS - 1) * RG; // 146
const PR = 6;

const cx = (c: number) => PAD + c * CG;
const ry = (r: number) => PAD + r * RG;
// Flipped: col/row 0 appears at the far end (cho faces you)
const vx = (c: number, flip: boolean) => flip ? BW - cx(c) : cx(c);
const vy = (r: number, flip: boolean) => flip ? BH - ry(r) : ry(r);

/* ─── Initial positions ── */
const INIT: Piece[] = [
  {col:0,row:0,char:'車',side:'han'},{col:1,row:0,char:'馬',side:'han'},
  {col:2,row:0,char:'象',side:'han'},{col:3,row:0,char:'士',side:'han'},
  {col:4,row:1,char:'將',side:'han'},{col:5,row:0,char:'士',side:'han'},
  {col:6,row:0,char:'象',side:'han'},{col:7,row:0,char:'馬',side:'han'},
  {col:8,row:0,char:'車',side:'han'},
  {col:1,row:2,char:'包',side:'han'},{col:7,row:2,char:'包',side:'han'},
  {col:0,row:3,char:'卒',side:'han'},{col:2,row:3,char:'卒',side:'han'},
  {col:4,row:3,char:'卒',side:'han'},{col:6,row:3,char:'卒',side:'han'},
  {col:8,row:3,char:'卒',side:'han'},
  {col:0,row:9,char:'車',side:'cho'},{col:1,row:9,char:'馬',side:'cho'},
  {col:2,row:9,char:'象',side:'cho'},{col:3,row:9,char:'士',side:'cho'},
  {col:4,row:8,char:'帥',side:'cho'},{col:5,row:9,char:'士',side:'cho'},
  {col:6,row:9,char:'象',side:'cho'},{col:7,row:9,char:'馬',side:'cho'},
  {col:8,row:9,char:'車',side:'cho'},
  {col:1,row:7,char:'砲',side:'cho'},{col:7,row:7,char:'砲',side:'cho'},
  {col:0,row:6,char:'兵',side:'cho'},{col:2,row:6,char:'兵',side:'cho'},
  {col:4,row:6,char:'兵',side:'cho'},{col:6,row:6,char:'兵',side:'cho'},
  {col:8,row:6,char:'兵',side:'cho'},
];

/* ─── Palace helpers ── */
const inHanPalace = (c: number, r: number) => c >= 3 && c <= 5 && r >= 0 && r <= 2;
const inChoPalace = (c: number, r: number) => c >= 3 && c <= 5 && r >= 7 && r <= 9;
const DIAG = new Set(['3,0','4,0','5,0','4,1','3,2','4,2','5,2','3,7','4,7','5,7','4,8','3,9','4,9','5,9']);
const isDiag = (c: number, r: number) => DIAG.has(`${c},${r}`);

/* ─── Valid move calculation (no stale closure — receives all state as args) ── */
function calcMoves(piece: Piece, all: Piece[]): {col:number,row:number}[] {
  const map = new Map<string, Piece>();
  all.forEach(p => map.set(`${p.col},${p.row}`, p));

  const inB = (c: number, r: number) => c >= 0 && c < COLS && r >= 0 && r < ROWS;
  const get  = (c: number, r: number) => map.get(`${c},${r}`);
  const free = (c: number, r: number) => inB(c, r) && !get(c, r);
  // can land: in bounds AND (empty OR enemy)
  const ok   = (c: number, r: number) => inB(c, r) && get(c, r)?.side !== piece.side;

  const res: {col:number,row:number}[] = [];
  const add = (c: number, r: number) => { if (ok(c, r)) res.push({col:c, row:r}); };

  if (piece.char === '車') {
    for (const [dc,dr] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      let c = piece.col+dc, r = piece.row+dr;
      while (inB(c, r)) {
        const p = get(c, r);
        if (p) { if (p.side !== piece.side) res.push({col:c,row:r}); break; }
        res.push({col:c,row:r});
        c+=dc; r+=dr;
      }
    }
    // palace diagonals
    if (isDiag(piece.col, piece.row)) {
      const inP = inHanPalace(piece.col,piece.row) ? inHanPalace : inChoPalace;
      for (const [dc,dr] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
        let c=piece.col+dc, r=piece.row+dr;
        while (inP(c,r) && isDiag(c,r)) {
          const p=get(c,r);
          if (p) { if (p.side!==piece.side) res.push({col:c,row:r}); break; }
          res.push({col:c,row:r});
          c+=dc; r+=dr;
        }
      }
    }
  }

  if (piece.char === '馬') {
    const steps: [number,number,number,number][] = [
      [0,-1,-1,-2],[0,-1,1,-2],[0,1,-1,2],[0,1,1,2],
      [-1,0,-2,-1],[-1,0,-2,1],[1,0,2,-1],[1,0,2,1],
    ];
    for (const [bc,br,dc,dr] of steps) {
      if (!free(piece.col+bc, piece.row+br)) continue;
      add(piece.col+dc, piece.row+dr);
    }
  }

  if (piece.char === '象') {
    const steps: [number,number,number,number,number,number][] = [
      [0,-1,1,-2,2,-3],[0,-1,-1,-2,-2,-3],
      [0,1,1,2,2,3],[0,1,-1,2,-2,3],
      [1,0,2,-1,3,-2],[1,0,2,1,3,2],
      [-1,0,-2,-1,-3,-2],[-1,0,-2,1,-3,2],
    ];
    for (const [b1c,b1r,b2c,b2r,dc,dr] of steps) {
      if (!free(piece.col+b1c, piece.row+b1r)) continue;
      if (!free(piece.col+b2c, piece.row+b2r)) continue;
      add(piece.col+dc, piece.row+dr);
    }
  }

  if (piece.char === '士' || piece.char === '將' || piece.char === '帥') {
    const inP = piece.side === 'han' ? inHanPalace : inChoPalace;
    for (const [dc,dr] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nc=piece.col+dc, nr=piece.row+dr;
      if (inP(nc,nr)) add(nc,nr);
    }
    if (isDiag(piece.col,piece.row)) {
      for (const [dc,dr] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
        const nc=piece.col+dc, nr=piece.row+dr;
        if (inP(nc,nr) && isDiag(nc,nr)) add(nc,nr);
      }
    }
  }

  if (piece.char === '包' || piece.char === '砲') {
    const isCannon = (ch: string) => ch === '包' || ch === '砲';
    for (const [dc,dr] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      let c=piece.col+dc, r=piece.row+dr;
      let jumped = false;
      while (inB(c,r)) {
        const p = get(c,r);
        if (!jumped) {
          if (p) {
            if (!isCannon(p.char)) jumped = true;
            else break; // 포를 스크린으로 쓸 수 없음
          }
        } else {
          if (p) {
            // 스크린 너머 첫 말: 적이면 잡기 가능, 포면 불가
            if (p.side !== piece.side && !isCannon(p.char)) res.push({col:c,row:r});
            break;
          }
          // 스크린 너머 빈 칸: 이동 가능
          res.push({col:c,row:r});
        }
        c+=dc; r+=dr;
      }
    }
  }

  if (piece.char === '卒' || piece.char === '兵') {
    const fwd = piece.side === 'han' ? 1 : -1;
    add(piece.col, piece.row + fwd);     // 앞으로
    add(piece.col - 1, piece.row);       // 좌
    add(piece.col + 1, piece.row);       // 우
    // 궁 안 대각선
    if (isDiag(piece.col, piece.row)) {
      const inP = inHanPalace(piece.col,piece.row) ? inHanPalace : inChoPalace;
      for (const [dc,dr] of [[1,fwd],[-1,fwd]]) {
        const nc=piece.col+dc, nr=piece.row+dr;
        if (inP(nc,nr) && isDiag(nc,nr)) add(nc,nr);
      }
    }
  }

  return res;
}

/* ─── Board SVG ── */
function Board({ pieces, selCol, selRow, moves, flip, disabled, onTap }: {
  pieces: Piece[];
  selCol: number|null; selRow: number|null;
  moves: {col:number,row:number}[];
  flip: boolean; disabled: boolean;
  onTap: (col:number, row:number) => void;
}) {
  const X = (c:number) => vx(c, flip);
  const Y = (r:number) => vy(r, flip);

  return (
    <svg width={BW} height={BH} style={{ display:'block', userSelect:'none' }}>
      <rect x={0} y={0} width={BW} height={BH} fill="#f5e6c8" rx={3} />

      {/* Grid */}
      {Array.from({length:COLS},(_,c) => (
        <line key={`c${c}`} x1={cx(c)} y1={ry(0)} x2={cx(c)} y2={ry(ROWS-1)} stroke="rgba(100,60,20,0.3)" strokeWidth={0.8} />
      ))}
      {Array.from({length:ROWS},(_,r) => (
        <line key={`r${r}`} x1={cx(0)} y1={ry(r)} x2={cx(COLS-1)} y2={ry(r)} stroke="rgba(100,60,20,0.3)" strokeWidth={0.8} />
      ))}

      {/* River */}
      <rect x={cx(0)} y={ry(4)+1} width={cx(COLS-1)-cx(0)} height={ry(5)-ry(4)-2} fill="#f5e6c8" />
      <text x={cx(2)} y={(ry(4)+ry(5))/2+3} fontSize={8} fill="rgba(80,40,10,0.35)" textAnchor="middle" fontWeight="bold">楚</text>
      <text x={cx(6)} y={(ry(4)+ry(5))/2+3} fontSize={8} fill="rgba(80,40,10,0.35)" textAnchor="middle" fontWeight="bold">漢</text>

      {/* Palace diagonals */}
      {[[3,0,5,2],[5,0,3,2],[3,7,5,9],[5,7,3,9]].map(([c1,r1,c2,r2],i) => (
        <line key={`pd${i}`} x1={cx(c1)} y1={ry(r1)} x2={cx(c2)} y2={ry(r2)} stroke="rgba(100,60,20,0.28)" strokeWidth={0.8} />
      ))}

      {/* Valid move dots */}
      {moves.map((m,i) => (
        <circle key={`vm${i}`} cx={X(m.col)} cy={Y(m.row)} r={4}
          fill="rgba(50,170,80,0.65)" stroke="rgba(30,130,60,0.5)" strokeWidth={1}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {/* Selection ring */}
      {selCol !== null && selRow !== null && (
        <circle cx={X(selCol)} cy={Y(selRow)} r={PR+2.5} fill="none" stroke="#f0a020" strokeWidth={2}
          style={{ pointerEvents: 'none' }} />
      )}

      {/* Pieces */}
      {pieces.map((p,i) => {
        const pcx = X(p.col), pcy = Y(p.row);
        const isHan = p.side === 'han';
        return (
          <g key={i} style={{ pointerEvents: 'none' }}>
            <circle cx={pcx} cy={pcy} r={PR}
              fill={isHan ? '#fff6ee' : '#eef2ff'}
              stroke={isHan ? 'rgba(175,55,55,0.75)' : 'rgba(25,75,180,0.75)'}
              strokeWidth={1.3}
            />
            <text x={pcx} y={pcy+3.5} fontSize={8} textAnchor="middle"
              fill={isHan ? 'rgba(175,55,55,0.92)' : 'rgba(25,75,180,0.92)'}
              fontWeight="700"
            >{p.char}</text>
          </g>
        );
      })}

      {/* Invisible click targets on each intersection — on top of everything */}
      {!disabled && Array.from({length:COLS}, (_,c) => Array.from({length:ROWS}, (_,r) => (
        <circle key={`t${c},${r}`} cx={X(c)} cy={Y(r)} r={8}
          fill="transparent"
          style={{ cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onTap(c, r); }}
        />
      )))}
    </svg>
  );
}

/* ─── Monitor shell ── */
function Monitor({ label, title, flip, pieces, selCol, selRow, moves, disabled, receiving, myTurn, onTap }: {
  label: string; title: string; flip: boolean;
  pieces: Piece[]; selCol: number|null; selRow: number|null;
  moves: {col:number,row:number}[];
  disabled: boolean; receiving: boolean; myTurn: boolean;
  onTap: (c:number, r:number) => void;
}) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:6 }}>
        <p style={{ fontSize:7.5, color:'rgba(0,0,0,0.25)', letterSpacing:'0.18em' }}>{label}</p>
        {myTurn && (
          <motion.div animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1, repeat:Infinity }}
            style={{ width:5, height:5, borderRadius:'50%', background:'#48bb78' }} />
        )}
      </div>
      <div style={{ background:'#2c2c2e', borderRadius:8, padding:5, boxShadow:'0 4px 16px rgba(0,0,0,0.25)' }}>
        <div style={{ background: receiving ? '#eef6ff' : '#fff', borderRadius:4, overflow:'hidden', transition:'background 0.3s' }}>
          <div style={{ background: receiving ? '#d8eeff' : '#f2f2f2', borderBottom:'1px solid #ddd', padding:'4px 8px', display:'flex', alignItems:'center', gap:4, transition:'background 0.3s' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#ff5f57' }} />
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#febc2e' }} />
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#28c840' }} />
            <span style={{ fontSize:6, color:'rgba(0,0,0,0.35)', letterSpacing:'0.15em', marginLeft:4 }}>{title}</span>
          </div>
          <div style={{ padding:4 }}>
            <Board pieces={pieces} selCol={selCol} selRow={selRow} moves={moves}
              flip={flip} disabled={disabled} onTap={onTap} />
          </div>
        </div>
      </div>
      <div style={{ width:14, height:6, background:'#3a3a3c' }} />
      <div style={{ width:40, height:5, background:'#3a3a3c', borderRadius:'0 0 4px 4px' }} />
    </div>
  );
}

/* ─── Main ── */
export function JanggiDemo({ onBack }: { onBack: () => void }) {
  const [pieces, setPieces]         = useState<Piece[]>(INIT);
  const [selSrc,  setSelSrc]        = useState<'server'|'client'|null>(null);
  const [selCol,  setSelCol]        = useState<number|null>(null);
  const [selRow,  setSelRow]        = useState<number|null>(null);
  const [moves,   setMoves]         = useState<{col:number,row:number}[]>([]);
  const [turn,    setTurn]          = useState<'server'|'client'>('server');
  const [signal,  setSignal]        = useState<'toClient'|'toServer'|null>(null);
  const [recv,    setRecv]          = useState<'server'|'client'|null>(null);

  const syncing = signal !== null;

  // Single handler — NOT useCallback, always reads latest state
  const handleTap = (col: number, row: number, src: 'server'|'client') => {
    if (syncing) return;
    if (src === 'server' && turn !== 'server') return;
    if (src === 'client' && turn !== 'client') return;

    const mySide: 'han'|'cho' = src === 'server' ? 'han' : 'cho';
    const clicked = pieces.find(p => p.col === col && p.row === row);

    // Nothing selected yet
    if (selCol === null) {
      if (clicked?.side === mySide) {
        setSelSrc(src); setSelCol(col); setSelRow(row);
        setMoves(calcMoves(clicked, pieces));
      }
      return;
    }

    // Deselect same square
    if (col === selCol && row === selRow) {
      setSelSrc(null); setSelCol(null); setSelRow(null); setMoves([]); return;
    }

    // Re-select own piece
    if (clicked?.side === mySide) {
      setSelSrc(src); setSelCol(col); setSelRow(row);
      setMoves(calcMoves(clicked, pieces)); return;
    }

    // Move — must be a valid destination
    const valid = moves.some(m => m.col === col && m.row === row);
    if (!valid) { setSelSrc(null); setSelCol(null); setSelRow(null); setMoves([]); return; }

    const sc = selCol, sr = selRow; // capture before clearing
    const next = pieces
      .filter(p => !(p.col === col && p.row === row)) // capture
      .map(p => p.col === sc && p.row === sr ? { ...p, col, row } : p);

    setPieces(next);
    setSelSrc(null); setSelCol(null); setSelRow(null); setMoves([]);

    const dir = src === 'server' ? 'toClient' : 'toServer';
    setSignal(dir);
    setRecv(dir === 'toClient' ? 'client' : 'server');
    setTimeout(() => {
      setSignal(null);
      setTurn(src === 'server' ? 'client' : 'server');
      setTimeout(() => setRecv(null), 400);
    }, 600);
  };

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
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">인제대학교</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">장기</h2>
      </motion.div>

      <div className="flex-1 flex items-center justify-center" style={{ paddingBottom:24 }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.5 }}
          style={{ display:'flex', alignItems:'center' }}
        >
          <Monitor label="서버" title="장기 — 서버" flip={true}
            pieces={pieces}
            selCol={selSrc==='server' ? selCol : null}
            selRow={selSrc==='server' ? selRow : null}
            moves={selSrc==='server' ? moves : []}
            disabled={syncing} receiving={recv==='server'} myTurn={turn==='server'}
            onTap={(c,r) => handleTap(c, r, 'server')}
          />

          {/* Signal line */}
          <div style={{ width:44, position:'relative', display:'flex', alignItems:'center', flexShrink:0 }}>
            <div style={{ width:'100%', height:1, background:'rgba(0,0,0,0.1)' }} />
            <AnimatePresence>
              {signal && (
                <motion.div key={signal}
                  initial={{ left: signal==='toClient' ? 0 : '100%', opacity:0 }}
                  animate={{ left: signal==='toClient' ? '100%' : 0, opacity:[0,1,1,0] }}
                  exit={{ opacity:0 }}
                  transition={{ duration:0.5 }}
                  style={{ position:'absolute', top:'50%', transform:'translate(-50%,-50%)', width:7, height:7, borderRadius:'50%', background:'#63b3ed', boxShadow:'0 0 6px #63b3ed' }}
                />
              )}
            </AnimatePresence>
          </div>

          <Monitor label="클라이언트" title="장기 — 클라이언트" flip={false}
            pieces={pieces}
            selCol={selSrc==='client' ? selCol : null}
            selRow={selSrc==='client' ? selRow : null}
            moves={selSrc==='client' ? moves : []}
            disabled={syncing} receiving={recv==='client'} myTurn={turn==='client'}
            onTap={(c,r) => handleTap(c, r, 'client')}
          />
        </motion.div>
      </div>
    </div>
  );
}
