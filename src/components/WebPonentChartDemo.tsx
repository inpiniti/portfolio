'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Candlestick data ─── */
const CANDLES = [
  { d:'03.03', o:55800, h:56200, l:55400, c:55700 },
  { d:'03.05', o:55700, h:56100, l:55300, c:56000 },
  { d:'03.07', o:56000, h:56500, l:55700, c:55500 },
  { d:'03.10', o:55500, h:56000, l:54900, c:54800 },
  { d:'03.12', o:54800, h:55500, l:54600, c:55300 },
  { d:'03.13', o:55300, h:56000, l:55000, c:55800 },
  { d:'03.14', o:55800, h:56800, l:55600, c:54900 },
  { d:'03.17', o:54900, h:55800, l:54700, c:55600 },
  { d:'03.19', o:55600, h:56500, l:55400, c:57100 },
  { d:'03.21', o:57100, h:57600, l:56800, c:57200 },
  { d:'03.24', o:57200, h:58000, l:57000, c:57800 },
  { d:'03.25', o:57800, h:58500, l:57500, c:58300 },
  { d:'03.26', o:58300, h:59000, l:58000, c:58600 },
  { d:'03.28', o:58600, h:59500, l:58400, c:59200 },
  { d:'03.31', o:59200, h:60000, l:59000, c:59800 },
  { d:'04.02', o:59800, h:60800, l:59500, c:60500 },
  { d:'04.03', o:60500, h:61500, l:60200, c:61000 },
  { d:'04.04', o:61000, h:62000, l:60700, c:61600 },
  { d:'04.07', o:61600, h:62000, l:60800, c:60900 },
  { d:'04.10', o:60900, h:61500, l:60100, c:60400 },
];

const yp = (price: number) => 8 + ((62500 - price) / (62500 - 54500)) * 169;
const xc = (i: number) => 18 + i * 20;

/* ─── Candlestick Chart ─── */
function CandlestickChart({ count }: { count: number }) {
  const yLabels = [61000, 59000, 57000, 55000];
  return (
    <svg width={420} height={185} style={{ display: 'block' }}>
      {/* Y-axis grid lines */}
      {yLabels.map((v) => (
        <g key={v}>
          <line
            x1={32} y1={yp(v)} x2={415} y2={yp(v)}
            stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="3,3"
          />
          <text x={28} y={yp(v) + 2} textAnchor="end" fontSize={6} fill="#9ca3af">
            {(v / 1000).toFixed(0)}K
          </text>
        </g>
      ))}

      {/* Candles */}
      {CANDLES.slice(0, count).map((c, i) => {
        const bull = c.c >= c.o;
        const color = bull ? '#e53e3e' : '#3182ce';
        const bodyTop = Math.min(yp(c.o), yp(c.c));
        const bodyBot = Math.max(yp(c.o), yp(c.c));
        const bodyH = Math.max(bodyBot - bodyTop, 1);
        const cx = xc(i);
        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={cx + 4.5} y1={yp(c.h)} x2={cx + 4.5} y2={yp(c.l)}
              stroke={color} strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={cx} y={bodyTop} width={9} height={bodyH}
              fill={color}
            />
          </g>
        );
      })}

      {/* X-axis date labels every 4 candles */}
      {CANDLES.map((c, i) =>
        i % 4 === 0 ? (
          <text key={i} x={xc(i) + 4.5} y={182} textAnchor="middle" fontSize={6} fill="#9ca3af">
            {c.d}
          </text>
        ) : null
      )}
    </svg>
  );
}

