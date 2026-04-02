'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Data ───────────────────────────────────────────── */
const BOOK_LIST = [
  { id: 'b0',  title: '바이브코딩' },
  { id: 'b1',  title: '인공지능 딥러닝 직접 코딩하기 with 라즈베리파이 피코' },
  { id: 'b2',  title: '어쨌든 바이브 코딩' },
  { id: 'b3',  title: '클로드 코드를 활용한 바이브 코딩 완벽입문' },
  { id: 'b4',  title: '혼자 공부하는 바이브 코딩 with 클로드 코드' },
  { id: 'b5',  title: '안티그래비티 바이브 코딩' },
  { id: 'b6',  title: '안티그래비티 완벽 가이드' },
  { id: 'b7',  title: '클로드 코드 완벽 가이드' },
  { id: 'b8',  title: '출퇴근길에 읽고 퇴근길에 완성하는 바이브 코딩' },
  { id: 'b9',  title: '코딩' },
  { id: 'b10', title: '인문코딩' },
];

const SPINE_COLORS = [
  '#c8a8a8','#a8b8c8','#a8c8b0','#c8c0a8',
  '#b8a8c8','#c8c8a8','#a8b0c8','#c8b0a8',
  '#b0c8a8','#a8c8c8','#c8a8b8','#b8c8a8',
];

type BookStatus = 'shelf' | 'rented';

interface Book {
  id: string;
  title: string;
  color: string;
  status: BookStatus;
}

