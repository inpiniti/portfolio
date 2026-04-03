'use client';

import { motion } from 'motion/react';

export function KrxSiteDemo({ onBack }: { onBack: () => void }) {
  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      <motion.button
        initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.08, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
        onClick={onBack}
        className="absolute top-8 left-8 z-20 flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none"
      >
        <span className="text-base leading-none text-black/20 group-hover:text-black transition-colors duration-200">‹</span>
        <span className="text-[0.58rem] tracking-[0.28em] text-black/25 group-hover:text-black transition-colors duration-200 uppercase">뒤로가기</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
        className="flex flex-col items-center gap-1 pt-16 pb-3 shrink-0"
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">사이버이메지네이션</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">KRX 홈페이지</h2>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center" style={{ paddingBottom: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          {/* Monitor bezel */}
          <div style={{ background: '#2c2c2e', borderRadius: 10, padding: 6, boxShadow: '0 6px 24px rgba(0,0,0,0.28)' }}>
            <div style={{ width: 620, height: 370, background: '#f2f2f2', borderRadius: 5, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Browser title bar */}
              <div style={{ background: '#f2f2f2', borderBottom: '1px solid #ddd', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
                <div style={{ flex: 1, margin: '0 8px', background: '#fff', border: '1px solid #ddd', borderRadius: 4, padding: '2px 8px', fontSize: 8, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.05em' }}>
                  https://www.krx.co.kr
                </div>
              </div>

              {/* Mock KRX site content */}
              <div style={{ flex: 1, background: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* KRX nav */}
                <div style={{ background: '#003087', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 32, flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>KRX 한국거래소</span>
                  <div style={{ display: 'flex', gap: 14 }}>
                    {['시장정보','상장','공시','파생상품','거래소소개'].map(t => (
                      <span key={t} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 7.5 }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Hero banner */}
                <div style={{ background: 'linear-gradient(135deg, #002472 0%, #0050c8 100%)', padding: '14px 20px', flexShrink: 0 }}>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 7, letterSpacing: '0.25em', marginBottom: 3 }}>KOREA EXCHANGE</p>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>신뢰와 혁신의 자본시장</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['주식시장','파생상품','채권시장'].map(t => (
                      <span key={t} style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', fontSize: 7, padding: '2px 8px', borderRadius: 3 }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Index ticker */}
                <div style={{ background: '#f7f9fc', borderBottom: '1px solid #e8eef5', padding: '6px 16px', display: 'flex', gap: 16, flexShrink: 0 }}>
                  {[
                    { name:'KOSPI',   val:'2,640.32', chg:'+12.45 (+0.47%)', up:true },
                    { name:'KOSDAQ',  val:'867.21',   chg:'+3.18 (+0.37%)',  up:true },
                    { name:'KRX100',  val:'5,312.07', chg:'-8.92 (-0.17%)',  up:false },
                    { name:'KRX300',  val:'1,824.55', chg:'+4.23 (+0.23%)',  up:true },
                  ].map(idx => (
                    <div key={idx.name} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                      <span style={{ fontSize: 7, color: 'rgba(0,0,0,0.4)', minWidth: 40 }}>{idx.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#111' }}>{idx.val}</span>
                      <span style={{ fontSize: 7, color: idx.up ? '#e53e3e' : '#3182ce' }}>{idx.chg}</span>
                    </div>
                  ))}
                </div>

                {/* Main content grid */}
                <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
                  {/* Left: notice */}
                  <div style={{ flex: 1, padding: '10px 16px', borderRight: '1px solid #f0f0f0', overflow: 'hidden' }}>
                    <p style={{ fontSize: 8, fontWeight: 600, color: 'rgba(0,0,0,0.6)', marginBottom: 7, letterSpacing: '0.1em', borderBottom: '1.5px solid #003087', paddingBottom: 5 }}>공지사항</p>
                    {[
                      { date:'2024.12.20', title:'2024년 결산 배당 지급 일정 안내' },
                      { date:'2024.12.15', title:'ESG 공시 강화 관련 상장법인 안내' },
                      { date:'2024.12.10', title:'KRX 파생상품 거래 시간 변경 안내' },
                      { date:'2024.12.05', title:'2025년 휴장일 안내' },
                      { date:'2024.12.01', title:'코스피200 구성종목 변경 안내' },
                    ].map((n, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 5, borderBottom: '1px solid #f5f5f5', marginBottom: 5 }}>
                        <span style={{ fontSize: 6.5, color: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>{n.date}</span>
                        <span style={{ fontSize: 7.5, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Right: quick links */}
                  <div style={{ width: 160, padding: '10px 14px', overflow: 'hidden', flexShrink: 0 }}>
                    <p style={{ fontSize: 8, fontWeight: 600, color: 'rgba(0,0,0,0.6)', marginBottom: 7, letterSpacing: '0.1em', borderBottom: '1.5px solid #003087', paddingBottom: 5 }}>바로가기</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                      {['시세조회','종목정보','공시검색','통계데이터','투자자별','기업분석'].map(t => (
                        <div key={t} style={{ background: '#f7f9fc', border: '1px solid #e8eef5', borderRadius: 5, padding: '5px 0', textAlign: 'center' }}>
                          <span style={{ fontSize: 7, color: 'rgba(0,40,120,0.6)' }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ width: 20, height: 10, background: '#3a3a3c' }} />
          <div style={{ width: 80, height: 6, background: '#3a3a3c', borderRadius: '0 0 6px 6px' }} />
        </motion.div>

        <p style={{ marginTop: 12, fontSize: 9, color: 'rgba(0,0,0,0.2)', letterSpacing: '0.2em' }}>
          한국거래소 공식 홈페이지 운영 · 무중단 배포 · Scouter APM
        </p>
      </div>
    </div>
  );
}