/* ─── Pie / Donut Chart ─── */
function PieChart() {
  const data = [35, 25, 20, 12, 8];
  const colors = ['#e53e3e', '#3182ce', '#48bb78', '#ed8936', '#805ad5'];
  const labels = ['국내주식', '해외주식', '채권', '현금', '기타'];
  const total = data.reduce((a, b) => a + b, 0);
  const cx = 110, cy = 90, r = 72, ri = 38;

  let startAngle = -Math.PI / 2;
  const slices = data.map((v, i) => {
    const angle = (v / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + ri * Math.cos(startAngle);
    const iy1 = cy + ri * Math.sin(startAngle);
    const ix2 = cx + ri * Math.cos(endAngle);
    const iy2 = cy + ri * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ri} ${ri} 0 ${large} 0 ${ix1} ${iy1} Z`;
    const midAngle = startAngle + angle / 2;
    startAngle = endAngle;
    return { d, color: colors[i], midAngle, label: labels[i], value: v };
  });

  return (
    <svg width={420} height={185} style={{ display: 'block' }}>
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.color} stroke="#fff" strokeWidth={1.5} />
      ))}
      {/* Center label */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={9} fill="#374151" fontWeight="bold">포트폴리오</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize={7} fill="#6b7280">구성비율</text>
      {/* Legend */}
      {labels.map((l, i) => (
        <g key={i}>
          <rect x={240} y={30 + i * 26} width={9} height={9} fill={colors[i]} rx={2} />
          <text x={255} y={39 + i * 26} fontSize={8} fill="#374151">{l}</text>
          <text x={310} y={39 + i * 26} fontSize={8} fill="#6b7280">{data[i]}%</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Radar Chart ─── */
function RadarChart() {
  const axes = ['수익성', '안정성', '성장성', '유동성', '효율성', '혁신성'];
  const aData = [85, 72, 90, 65, 78, 88];
  const bData = [70, 85, 65, 80, 72, 60];
  const cx = 165, cy = 95, maxR = 68;
  const n = axes.length;
  const angle = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;
  const pt = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });
  const polyPoints = (data: number[]) =>
    data.map((v, i) => { const p = pt(i, (v / 100) * maxR); return `${p.x},${p.y}`; }).join(' ');

  return (
    <svg width={420} height={185} style={{ display: 'block' }}>
      {/* Grid pentagons at 25%, 50%, 75%, 100% */}
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={axes.map((_, i) => { const p = pt(i, maxR * f); return `${p.x},${p.y}`; }).join(' ')}
          fill="none" stroke="#e5e7eb" strokeWidth={0.75}
        />
      ))}
      {/* Axis lines */}
      {axes.map((_, i) => {
        const p = pt(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth={0.75} />;
      })}
      {/* Data polygons */}
      <polygon points={polyPoints(aData)} fill="rgba(229,62,62,0.2)" stroke="#e53e3e" strokeWidth={1.5} />
      <polygon points={polyPoints(bData)} fill="rgba(49,130,206,0.2)" stroke="#3182ce" strokeWidth={1.5} />
      {/* Axis labels */}
      {axes.map((label, i) => {
        const p = pt(i, maxR + 12);
        return (
          <text key={i} x={p.x} y={p.y + 3} textAnchor="middle" fontSize={7} fill="#4b5563">{label}</text>
        );
      })}
      {/* Legend */}
      <rect x={320} y={35} width={8} height={8} fill="rgba(229,62,62,0.5)" stroke="#e53e3e" strokeWidth={1} />
      <text x={332} y={43} fontSize={8} fill="#374151">회사A</text>
      <rect x={320} y={52} width={8} height={8} fill="rgba(49,130,206,0.5)" stroke="#3182ce" strokeWidth={1} />
      <text x={332} y={60} fontSize={8} fill="#374151">회사B</text>
    </svg>
  );
}

/* ─── Angular Gauge ─── */
function AngularGauge() {
  const cx = 145, cy = 115, r = 75;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const valueAngle = startAngle + (72 / 100) * Math.PI;
  const arcPath = (sa: number, ea: number, radius: number) => {
    const x1 = cx + radius * Math.cos(sa);
    const y1 = cy + radius * Math.sin(sa);
    const x2 = cx + radius * Math.cos(ea);
    const y2 = cy + radius * Math.sin(ea);
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };
  const needleX = cx + (r - 15) * Math.cos(valueAngle);
  const needleY = cy + (r - 15) * Math.sin(valueAngle);

  return (
    <svg width={420} height={185} style={{ display: 'block' }}>
      {/* Background arc */}
      <path d={arcPath(Math.PI, 2 * Math.PI, r)} fill="none" stroke="#e5e7eb" strokeWidth={14} strokeLinecap="butt" />
      {/* Green zone 0-60 */}
      <path d={arcPath(Math.PI, Math.PI + 0.6 * Math.PI, r)} fill="none" stroke="#48bb78" strokeWidth={14} strokeLinecap="butt" />
      {/* Yellow zone 60-80 */}
      <path d={arcPath(Math.PI + 0.6 * Math.PI, Math.PI + 0.8 * Math.PI, r)} fill="none" stroke="#ed8936" strokeWidth={14} strokeLinecap="butt" />
      {/* Red zone 80-100 */}
      <path d={arcPath(Math.PI + 0.8 * Math.PI, 2 * Math.PI, r)} fill="none" stroke="#e53e3e" strokeWidth={14} strokeLinecap="butt" />
      {/* Needle */}
      <line
        x1={cx} y1={cy}
        x2={needleX} y2={needleY}
        stroke="#1f2937" strokeWidth={2.5} strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill="#1f2937" />
      {/* Center value */}
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={20} fontWeight="bold" fill="#1f2937">72</text>
      <text x={cx} y={cy + 34} textAnchor="middle" fontSize={8} fill="#6b7280">점수</text>
      {/* End labels */}
      <text x={cx - r - 6} y={cy + 5} textAnchor="middle" fontSize={8} fill="#6b7280">0</text>
      <text x={cx + r + 6} y={cy + 5} textAnchor="middle" fontSize={8} fill="#6b7280">100</text>
      {/* Zone labels */}
      <text x={cx - 52} y={cy - 28} textAnchor="middle" fontSize={7} fill="#48bb78">양호</text>
      <text x={cx + 10} y={cy - 68} textAnchor="middle" fontSize={7} fill="#ed8936">보통</text>
      <text x={cx + 60} y={cy - 32} textAnchor="middle" fontSize={7} fill="#e53e3e">위험</text>
      {/* Description */}
      <text x={310} y={55} fontSize={9} fontWeight="bold" fill="#374151">종합 점수</text>
      <text x={310} y={70} fontSize={8} fill="#6b7280">72 / 100</text>
      <rect x={308} y={80} width={8} height={8} fill="#48bb78" rx={1} />
      <text x={320} y={88} fontSize={7} fill="#6b7280">0 ~ 60 양호</text>
      <rect x={308} y={93} width={8} height={8} fill="#ed8936" rx={1} />
      <text x={320} y={101} fontSize={7} fill="#6b7280">60 ~ 80 보통</text>
      <rect x={308} y={106} width={8} height={8} fill="#e53e3e" rx={1} />
      <text x={320} y={114} fontSize={7} fill="#6b7280">80 ~ 100 위험</text>
    </svg>
  );
}

/* ─── Linear Gauge ─── */
function LinearGauge() {
  const metrics = [
    { label: 'CPU', value: 68, color: '#3182ce' },
    { label: 'Memory', value: 45, color: '#48bb78' },
    { label: 'Disk', value: 82, color: '#e53e3e' },
    { label: 'Network', value: 23, color: '#ed8936' },
  ];
  return (
    <svg width={420} height={185} style={{ display: 'block' }}>
      <text x={20} y={22} fontSize={9} fontWeight="bold" fill="#374151">시스템 리소스 모니터</text>
      {metrics.map((m, i) => {
        const y = 40 + i * 35;
        const barW = 280;
        const fillW = (m.value / 100) * barW;
        return (
          <g key={i}>
            <text x={20} y={y + 9} fontSize={9} fill="#374151" fontWeight="600">{m.label}</text>
            <rect x={90} y={y} width={barW} height={14} rx={7} fill="#f3f4f6" />
            <rect x={90} y={y} width={fillW} height={14} rx={7} fill={m.color} />
            <text x={380} y={y + 10} fontSize={8} fill="#374151" fontWeight="bold">{m.value}%</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Thermometer ─── */
function Thermometer() {
  const value = 38.5;
  const maxVal = 50;
  const bulbCx = 210, bulbCy = 158, bulbR = 14;
  const tubeX = 204, tubeTop = 30, tubeBot = bulbCy - bulbR + 2;
  const tubeH = tubeBot - tubeTop;
  const tubeW = 12;
  const fillH = (value / maxVal) * tubeH;
  const fillY = tubeBot - fillH;
  const ticks = [0, 10, 20, 30, 40, 50];

  return (
    <svg width={420} height={185} style={{ display: 'block' }}>
      <text x={130} y={20} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#374151">체온 측정기</text>
      {/* Tube background */}
      <rect x={tubeX} y={tubeTop} width={tubeW} height={tubeH} rx={6} fill="#f3f4f6" stroke="#d1d5db" strokeWidth={1} />
      {/* Mercury fill */}
      <rect x={tubeX} y={fillY} width={tubeW} height={fillH} rx={6} fill="#e53e3e" />
      {/* Bulb */}
      <circle cx={bulbCx} cy={bulbCy} r={bulbR} fill="#e53e3e" stroke="#d1d5db" strokeWidth={1} />
      {/* Tick marks */}
      {ticks.map((t) => {
        const ty = tubeBot - (t / maxVal) * tubeH;
        return (
          <g key={t}>
            <line x1={tubeX + tubeW} y1={ty} x2={tubeX + tubeW + 6} y2={ty} stroke="#9ca3af" strokeWidth={0.75} />
            <text x={tubeX + tubeW + 10} y={ty + 3} fontSize={7} fill="#6b7280">{t}°</text>
          </g>
        );
      })}
      {/* Current value label */}
      <text x={bulbCx} y={bulbCy + 4} textAnchor="middle" fontSize={8} fill="#fff" fontWeight="bold">
        {value}
      </text>
      <text x={bulbCx} y={bulbCy + 30} textAnchor="middle" fontSize={8} fill="#6b7280">°C</text>
      {/* Info panel */}
      <rect x={280} y={40} width={110} height={90} rx={6} fill="#fef3f2" stroke="#fecaca" strokeWidth={1} />
      <text x={335} y={60} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#374151">현재 체온</text>
      <text x={335} y={82} textAnchor="middle" fontSize={22} fontWeight="bold" fill="#e53e3e">{value}°</text>
      <text x={335} y={98} textAnchor="middle" fontSize={7} fill="#6b7280">정상 범위: 36.5~37.5°C</text>
      <text x={335} y={114} textAnchor="middle" fontSize={7} fill="#e53e3e">⚠ 고온 주의</text>
    </svg>
  );
}

/* ─── Cylinder Chart ─── */
function CylinderChart() {
  const data = [65, 82, 47, 91, 58];
  const labels = ['1Q', '2Q', '3Q', '4Q', '5Q'];
  const maxVal = 100;
  const chartH = 130, barW = 36, ew = barW, eh = 10;
  const baseY = 165;
  const startX = 35;
  const gap = 62;

  return (
    <svg width={420} height={185} style={{ display: 'block' }}>
      <text x={210} y={14} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#374151">분기별 실적</text>
      {/* Y grid */}
      {[25, 50, 75, 100].map((v) => {
        const gy = baseY - (v / maxVal) * chartH;
        return (
          <g key={v}>
            <line x1={22} y1={gy} x2={355} y2={gy} stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="3,3" />
            <text x={18} y={gy + 3} textAnchor="end" fontSize={6} fill="#9ca3af">{v}</text>
          </g>
        );
      })}
      {data.map((v, i) => {
        const bh = (v / maxVal) * chartH;
        const bx = startX + i * gap;
        const by = baseY - bh;
        const isHigh = v >= 80;
        const fillColor = isHigh ? '#e53e3e' : '#3182ce';
        const darkColor = isHigh ? '#c53030' : '#2c5282';
        return (
          <g key={i}>
            {/* Cylinder body */}
            <rect x={bx} y={by + eh / 2} width={barW} height={bh - eh / 2} fill={fillColor} />
            {/* Bottom ellipse */}
            <ellipse cx={bx + ew / 2} cy={baseY} rx={ew / 2} ry={eh / 2} fill={darkColor} />
            {/* Top ellipse */}
            <ellipse cx={bx + ew / 2} cy={by + eh / 2} rx={ew / 2} ry={eh / 2} fill={darkColor} />
            {/* Value label */}
            <text x={bx + ew / 2} y={by - 2} textAnchor="middle" fontSize={7} fill="#374151" fontWeight="bold">{v}</text>
            {/* X label */}
            <text x={bx + ew / 2} y={baseY + 12} textAnchor="middle" fontSize={8} fill="#6b7280">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── TreeMap ─── */
function TreeMap() {
  const data = [
    { label: 'IT', value: 35, color: '#3182ce' },
    { label: '금융', value: 22, color: '#48bb78' },
    { label: '화학', value: 18, color: '#ed8936' },
    { label: '자동차', value: 12, color: '#805ad5' },
    { label: '헬스', value: 8, color: '#e53e3e' },
    { label: '기타', value: 5, color: '#6b7280' },
  ];
  const total = data.reduce((a, b) => a + b.value, 0);
  const W = 380, H = 155, ox = 20, oy = 18;
  // Simple horizontal split layout
  let rects: { x: number; y: number; w: number; h: number; label: string; value: number; color: string }[] = [];
  // Row 1: top 3 items
  const top3 = data.slice(0, 3);
  const top3Total = top3.reduce((a, b) => a + b.value, 0);
  let row1H = Math.round((top3Total / total) * H);
  let x1 = ox;
  top3.forEach((d) => {
    const w = Math.round((d.value / top3Total) * W);
    rects.push({ x: x1, y: oy, w, h: row1H, ...d });
    x1 += w;
  });
  // Row 2: bottom 3 items
  const bot3 = data.slice(3);
  const bot3Total = bot3.reduce((a, b) => a + b.value, 0);
  let row2H = H - row1H;
  let x2 = ox;
  bot3.forEach((d) => {
    const w = Math.round((d.value / bot3Total) * W);
    rects.push({ x: x2, y: oy + row1H, w, h: row2H, ...d });
    x2 += w;
  });

  return (
    <svg width={420} height={185} style={{ display: 'block' }}>
      <text x={210} y={13} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#374151">섹터별 시가총액 비중</text>
      {rects.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w - 2} height={r.h - 2} fill={r.color} rx={3} opacity={0.85} />
          {r.w > 25 && r.h > 16 && (
            <>
              <text x={r.x + r.w / 2 - 1} y={r.y + r.h / 2} textAnchor="middle" fontSize={Math.min(10, r.w / 5)} fontWeight="bold" fill="#fff">
                {r.label}
              </text>
              {r.h > 24 && (
                <text x={r.x + r.w / 2 - 1} y={r.y + r.h / 2 + 11} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.8)">
                  {r.value}%
                </text>
              )}
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ─── Scatter Plot ─── */
function ScatterPlot() {
  const groupA = [
    [15, 72], [22, 85], [31, 60], [40, 78], [48, 90],
    [55, 65], [62, 82], [70, 55], [78, 74], [85, 88],
    [28, 42], [45, 55], [60, 48], [72, 62], [88, 70],
  ];
  const groupB = [
    [10, 30], [18, 48], [25, 22], [35, 38], [42, 52],
    [50, 28], [58, 44], [65, 35], [74, 50], [82, 40],
    [20, 65], [38, 70], [52, 62], [68, 75], [80, 58],
  ];
  const ox = 35, oy = 15, cw = 340, ch = 145;
  const sx = (v: number) => ox + (v / 100) * cw;
  const sy = (v: number) => oy + ch - (v / 100) * ch;

  return (
    <svg width={420} height={185} style={{ display: 'block' }}>
      {/* Grid */}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={ox} y1={sy(v)} x2={ox + cw} y2={sy(v)} stroke="#f3f4f6" strokeWidth={1} />
          <line x1={sx(v)} y1={oy} x2={sx(v)} y2={oy + ch} stroke="#f3f4f6" strokeWidth={1} />
          <text x={sx(v)} y={oy + ch + 10} textAnchor="middle" fontSize={6} fill="#9ca3af">{v}</text>
          <text x={ox - 4} y={sy(v) + 2} textAnchor="end" fontSize={6} fill="#9ca3af">{v}</text>
        </g>
      ))}
      {/* Axes */}
      <line x1={ox} y1={oy} x2={ox} y2={oy + ch} stroke="#d1d5db" strokeWidth={1} />
      <line x1={ox} y1={oy + ch} x2={ox + cw} y2={oy + ch} stroke="#d1d5db" strokeWidth={1} />
      {/* Group A - blue */}
      {groupA.map(([x, y], i) => (
        <circle key={i} cx={sx(x)} cy={sy(y)} r={3.5} fill="#3182ce" fillOpacity={0.7} />
      ))}
      {/* Group B - red */}
      {groupB.map(([x, y], i) => (
        <circle key={i} cx={sx(x)} cy={sy(y)} r={3.5} fill="#e53e3e" fillOpacity={0.7} />
      ))}
      {/* Legend */}
      <circle cx={390} cy={42} r={4} fill="#3182ce" fillOpacity={0.7} />
      <text x={398} y={45} fontSize={7} fill="#374151">그룹A</text>
      <circle cx={390} cy={56} r={4} fill="#e53e3e" fillOpacity={0.7} />
      <text x={398} y={59} fontSize={7} fill="#374151">그룹B</text>
    </svg>
  );
}

/* ─── Sidebar menu items ─── */
type ChartKey = 'timeslice' | 'scatter' | 'angular' | 'cylinder' | 'linear' | 'pie' | 'radar' | 'thermo' | 'treemap';

const MENU_ITEMS: { key: ChartKey; label: string }[] = [
  { key: 'timeslice', label: 'Chart Demo' },
  { key: 'scatter',   label: 'Chart Series' },
  { key: 'angular',   label: 'Visual AngularGauge' },
  { key: 'cylinder',  label: 'Visual Cylinder' },
  { key: 'linear',    label: 'Visual LinearGauge' },
  { key: 'pie',       label: 'Visual Pie' },
  { key: 'radar',     label: 'Visual Radar' },
  { key: 'thermo',    label: 'Visual Thermometer' },
  { key: 'treemap',   label: 'Visual TreeMap' },
];

const CHART_TITLES: Record<ChartKey, { title: string; sub: string }> = {
  timeslice: { title: 'OPTIONS', sub: 'TIMESLICE — Candlestick Chart' },
  scatter:   { title: 'OPTIONS', sub: 'SCATTER — Scatter Plot' },
  angular:   { title: 'OPTIONS', sub: 'ANGULAR GAUGE — Semicircle Gauge' },
  cylinder:  { title: 'OPTIONS', sub: 'CYLINDER — 3D Bar Chart' },
  linear:    { title: 'OPTIONS', sub: 'LINEAR GAUGE — Bar Gauge' },
  pie:       { title: 'OPTIONS', sub: 'PIE — Donut Chart' },
  radar:     { title: 'OPTIONS', sub: 'RADAR — Pentagon Radar' },
  thermo:    { title: 'OPTIONS', sub: 'THERMOMETER — Temperature Gauge' },
  treemap:   { title: 'OPTIONS', sub: 'TREEMAP — Sector Map' },
};

/* ─── Timeslice panel with controls ─── */
type PlayPhase = 'idle' | 'playing' | 'done';

function TimeslicePanel() {
  const [playCount, setPlayCount] = useState(0);
  const [phase, setPhase] = useState<PlayPhase>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const handlePlay = () => {
    if (phase === 'done') setPlayCount(0);
    setPhase('playing');
  };

  const handlePause = () => {
    clearTimer();
    setPhase('idle');
  };

  const handleStop = () => {
    clearTimer();
    setPlayCount(0);
    setPhase('idle');
  };

  useEffect(() => {
    if (phase === 'playing') {
      clearTimer();
      intervalRef.current = setInterval(() => {
        setPlayCount((prev) => {
          if (prev >= 20) {
            clearTimer();
            setPhase('done');
            return 20;
          }
          return prev + 1;
        });
      }, 250);
    }
    return clearTimer;
  }, [phase]);

  const currentDate = playCount > 0 ? CANDLES[Math.min(playCount - 1, 19)].d : '03.03';
  const displayDate = `2014.03.03 ~ 2014.${currentDate}`;

  return (
    <div>
      <CandlestickChart count={playCount} />
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px 6px', borderTop: '1px solid #f3f4f6' }}>
        <button
          onClick={handlePlay}
          disabled={phase === 'playing'}
          style={{
            fontSize: 8, padding: '3px 7px', border: '1px solid #3182ce',
            borderRadius: 3, background: phase === 'playing' ? '#ebf8ff' : '#fff',
            color: phase === 'playing' ? '#90cdf4' : '#3182ce',
            cursor: phase === 'playing' ? 'default' : 'pointer', fontFamily: 'inherit',
          }}
        >재생</button>
        <button
          onClick={handlePause}
          disabled={phase !== 'playing'}
          style={{
            fontSize: 8, padding: '3px 7px', border: '1px solid #ed8936',
            borderRadius: 3, background: '#fff',
            color: phase !== 'playing' ? '#fbd38d' : '#ed8936',
            cursor: phase !== 'playing' ? 'default' : 'pointer', fontFamily: 'inherit',
          }}
        >일시정지</button>
        <button
          onClick={handleStop}
          style={{
            fontSize: 8, padding: '3px 7px', border: '1px solid #e53e3e',
            borderRadius: 3, background: '#fff', color: '#e53e3e',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >정지</button>
        <span style={{ fontSize: 8, color: '#9ca3af', marginLeft: 4 }}>DATE: {displayDate}</span>
      </div>
    </div>
  );
}

/* ─── Content area chart switcher ─── */
function ChartContent({ chartKey }: { chartKey: ChartKey }) {
  const { title, sub } = CHART_TITLES[chartKey];
  return (
    <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Title bar */}
      <div style={{ padding: '8px 12px 4px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937', letterSpacing: '0.05em' }}>{title}</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{sub}</div>
      </div>
      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={chartKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          style={{ flex: 1, overflow: 'hidden' }}
        >
          {chartKey === 'timeslice' && <TimeslicePanel />}
          {chartKey === 'scatter'   && <ScatterPlot />}
          {chartKey === 'angular'   && <AngularGauge />}
          {chartKey === 'cylinder'  && <CylinderChart />}
          {chartKey === 'linear'    && <LinearGauge />}
          {chartKey === 'pie'       && <PieChart />}
          {chartKey === 'radar'     && <RadarChart />}
          {chartKey === 'thermo'    && <Thermometer />}
          {chartKey === 'treemap'   && <TreeMap />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Main component ─── */
export function WebPonentChartDemo({ onBack }: { onBack: () => void }) {
  const [activeChart, setActiveChart] = useState<ChartKey>('timeslice');
  const [hovered, setHovered] = useState<ChartKey | null>(null);

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
        onClick={onBack}
        className="absolute top-8 left-8 z-20 flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none"
      >
        <span className="text-base leading-none text-black/20 group-hover:text-black transition-colors duration-200">‹</span>
        <span className="text-[0.58rem] tracking-[0.28em] text-black/25 group-hover:text-black transition-colors duration-200 uppercase">뒤로가기</span>
      </motion.button>

      {/* Title section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
        className="flex flex-col items-center gap-1 pt-16 pb-3 shrink-0"
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">사이버이메지네이션</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">webPonent 차트 라이브러리</h2>
      </motion.div>

      {/* Monitor shell */}
      <div className="flex-1 flex items-center justify-center" style={{ paddingBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Bezel */}
          <div style={{
            background: '#2c2c2e',
            borderRadius: 10,
            padding: 6,
            boxShadow: '0 6px 24px rgba(0,0,0,0.28)',
            width: 612,
          }}>
            {/* App window */}
            <div style={{ width: 600, overflow: 'hidden', borderRadius: 5 }}>
              {/* Header bar */}
              <div style={{
                background: '#1a1a2e',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                {/* Traffic lights */}
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#e53e3e' }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ed8936' }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#48bb78' }} />
                <span style={{ color: '#fff', fontSize: 10, marginLeft: 6, fontFamily: 'sans-serif', letterSpacing: '0.04em' }}>
                  webPonent® Publisher
                </span>
              </div>

              {/* Body: sidebar + content */}
              <div style={{ display: 'flex', flexDirection: 'row', height: 270 }}>
                {/* Sidebar */}
                <div style={{ width: 155, background: '#232336', display: 'flex', flexDirection: 'column', padding: '8px 0', flexShrink: 0 }}>
                  <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', padding: '0 12px 6px', letterSpacing: '0.12em' }}>
                    SAMPLE FILES
                  </div>
                  {MENU_ITEMS.map((item) => {
                    const isActive = activeChart === item.key;
                    const isHov = hovered === item.key;
                    return (
                      <div
                        key={item.key}
                        onClick={() => setActiveChart(item.key)}
                        onMouseEnter={() => setHovered(item.key)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          fontSize: 8,
                          padding: '5px 12px',
                          cursor: 'pointer',
                          background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                          color: isActive ? '#fff' : isHov ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
                          transition: 'color 0.15s, background 0.15s',
                          letterSpacing: '0.03em',
                          userSelect: 'none',
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>

                {/* Content area */}
                <ChartContent chartKey={activeChart} />
              </div>
            </div>
          </div>

          {/* Monitor stand stem */}
          <div style={{ width: 20, height: 10, background: '#3a3a3c' }} />
          {/* Monitor stand base */}
          <div style={{ width: 80, height: 6, background: '#3a3a3c', borderRadius: '0 0 6px 6px' }} />
        </motion.div>
      </div>
    </div>
  );
}