type ApiFlow = 'idle' | 'fetching' | 'flowing' | 'landing';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/* ─── Shelf Panel ────────────────────────────────────── */
function ShelfPanel({
  books,
  blinkSet,
}: {
  books: Book[];
  blinkSet: Set<string>;
}) {
  const rows: Book[][] = [];
  for (let i = 0; i < 3; i++) rows.push(books.slice(i * 4, i * 4 + 4));

  return (
    <div className="flex flex-col" style={{ width: 110, flexShrink: 0, alignSelf: 'center' }}>
      <p className="text-[0.38rem] tracking-[0.35em] text-black/25 uppercase mb-2 shrink-0 text-center">
        서재
      </p>
      {/* Bookcase outer frame */}
      <div
        style={{
          background: '#c4935a',
          borderRadius: 7,
          padding: '5px 5px 6px',
          border: '1.5px solid #a87040',
          boxShadow: '0 3px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {/* Inner wall */}
        <div
          style={{
            background: '#f7ede0',
            borderRadius: 3,
            padding: '5px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {rows.map((row, ri) => (
            <div key={ri} style={{ position: 'relative', paddingBottom: 5 }}>
              {/* Wooden shelf board */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: -3,
                  right: -3,
                  height: 5,
                  background: 'linear-gradient(180deg, #c4935a 0%, #a87040 100%)',
                  borderRadius: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 2,
                  minHeight: 34,
                }}
              >
                <AnimatePresence>
                  {row.map((book) => (
                    <BlinkingSpine
                      key={book.id}
                      color={book.color}
                      isBlinking={blinkSet.has(book.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlinkingSpine({
  color,
  isBlinking,
}: {
  color: string;
  isBlinking: boolean;
}) {
  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{
        scaleY: 1,
        opacity: isBlinking ? [1, 0, 1, 0, 1, 0, 1] : 1,
      }}
      exit={{ scaleY: 0, opacity: 0, transition: { duration: 0.25 } }}
      transition={{
        scaleY: { duration: 0.3 },
        opacity: isBlinking
          ? { duration: 1.1, times: [0, 0.14, 0.28, 0.43, 0.57, 0.72, 1], ease: 'linear' }
          : { duration: 0.15 },
      }}
      style={{
        width: 11,
        height: 32,
        backgroundColor: color,
        borderRadius: '2px 2px 0 0',
        transformOrigin: 'bottom',
        flexShrink: 0,
        boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.08)',
      }}
    />
  );
}

/* ─── Desktop Panel ──────────────────────────────────── */
function DesktopPanel({
  apiFlow,
  canAdd,
  onAdd,
}: {
  apiFlow: ApiFlow;
  canAdd: boolean;
  onAdd: () => void;
}) {
  const isActive = apiFlow === 'fetching' || apiFlow === 'flowing';

  return (
    <div
      className="flex flex-col items-center"
      style={{ width: 220, flexShrink: 0 }}
    >
      <p className="text-[0.38rem] tracking-[0.35em] text-black/25 uppercase mb-2 shrink-0 text-center">
        데스크탑 화면
      </p>

      {/* Naver API — external, above monitor */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 4 }}>
        <motion.div
          animate={
            isActive
              ? { scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(66,153,225,0)', '0 0 0 5px rgba(66,153,225,0.2)', '0 0 0 0 rgba(66,153,225,0)'] }
              : {}
          }
          transition={{ duration: 0.7, repeat: isActive ? Infinity : 0 }}
          style={{
            padding: '3px 10px',
            border: '1px solid rgba(66,153,225,0.45)',
            borderRadius: 20,
            background: 'rgba(235,245,255,0.9)',
            fontSize: 7,
            color: 'rgba(30,80,160,0.6)',
            letterSpacing: '0.12em',
            boxShadow: '0 1px 4px rgba(66,153,225,0.15)',
          }}
        >
          네이버 API
        </motion.div>
        {/* Arrow down to monitor */}
        <div style={{ width: 1, height: 10, background: 'rgba(0,0,0,0.12)', position: 'relative', overflow: 'visible' }}>
          <AnimatePresence>
            {isActive && (
              <motion.div
                key="api-dot"
                initial={{ top: 0, opacity: 0 }}
                animate={{ top: '100%', opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'linear', repeat: Infinity }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#63b3ed',
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Monitor body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Bezel */}
        <div
          style={{
            background: '#2c2c2e',
            borderRadius: 8,
            padding: 5,
            width: '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          {/* Screen */}
          <div
            style={{
              background: '#fff',
              borderRadius: 4,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* macOS-style title bar */}
            <div
              style={{
                background: '#f2f2f2',
                borderBottom: '1px solid #ddd',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#28c840' }} />
              <span style={{ fontSize: 6.5, color: 'rgba(0,0,0,0.38)', letterSpacing: '0.2em', marginLeft: 4 }}>
                북카페 관리자
              </span>
            </div>

            {/* App content */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                gap: 6,
                position: 'relative',
              }}
            >
              {/* 책추가 button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onAdd}
                disabled={!canAdd || apiFlow !== 'idle'}
                style={{
                  padding: '5px 16px',
                  fontSize: 8,
                  letterSpacing: '0.18em',
                  background: apiFlow !== 'idle' ? 'rgba(66,153,225,0.1)' : 'white',
                  border: `1px solid ${apiFlow !== 'idle' ? 'rgba(66,153,225,0.4)' : 'rgba(0,0,0,0.15)'}`,
                  borderRadius: 6,
                  color: canAdd ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.25)',
                  cursor: canAdd && apiFlow === 'idle' ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {!canAdd ? '추가 완료' : apiFlow !== 'idle' ? '추가 중…' : '책 추가'}
              </motion.button>

              <div style={{ width: 1, height: 8, background: 'rgba(0,0,0,0.1)' }} />

              {/* 관리자 node */}
              <div
                style={{
                  padding: '3px 12px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 4,
                  background: 'rgba(0,0,0,0.025)',
                  fontSize: 7,
                  color: 'rgba(0,0,0,0.35)',
                  letterSpacing: '0.12em',
                }}
              >
                관리자
              </div>

              {/* flowing dot: desktop → shelf */}
              <AnimatePresence>
                {apiFlow === 'flowing' && (
                  <motion.div
                    key="flow-dot"
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                    animate={{ x: -160, y: 10, opacity: [0, 1, 1, 0], scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#63b3ed',
                      zIndex: 10,
                      top: '44%',
                      left: '45%',
                    }}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {apiFlow === 'landing' && (
                  <motion.div
                    key="land"
                    initial={{ x: -160, opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.8, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      position: 'absolute',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#90cdf4',
                      zIndex: 10,
                      top: '44%',
                      left: '45%',
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Monitor neck */}
        <div
          style={{
            width: 16,
            height: 7,
            background: '#3a3a3c',
          }}
        />
        {/* Monitor stand */}
        <div
          style={{
            width: 44,
            height: 5,
            background: '#3a3a3c',
            borderRadius: '0 0 5px 5px',
          }}
        />
      </div>
    </div>
  );
}

/* ─── App Panel ──────────────────────────────────────── */
function AppPanel({
  books,
  activeTab,
  onTabChange,
  onRent,
  onReturn,
  loadingId,
}: {
  books: Book[];
  activeTab: 'list' | 'my';
  onTabChange: (t: 'list' | 'my') => void;
  onRent: (id: string) => void;
  onReturn: (id: string) => void;
  loadingId: string | null;
}) {
  const listBooks = books.filter((b) => b.status === 'shelf');
  const myBooks = books.filter((b) => b.status === 'rented');
  const displayed = activeTab === 'list' ? listBooks : myBooks;

  return (
    <div className="flex flex-col items-center" style={{ width: 145, flexShrink: 0 }}>
      <p className="text-[0.38rem] tracking-[0.35em] text-black/25 uppercase mb-2 shrink-0 text-center">
        앱
      </p>
      {/* Phone shell */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 100%)',
          borderRadius: 22,
          padding: '8px 5px 10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          boxShadow: '0 6px 24px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.1)',
          gap: 4,
        }}
      >
        {/* Notch (Dynamic Island style) */}
        <div
          style={{
            width: 28,
            height: 6,
            background: '#000',
            borderRadius: 8,
          }}
        />

        {/* Screen */}
        <div
          style={{
            flex: 1,
            background: '#fff',
            borderRadius: 10,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Status bar */}
          <div
            style={{
              background: 'rgba(0,0,0,0.03)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              padding: '4px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 6, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.1em' }}>9:41</span>
            <span style={{ fontSize: 6, color: 'rgba(0,0,0,0.3)' }}>●●●</span>
          </div>

          {/* Book list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            <AnimatePresence>
              {displayed.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    padding: '4px 8px',
                    gap: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: 6,
                        height: 18,
                        backgroundColor: book.color,
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 7,
                        color: 'rgba(0,0,0,0.55)',
                        letterSpacing: '0.05em',
                        lineHeight: 1.3,
                        maxWidth: 70,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {book.title}
                    </span>
                  </div>
                  <RentButton
                    isRented={book.status === 'rented'}
                    isLoading={loadingId === book.id}
                    onRent={() => onRent(book.id)}
                    onReturn={() => onReturn(book.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {displayed.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48 }}>
                <span style={{ fontSize: 7, color: 'rgba(0,0,0,0.2)', letterSpacing: '0.2em' }}>
                  {activeTab === 'list' ? '도서 없음' : '대여 없음'}
                </span>
              </div>
            )}
          </div>

          {/* Bottom tab bar */}
          <div
            style={{
              borderTop: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              padding: '4px 0',
              flexShrink: 0,
            }}
          >
            {(['list', 'my'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  paddingTop: 3,
                  paddingBottom: 3,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: activeTab === tab ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.22)',
                  transition: 'color 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 9 }}>{tab === 'list' ? '☰' : '♡'}</span>
                <span style={{ fontSize: 6, letterSpacing: '0.12em' }}>
                  {tab === 'list' ? '목록' : 'MY'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Home button */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
      </div>
    </div>
  );
}

function RentButton({
  isRented,
  isLoading,
  onRent,
  onReturn,
}: {
  isRented: boolean;
  isLoading: boolean;
  onRent: () => void;
  onReturn: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={isRented ? onReturn : onRent}
      disabled={isLoading}
      style={{
        flexShrink: 0,
        minWidth: 28,
        padding: '2px 5px',
        fontSize: 6.5,
        letterSpacing: '0.1em',
        border: `1px solid ${isRented ? 'rgba(200,80,80,0.35)' : 'rgba(0,0,0,0.15)'}`,
        background: isRented ? 'rgba(200,80,80,0.06)' : 'rgba(0,0,0,0.03)',
        color: isRented ? 'rgba(180,60,60,0.8)' : 'rgba(0,0,0,0.45)',
        cursor: isLoading ? 'default' : 'pointer',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
      }}
    >
      {isLoading ? <Spinner /> : isRented ? '반납' : '대여'}
    </motion.button>
  );
}

function Spinner() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
      style={{ display: 'inline-block', fontSize: 8, lineHeight: 1 }}
    >
      ◌
    </motion.span>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export function BookCafeDemo({ onBack }: { onBack: () => void }) {
  const [books, setBooks] = useState<Book[]>(
    BOOK_LIST.slice(0, 5).map((b, i) => ({
      ...b,
      color: SPINE_COLORS[i % SPINE_COLORS.length],
      status: 'shelf' as BookStatus,
    })),
  );
  const [nextIdx, setNextIdx] = useState(5);
  const [apiFlow, setApiFlow] = useState<ApiFlow>('idle');
  const [blinkSet, setBlinkSet] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'my'>('list');
  const busyRef = useRef(false);

  const shelfBooks = books.filter((b) => b.status === 'shelf');

  const handleAddBook = useCallback(async () => {
    if (busyRef.current || apiFlow !== 'idle' || nextIdx >= BOOK_LIST.length) return;
    busyRef.current = true;

    setApiFlow('fetching');
    await sleep(700);

    setApiFlow('flowing');
    await sleep(650);

    setApiFlow('landing');
    await sleep(400);

    const { id, title } = BOOK_LIST[nextIdx];
    const newBook: Book = {
      id,
      title,
      color: SPINE_COLORS[nextIdx % SPINE_COLORS.length],
      status: 'shelf',
    };
    setBooks((prev) => [...prev, newBook]);
    setNextIdx((n) => n + 1);

    await sleep(200);
    setApiFlow('idle');
    busyRef.current = false;
  }, [apiFlow, nextIdx]);

  const handleRent = useCallback(async (bookId: string) => {
    if (loadingId) return;
    setLoadingId(bookId);

    for (let i = 0; i < 3; i++) {
      setBlinkSet((s) => new Set([...s, bookId]));
      await sleep(190);
      setBlinkSet((s) => { const n = new Set(s); n.delete(bookId); return n; });
      await sleep(190);
    }
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, status: 'rented' } : b)),
    );
    await sleep(600);
    setLoadingId(null);
  }, [loadingId]);

  const handleReturn = useCallback(async (bookId: string) => {
    if (loadingId) return;
    setLoadingId(bookId);

    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, status: 'shelf' } : b)),
    );
    await sleep(100);
    for (let i = 0; i < 3; i++) {
      setBlinkSet((s) => new Set([...s, bookId]));
      await sleep(190);
      setBlinkSet((s) => { const n = new Set(s); n.delete(bookId); return n; });
      await sleep(190);
    }
    await sleep(500);
    setLoadingId(null);
  }, [loadingId]);

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden">
      {/* BackButton — absolute top-left, 다른 화면들과 동일 */}
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

      {/* Title — 다른 화면들과 동일한 패턴 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
        className="flex flex-col items-center gap-1 pt-16 pb-3 shrink-0"
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">동서발전소</p>
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">북카페</h2>
      </motion.div>

      {/* 3-panel — 간격만 뷰포트에 따라 벌어짐 */}
      <div className="flex-1 flex items-center justify-center" style={{ padding: '0 32px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(24px, 4vw, 72px)', height: 290 }}>
        <ShelfPanel books={shelfBooks} blinkSet={blinkSet} />
        <DesktopPanel
          apiFlow={apiFlow}
          canAdd={nextIdx < BOOK_LIST.length}
          onAdd={handleAddBook}
        />
        <AppPanel
          books={books}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRent={handleRent}
          onReturn={handleReturn}
          loadingId={loadingId}
        />
      </div>
      </div>
    </div>
  );
}
