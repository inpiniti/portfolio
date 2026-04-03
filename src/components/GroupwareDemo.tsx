'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'home' | 'employee' | 'leave' | 'product' | 'customer';

const employees = [
  { name: '김민준', dept: '개발팀', level: '과장', avatar: '👨‍💻' },
  { name: '이서연', dept: '디자인팀', level: '대리', avatar: '👩‍🎨' },
  { name: '박준혁', dept: '영업팀', level: '사원', avatar: '👨‍💼' },
  { name: '최지원', dept: '개발팀', level: '주임', avatar: '👩‍💻' },
  { name: '정유진', dept: '인사팀', level: '부장', avatar: '👩‍💼' },
  { name: '한도영', dept: '기획팀', level: '차장', avatar: '👨‍💼' },
];

const leaveRequests = [
  { name: '김민준', type: '연차', dates: '04.05~04.07', status: '승인' },
  { name: '이서연', type: '반차', dates: '04.10 오전', status: '대기' },
  { name: '박준혁', type: '연차', dates: '04.15~04.16', status: '승인' },
  { name: '최지원', type: '병가', dates: '03.20~03.28', status: '완료' },
];

const products = [
  { name: '가스 밸브 A형', code: 'GV-001', stock: 142 },
  { name: '압력 계량기', code: 'PM-003', stock: 38 },
  { name: '배관 커넥터', code: 'PC-012', stock: 520 },
  { name: '안전 차단기', code: 'SB-007', stock: 15 },
];

const customers = [
  { name: '서울가스㈜', type: '법인', contact: '02-1234-5678' },
  { name: '한강에너지', type: '법인', contact: '02-2345-6789' },
  { name: '홍길동', type: '개인', contact: '010-1234-5678' },
  { name: '부산가스㈜', type: '법인', contact: '051-345-6789' },
];

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: '홈', icon: '🏠' },
  { id: 'employee', label: '사원', icon: '👥' },
  { id: 'leave', label: '휴가', icon: '🌴' },
  { id: 'product', label: '제품', icon: '📦' },
  { id: 'customer', label: '고객', icon: '🧑' },
];

function statusColor(status: string): string {
  if (status === '승인') return '#2e7d32';
  if (status === '대기') return '#e65100';
  return '#757575';
}

function statusBg(status: string): string {
  if (status === '승인') return 'rgba(46,125,50,0.12)';
  if (status === '대기') return 'rgba(230,81,0,0.12)';
  return 'rgba(117,117,117,0.12)';
}

export function GroupwareDemo({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('home');

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
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">사이버이메지네이션</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">사내 그룹웨어</h2>
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
            {/* Phone shell */}
            <div style={{
              width: 240,
              height: 420,
              background: '#1a1a1a',
              borderRadius: 20,
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Phone screen */}
              <div style={{
                flex: 1,
                background: '#fff',
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Top app bar */}
                <div style={{
                  background: '#1565c0',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 9, color: '#fff', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {tabs.find(t => t.id === activeTab)?.label === '홈' ? '그룹웨어' :
                     tabs.find(t => t.id === activeTab)?.label === '사원' ? '사원 관리' :
                     tabs.find(t => t.id === activeTab)?.label === '휴가' ? '휴가 관리' :
                     tabs.find(t => t.id === activeTab)?.label === '제품' ? '제품 관리' : '고객 관리'}
                  </span>
                </div>

                {/* Content area */}
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18 }}
                      style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: '#fff' }}
                    >
                      {activeTab === 'home' && (
                        <div style={{ padding: '10px 10px 0' }}>
                          <p style={{ fontSize: 9, color: '#1565c0', fontWeight: 600, marginBottom: 8 }}>안녕하세요, 정영균님 👋</p>
                          {/* 2x2 stat grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
                            {[
                              { label: '전체 직원', value: '24명', icon: '👥', color: '#1565c0' },
                              { label: '오늘 휴가', value: '2명', icon: '🌴', color: '#2e7d32' },
                              { label: '제품종류', value: '48종', icon: '📦', color: '#6a1b9a' },
                              { label: '고객사', value: '12개', icon: '🏢', color: '#e65100' },
                            ].map((stat) => (
                              <div key={stat.label} style={{
                                background: '#f5f7ff',
                                borderRadius: 6,
                                padding: '7px 8px',
                                borderLeft: `2px solid ${stat.color}`,
                              }}>
                                <div style={{ fontSize: 13, marginBottom: 2 }}>{stat.icon}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: 6.5, color: '#888', marginTop: 1 }}>{stat.label}</div>
                              </div>
                            ))}
                          </div>
                          {/* Notices */}
                          <div style={{ marginBottom: 8 }}>
                            <p style={{ fontSize: 7.5, fontWeight: 700, color: '#333', marginBottom: 5, letterSpacing: '0.05em' }}>공지사항</p>
                            {[
                              { title: '2분기 워크숍 일정 안내', date: '04.01', dot: '#1565c0' },
                              { title: '보안 패치 업데이트 공지', date: '03.30', dot: '#e65100' },
                              { title: '연차 신청 마감 안내', date: '03.28', dot: '#2e7d32' },
                            ].map((notice) => (
                              <div key={notice.title} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 5,
                                padding: '4px 0',
                                borderBottom: '1px solid #f0f0f0',
                              }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: notice.dot, marginTop: 2, flexShrink: 0 }} />
                                <span style={{ fontSize: 7, color: '#444', flex: 1, lineHeight: 1.4 }}>{notice.title}</span>
                                <span style={{ fontSize: 6, color: '#aaa', flexShrink: 0 }}>{notice.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'employee' && (
                        <div>
                          {/* Search bar */}
                          <div style={{ padding: '8px 10px 4px' }}>
                            <div style={{
                              background: '#f5f5f5',
                              borderRadius: 10,
                              padding: '4px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}>
                              <span style={{ fontSize: 8 }}>🔍</span>
                              <span style={{ fontSize: 7, color: '#bbb' }}>사원 검색...</span>
                            </div>
                          </div>
                          {employees.map((emp) => (
                            <div key={emp.name} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                              padding: '6px 10px',
                              borderBottom: '1px solid #f5f5f5',
                            }}>
                              <span style={{ fontSize: 14, flexShrink: 0 }}>{emp.avatar}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 8, fontWeight: 600, color: '#333' }}>{emp.name}</div>
                                <div style={{ fontSize: 6.5, color: '#888' }}>{emp.dept} · {emp.level}</div>
                              </div>
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4caf50', flexShrink: 0 }} />
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'leave' && (
                        <div style={{ padding: '8px 10px', position: 'relative' }}>
                          <p style={{ fontSize: 7.5, fontWeight: 700, color: '#333', marginBottom: 6 }}>휴가 신청 현황</p>
                          {leaveRequests.map((req) => (
                            <div key={`${req.name}-${req.dates}`} style={{
                              background: '#fafafa',
                              borderRadius: 6,
                              padding: '6px 8px',
                              marginBottom: 5,
                              border: '1px solid #f0f0f0',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                <span style={{ fontSize: 8, fontWeight: 600, color: '#333' }}>{req.name}</span>
                                <span style={{
                                  fontSize: 6,
                                  padding: '1px 5px',
                                  borderRadius: 8,
                                  color: statusColor(req.status),
                                  background: statusBg(req.status),
                                  fontWeight: 600,
                                }}>{req.status}</span>
                              </div>
                              <div style={{ fontSize: 6.5, color: '#888' }}>
                                {req.type} &nbsp;·&nbsp; {req.dates}
                              </div>
                            </div>
                          ))}
                          {/* FAB */}
                          <div style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: '#1565c0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(21,101,192,0.4)',
                            cursor: 'pointer',
                          }}>
                            <span style={{ fontSize: 13, color: '#fff', lineHeight: 1 }}>+</span>
                          </div>
                        </div>
                      )}

                      {activeTab === 'product' && (
                        <div style={{ padding: '8px 10px' }}>
                          <p style={{ fontSize: 7.5, fontWeight: 700, color: '#333', marginBottom: 6 }}>제품 재고 현황</p>
                          {products.map((prod) => (
                            <div key={prod.code} style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '5px 0',
                              borderBottom: '1px solid #f5f5f5',
                              gap: 6,
                            }}>
                              <span style={{ fontSize: 11 }}>📦</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 7.5, fontWeight: 600, color: '#333' }}>{prod.name}</div>
                                <div style={{ fontSize: 6, color: '#aaa' }}>{prod.code}</div>
                              </div>
                              <div style={{
                                fontSize: 7.5,
                                fontWeight: 700,
                                color: prod.stock < 20 ? '#c62828' : '#333',
                                background: prod.stock < 20 ? 'rgba(198,40,40,0.08)' : 'transparent',
                                padding: prod.stock < 20 ? '1px 4px' : undefined,
                                borderRadius: 4,
                              }}>
                                {prod.stock}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'customer' && (
                        <div style={{ padding: '8px 10px' }}>
                          <p style={{ fontSize: 7.5, fontWeight: 700, color: '#333', marginBottom: 6 }}>고객 목록</p>
                          {customers.map((cust) => (
                            <div key={cust.name} style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '6px 0',
                              borderBottom: '1px solid #f5f5f5',
                              gap: 6,
                            }}>
                              <div style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: cust.type === '법인' ? 'rgba(21,101,192,0.12)' : 'rgba(46,125,50,0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                flexShrink: 0,
                              }}>
                                {cust.type === '법인' ? '🏢' : '👤'}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 7.5, fontWeight: 600, color: '#333' }}>{cust.name}</div>
                                <div style={{ fontSize: 6, color: '#aaa' }}>{cust.contact}</div>
                              </div>
                              <span style={{
                                fontSize: 6,
                                padding: '1px 4px',
                                borderRadius: 6,
                                background: cust.type === '법인' ? 'rgba(21,101,192,0.1)' : 'rgba(46,125,50,0.1)',
                                color: cust.type === '법인' ? '#1565c0' : '#2e7d32',
                                fontWeight: 600,
                              }}>{cust.type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom navigation */}
                <div style={{
                  height: 50,
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  background: '#fff',
                  flexShrink: 0,
                  padding: '0 2px',
                }}>
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          padding: '2px 0',
                        }}
                      >
                        <div style={{
                          padding: '2px 8px',
                          borderRadius: 10,
                          background: isActive ? 'rgba(21,101,192,0.15)' : 'transparent',
                          transition: 'background 0.2s',
                        }}>
                          <span style={{ fontSize: 10, lineHeight: 1 }}>{tab.icon}</span>
                        </div>
                        <span style={{
                          fontSize: 6.5,
                          color: isActive ? '#1565c0' : '#9e9e9e',
                          fontWeight: isActive ? 600 : 400,
                          letterSpacing: '0.02em',
                        }}>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
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
