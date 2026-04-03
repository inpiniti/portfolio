'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ScheduleScreen } from '@/components/ScheduleScreen';
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';

const RobotWalking = dynamic(
  () => import('@/components/RobotWalking').then((m) => m.RobotWalking),
  { ssr: false, loading: () => <div className="w-full h-full" /> },
);

const DrumCarousel = dynamic(
  () => import('@/components/DrumCarousel').then((m) => m.DrumCarousel),
  { ssr: false },
);

const BookCafeDemo = dynamic(
  () => import('@/components/BookCafeDemo').then((m) => m.BookCafeDemo),
  { ssr: false },
);

const AutoReportDemo = dynamic(
  () => import('@/components/AutoReportDemo').then((m) => m.AutoReportDemo),
  { ssr: false },
);

const ShootingGameDemo = dynamic(
  () => import('@/components/ShootingGameDemo').then((m) => m.ShootingGameDemo),
  { ssr: false },
);

const JanggiDemo = dynamic(
  () => import('@/components/JanggiDemo').then((m) => m.JanggiDemo),
  { ssr: false },
);

const KrxSiteDemo = dynamic(
  () => import('@/components/KrxSiteDemo').then((m) => m.KrxSiteDemo),
  { ssr: false },
);

const KrxDownloadDemo = dynamic(
  () => import('@/components/KrxDownloadDemo').then((m) => m.KrxDownloadDemo),
  { ssr: false },
);

const MyDataApiDemo = dynamic(
  () => import('@/components/MyDataApiDemo').then((m) => m.MyDataApiDemo),
  { ssr: false },
);

/* ═══════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════ */
type View =
  | 'home'
  | 'career'
  | 'freelance'
  | 'about'
  | 'schedule';

type CompanyKey = 'onware' | 'cyberi' | 'iocode' | 'ecomarine' | 'grm';

/* ═══════════════════════════════════════════════════
   Data
═══════════════════════════════════════════════════ */
const NAV: { id: View; label: string }[] = [
  { id: 'career', label: '경력' },
  { id: 'freelance', label: '외주' },
  { id: 'about', label: '소개' },
  { id: 'schedule', label: '스케줄' },
];

type TNode = {
  id: string;
  label: string;
  sub: string;
  isCompany?: boolean;
  companyKey?: CompanyKey;
  isClickable?: boolean;
};

const CAREER_NODES: TNode[] = [
  { id: 'school', label: '학생', sub: '배정고' },
  { id: 'univ', label: '대학생', sub: '인제대', isClickable: true },
  {
    id: 'onware',
    label: '온웨어',
    sub: '2015 ~ 2017',
    isCompany: true,
    companyKey: 'onware',
  },
  {
    id: 'cyberi',
    label: '사이버이메',
    sub: '2018 ~ 2021',
    isCompany: true,
    companyKey: 'cyberi',
  },
  {
    id: 'iocode',
    label: '아이오코드',
    sub: '2021 ~ 2023',
    isCompany: true,
    companyKey: 'iocode',
  },
  {
    id: 'ecomarine',
    label: '에코마린',
    sub: '2023 ~ 2024',
    isCompany: true,
    companyKey: 'ecomarine',
  },
  {
    id: 'grm',
    label: 'GRM',
    sub: '2024 ~ 현재',
    isCompany: true,
    companyKey: 'grm',
  },
];

type ProjectDoc = { type: 'design' | 'image' | 'other'; label: string };
type Project = {
  id: string;
  label: string;
  dates: string;
  desc: string;
  body?: string;
  mermaidCode?: string;
  documents?: ProjectDoc[];
};
type Company = {
  name: string;
  period: string;
  role: string;
  projects: Project[];
};

const DEFAULT_DOCS: ProjectDoc[] = [
  { type: 'design', label: '설계도' },
  { type: 'image', label: '이미지' },
  { type: 'other', label: '기타문서' },
];

const COMPANIES: Record<CompanyKey, Company> = {
  onware: {
    name: '온웨어',
    period: '2015.02.05 ~ 2017.12.01',
    role: '개발팀 · 정규직',
    projects: [
      {
        id: 'o1',
        label: 'O2O 세탁 서비스',
        dates: '2017.01.01 ~ 2017.11.30',
        desc: 'Android 앱 전담 개발 · Swagger 도입',
        documents: DEFAULT_DOCS,
      },
      {
        id: 'o2',
        label: '동서발전소 북카페',
        dates: '2015.03.01 ~ 2016.08.31',
        desc: 'Full-Stack 1인 개발 · RFID/바코드 제어',
        documents: DEFAULT_DOCS,
      },
    ],
  },
  cyberi: {
    name: '사이버이메지네이션',
    period: '2018.01.02 ~ 2021.07.24',
    role: '개발팀 · 정규직',
    projects: [
      {
        id: 'c1',
        label: '대신증권 마이데이터 API',
        dates: '2021.01.01 ~ 2021.07.24',
        desc: '금융권 표준 OpenAPI 구축',
        documents: DEFAULT_DOCS,
      },
      {
        id: 'c2',
        label: 'KRX 대용량 다운로드',
        dates: '2020.06.01 ~ 2020.07.31',
        desc: 'Electron 전용 클라이언트 · 이어받기',
        documents: DEFAULT_DOCS,
      },
      {
        id: 'c3',
        label: 'KRX 홈페이지 운영',
        dates: '2018.01.02 ~ 2019.12.31',
        desc: '무중단 운영 · Scouter APM',
        documents: DEFAULT_DOCS,
      },
    ],
  },
  iocode: {
    name: '아이오코드',
    period: '2021.08.02 ~ 2023.08.19',
    role: '개발팀 · 정규직',
    projects: [
      {
        id: 'i1',
        label: 'IoT 항만물류 기술개발',
        dates: '2022.09.01 ~ 2023.04.30',
        desc: 'Node.js · Mobius · MQTT 파이프라인',
        documents: DEFAULT_DOCS,
      },
      {
        id: 'i2',
        label: '스마트제조혁신사업',
        dates: '2022.01.01 ~ 2023.08.19',
        desc: 'AAS 기반 디지털 트윈 표준화',
        documents: DEFAULT_DOCS,
      },
      {
        id: 'i3',
        label: 'IPR ENT 프로세스마이닝',
        dates: '2021.08.02 ~ 2021.12.31',
        desc: 'Vue.js · Vuex 플랫폼 고도화',
        documents: DEFAULT_DOCS,
      },
    ],
  },
  ecomarine: {
    name: '에코마린',
    period: '2023.08.21 ~ 2024.11.14',
    role: '개발팀 · 정규직',
    projects: [
      {
        id: 'e1',
        label: 'OceanLook',
        dates: '2023.08.21 ~ 2024.11.14',
        desc: 'Nuxt3 · Leaflet · Self-hosted Tile Server',
        documents: DEFAULT_DOCS,
      },
    ],
  },
  grm: {
    name: 'GRM',
    period: '2024.11.18 ~ 현재',
    role: '운영1팀 · 정규직',
    projects: [
      {
        id: 'g1',
        label: '가스링크 1 · 2차',
        dates: '2024.11.18 ~ 2026.01.27',
        desc: 'React · Zustand · Native-Webview 연동',
        documents: DEFAULT_DOCS,
      },
    ],
  },
};

/* ── Freelance projects ── */
type FreelanceKey = 'silverhug';

type FreelanceItem = {
  key: FreelanceKey;
  label: string;
  period: string;
  tagline: string;
  body: string;
};

const FREELANCE: Record<FreelanceKey, FreelanceItem> = {
  silverhug: {
    key: 'silverhug',
    label: '실버허그',
    period: '2022.12 ~ 2023.01',
    tagline: '노인정 대형 TV 전용 윈도우 앱 · Nextron (Next.js + Electron)',
    body: `개발자 인생에서 처음 했던 외주 작업입니다.

2022년 12월 말에 의뢰를 받아 1월 초에 1차 납품 후, 1월 중후반에 받은 피드백도 즉시 반영해 제출했습니다.

노인정 대형 TV에 현재 일정과 Live 화상 접속 기능을 제공하는 프로그램으로, 기존 웹 환경이 어르신들에게 접근이 어려워 Nextron(Next.js + Electron) 기반 윈도우 앱으로 개발했습니다.

로그인 시 저장된 자격증명으로 자동 로그인 → ipcRenderer/ipcMain IPC 통신으로 쿠키 발급 → cheerio 크롤링으로 일정 데이터 수집 → 강의실 입장 버튼은 renderCell + dangerouslySetInnerHTML로 HTML 그대로 삽입하는 방식으로 구현했습니다.

공통 컴포넌트는 Storybook으로 관리했으나, 시간 압박으로 일부 예시 파일 동기화가 늦어졌습니다. 첫 외주라 기간을 넉넉히 잡았는데, 실제로는 더 빠르게 처리할 수 있었습니다.`,
  },
};

const FREELANCE_LIST: FreelanceKey[] = ['silverhug'];

/* University CS courses */
type Course = { name: string; grade: string };
type CourseGroup = { label: string; courses: Course[] };

const UNIV_COURSES: CourseGroup[] = [
  {
    label: '프로그래밍',
    courses: [
      { name: 'C프로그래밍Ⅰ', grade: 'A+' },
      { name: 'C++프로그래밍', grade: 'A+' },
      { name: 'Java프로그래밍Ⅰ', grade: 'A' },
      { name: '컴퓨터프로그래밍', grade: 'A' },
      { name: 'Linux프로그래밍', grade: 'A' },
      { name: 'Web프로그래밍', grade: 'B' },
      { name: '모바일프로그래밍', grade: 'C+' },
    ],
  },
  {
    label: '자료구조 / 알고리즘',
    courses: [
      { name: '데이터구조', grade: 'A+' },
      { name: '알고리즘', grade: 'A+' },
      { name: '이산구조', grade: 'A' },
      { name: '파일구조론', grade: 'C+' },
    ],
  },
  {
    label: '시스템 / 네트워크',
    courses: [
      { name: '컴퓨터통신및지능형홈네트워킹', grade: 'A+' },
      { name: '네트워크미들웨어실습', grade: 'A+' },
      { name: '네트워크프로그래밍', grade: 'A' },
      { name: '컴퓨터구조', grade: 'B+' },
      { name: '운영체제', grade: 'C' },
    ],
  },
  {
    label: '소프트웨어 공학',
    courses: [
      { name: '종합설계', grade: 'A+' },
      { name: '공학설계입문', grade: 'A+' },
      { name: '프로그래밍언어론', grade: 'B+' },
      { name: '소프트웨어요구분석및설계', grade: 'B' },
      { name: '오토마타및컴파일러', grade: 'B' },
      { name: '소프트웨어공학', grade: 'C+' },
    ],
  },
  {
    label: '데이터베이스 / 보안',
    courses: [
      { name: '데이터베이스', grade: 'A' },
      { name: '정보보안', grade: 'C+' },
    ],
  },
  {
    label: '수학 / 이론',
    courses: [
      { name: '확률및통계', grade: 'A+' },
      { name: '수치해석', grade: 'A' },
      { name: '선형대수학', grade: 'B+' },
      { name: '전산수학', grade: 'B+' },
    ],
  },
];

/* ═══════════════════════════════════════════════════
   NavCard  —  3D tilt + color invert on hover
═══════════════════════════════════════════════════ */
function NavCard({
  item,
  index,
  onClick,
}: {
  item: (typeof NAV)[0];
  index: number;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 350, damping: 22 });
  const springY = useSpring(my, { stiffness: 350, damping: 22 });
  const rotateY = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [14, -14]);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    },
    [mx, my],
  );

  const onLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <div style={{ perspective: '600px' }}>
      <motion.button
        ref={ref}
        initial={{ opacity: 0, y: 48, scale: 0.75 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: 0.25 + index * 0.09,
          duration: 0.65,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.94 }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick}
        className="group flex flex-col items-center gap-3 cursor-pointer select-none focus:outline-none"
      >
        {/* Oval capsule icon */}
        <div className="w-11 h-[3.5rem] rounded-full border border-black/12 bg-white group-hover:bg-black group-hover:border-transparent transition-all duration-300 ease-out flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
          <div className="w-[10px] h-[10px] rounded-full border border-black/18 group-hover:border-white/35 transition-colors duration-300" />
        </div>
        {/* Label */}
        <span className="text-[0.58rem] font-medium tracking-[0.22em] text-black/35 group-hover:text-black transition-colors duration-200 whitespace-nowrap">
          {item.label}
        </span>
      </motion.button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BackButton
═══════════════════════════════════════════════════ */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease: [0.34, 1.2, 0.64, 1] }}
      onClick={onClick}
      className="absolute top-8 left-8 z-20 flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none"
    >
      <span className="text-base leading-none text-black/20 group-hover:text-black transition-colors duration-200">
        ‹
      </span>
      <span className="text-[0.58rem] tracking-[0.28em] text-black/25 group-hover:text-black transition-colors duration-200 uppercase">
        뒤로가기
      </span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════
   TimelineTrack  —  animated line + staggered dots
═══════════════════════════════════════════════════ */
function TimelineTrack({
  nodes,
  onNodeClick,
  startDelay = 0.5,
}: {
  nodes: TNode[];
  onNodeClick?: (node: TNode) => void;
  startDelay?: number;
}) {
  const displayNodes: TNode[] = [
    { id: '_fake_start', label: '', sub: '' },
    ...nodes,
    { id: '_fake_end', label: '', sub: '' },
  ];
  const count = displayNodes.length;
  const pct = (i: number) =>
    count === 1 ? '50%' : `${(i / (count - 1)) * 100}%`;

  return (
    <div
      className="relative w-full max-w-195 mx-auto"
      style={{ height: '130px' }}
    >
      {/* Background guide line */}
      <div className="absolute top-[10px] left-0 right-0 h-px bg-black/6" />

      {/* Animated fill line */}
      <motion.div
        className="absolute top-[10px] left-0 h-px bg-black/20"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{
          delay: startDelay,
          duration: 1.5,
          ease: [0.4, 0, 0.2, 1],
        }}
      />

      {/* Nodes */}
      {displayNodes.map((node, i) => {
        const isFake = node.id.startsWith('_fake');
        const isInteractive = node.isCompany || node.isClickable;
        return (
          <div
            key={node.id}
            className={[
              'absolute flex flex-col items-center group',
              isInteractive ? 'cursor-pointer' : '',
            ].join(' ')}
            style={{ left: pct(i), transform: 'translateX(-50%)', top: 0 }}
            onClick={() => isInteractive && onNodeClick?.(node)}
          >
            {!isFake && (
              <>
                {/* Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: startDelay + 0.6 + i * 0.13,
                    type: 'spring',
                    stiffness: 520,
                    damping: 18,
                  }}
                  className={[
                    'rounded-full transition-all duration-200',
                    node.isCompany
                      ? 'w-2.25 h-2.25 bg-black group-hover:scale-[1.7] group-hover:ring-4 group-hover:ring-black/8'
                      : node.isClickable
                        ? 'w-1.5 h-1.5 bg-black/40 group-hover:scale-[1.6] group-hover:bg-black/75'
                        : 'w-1.5 h-1.5 bg-black/25',
                  ].join(' ')}
                />

                {/* Pulse ring on company dots */}
                {node.isCompany && (
                  <motion.div
                    className="absolute top-0 w-2.25 h-2.25 rounded-full border border-black/20 pointer-events-none"
                    animate={{ scale: [1, 2.2, 2.2], opacity: [0.5, 0, 0] }}
                    transition={{
                      delay: startDelay + 1.5 + i * 0.15,
                      duration: 1.8,
                      repeat: Infinity,
                      repeatDelay: 1.2,
                      ease: 'easeOut',
                    }}
                  />
                )}

                {/* Subtle pulse ring on clickable (non-company) dots */}
                {node.isClickable && !node.isCompany && (
                  <motion.div
                    className="absolute top-0 w-1.5 h-1.5 rounded-full border border-black/15 pointer-events-none"
                    animate={{ scale: [1, 2.0, 2.0], opacity: [0.4, 0, 0] }}
                    transition={{
                      delay: startDelay + 1.8 + i * 0.15,
                      duration: 2.0,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                      ease: 'easeOut',
                    }}
                  />
                )}

                {/* Labels */}
                <motion.div
                  className="mt-4 flex flex-col items-center gap-0.75"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: startDelay + 1.0 + i * 0.13,
                    duration: 0.4,
                    ease: 'easeOut',
                  }}
                >
                  <span
                    className={[
                      'text-[0.58rem] font-medium tracking-wide whitespace-nowrap leading-none transition-colors duration-150',
                      node.isCompany
                        ? 'text-black group-hover:text-black/60'
                        : node.isClickable
                          ? 'text-black/50 group-hover:text-black/80'
                          : 'text-black/40',
                    ].join(' ')}
                  >
                    {node.label}
                  </span>
                  {node.sub && (
                    <span className="text-[0.5rem] text-black/22 tracking-wider whitespace-nowrap leading-none transition-colors duration-150 group-hover:text-black/35">
                      {node.sub}
                    </span>
                  )}
                </motion.div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   MermaidDiagram  —  client-side mermaid renderer
═══════════════════════════════════════════════════ */
const DEFAULT_MERMAID = 'graph LR\n  A --> B';

function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
        themeVariables: { fontSize: '11px' },
      });
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          // make SVG responsive
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.removeAttribute('width');
            svgEl.removeAttribute('height');
            svgEl.setAttribute('width', '100%');
            svgEl.style.maxHeight = '100%';
          }
        }
      } catch {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML =
            '<p style="font-size:0.5rem;color:rgba(0,0,0,0.3);text-align:center">다이어그램 준비 중</p>';
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden"
    />
  );
}

/* ═══════════════════════════════════════════════════
   DragCarousel  —  momentum-based card slider
═══════════════════════════════════════════════════ */
const CAROUSEL_STEP = 210;
const CARD_W = 178;
const CARD_H = 112;

function ProjectCard({
  project,
  index,
  stripX,
  onSelect,
  wasDragRef,
}: {
  project: Project;
  index: number;
  stripX: MotionValue<number>;
  onSelect: () => void;
  wasDragRef: { current: boolean };
}) {
  const cardCenterX = useTransform(stripX, (sx) => index * CAROUSEL_STEP + sx);
  const norm = useTransform(cardCenterX, (cx) => cx / CAROUSEL_STEP);
  const translateX = useTransform(cardCenterX, (cx) => cx - CARD_W / 2);
  const rotateY = useTransform(norm, [-3, -1, 0, 1, 3], [55, 42, 0, -42, -55]);
  const scale = useTransform(norm, (o) => Math.max(0.74, 1 - Math.abs(o) * 0.13));
  const opacity = useTransform(norm, [-3, -2, 0, 2, 3], [0, 0.7, 1, 0.7, 0]);
  const zIndex = useTransform(norm, (o) => Math.max(1, 50 - Math.round(Math.abs(o) * 12)));
  const filterStr = useTransform(
    norm,
    (o) => `brightness(${Math.max(0.65, 1 - Math.abs(o) * 0.25)})`,
  );

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        left: '50%',
        top: '50%',
        marginTop: -CARD_H / 2,
        x: translateX,
        rotateY,
        scale,
        opacity,
        zIndex,
        transformStyle: 'preserve-3d',
        filter: filterStr,
      }}
      onClick={() => {
        if (!wasDragRef.current) onSelect();
      }}
    >
      <div className="w-full h-full rounded-xl border border-black/8 bg-white flex flex-col items-center justify-center gap-2.5 shadow-[0_2px_14px_rgba(0,0,0,0.06)] px-5">
        <span className="text-[0.68rem] font-medium tracking-[0.15em] text-black/55 text-center leading-snug">
          {project.label}
        </span>
        <div className="h-px w-8 bg-black/8" />
        <span className="text-[0.5rem] tracking-[0.22em] text-black/28 text-center">
          {project.dates}
        </span>
      </div>
    </motion.div>
  );
}

function DragCarousel({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (id: string) => void;
}) {
  const stripX = useMotionValue(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const isDown = useRef(false);
  const startClientX = useRef(0);
  const startStripX = useRef(0);
  const lastClientX = useRef(0);
  const lastEventTime = useRef(0);
  const pointerVel = useRef(0); // px/s
  const wasDrag = useRef(false);

  const clamp = useCallback(
    (v: number) => Math.max(-(projects.length - 1) * CAROUSEL_STEP, Math.min(0, v)),
    [projects.length],
  );

  const snapTo = useCallback(
    (idx: number, initVel = 0) => {
      const clamped = Math.max(0, Math.min(projects.length - 1, idx));
      animate(stripX, -clamped * CAROUSEL_STEP, {
        type: 'spring',
        stiffness: 200,
        damping: 28,
        velocity: initVel,
      });
      setActiveIdx(clamped);
    },
    [projects.length, stripX],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      isDown.current = true;
      startClientX.current = e.clientX;
      startStripX.current = stripX.get();
      lastClientX.current = e.clientX;
      lastEventTime.current = performance.now();
      pointerVel.current = 0;
      wasDrag.current = false;
    },
    [stripX],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDown.current) return;
      const dx = e.clientX - startClientX.current;
      if (Math.abs(dx) > 6) wasDrag.current = true;
      const now = performance.now();
      const dt = now - lastEventTime.current;
      if (dt > 0) pointerVel.current = ((e.clientX - lastClientX.current) / dt) * 1000;
      lastClientX.current = e.clientX;
      lastEventTime.current = now;
      stripX.set(clamp(startStripX.current + dx));
    },
    [clamp, stripX],
  );

  const onPointerUp = useCallback(() => {
    if (!isDown.current) return;
    isDown.current = false;
    if (!wasDrag.current) return;
    const projected = stripX.get() + pointerVel.current * 0.1;
    snapTo(Math.round(-projected / CAROUSEL_STEP), -pointerVel.current);
  }, [snapTo, stripX]);

  const onPointerCancel = useCallback(() => {
    isDown.current = false;
    wasDrag.current = false;
  }, []);

  return (
    <div className="relative w-full" style={{ height: CARD_H + 50 }}>
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ perspective: 900 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {projects.map((proj, i) => (
          <ProjectCard
            key={proj.id}
            project={proj}
            index={i}
            stripX={stripX}
            onSelect={() => onSelect(proj.id)}
            wasDragRef={wasDrag}
          />
        ))}
      </div>
      {/* Dot indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
        {projects.map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full bg-black"
            animate={{
              width: i === activeIdx ? 14 : 5,
              height: 5,
              opacity: i === activeIdx ? 0.35 : 0.12,
            }}
            transition={{ duration: 0.22 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Screens
═══════════════════════════════════════════════════ */

function HomeScreen({ onNav }: { onNav: (v: View) => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-10 h-full w-full">
      {/* Identity */}
      <div className="flex flex-col items-center gap-2.5">
        <motion.h1
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          className="text-[1.35rem] font-light tracking-[0.55em] text-black/60"
        >
          정 영 균
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.6 }}
          className="text-[0.52rem] tracking-[0.45em] text-black/22 uppercase"
        >
          Frontend Developer · 10yr
        </motion.p>
      </div>

      {/* Thin decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        style={{ transformOrigin: 'center' }}
        transition={{ delay: 0.22, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        className="w-14 h-px bg-black/8"
      />

      {/* Nav capsule buttons */}
      <div className="flex items-end justify-center gap-4 sm:gap-6 flex-wrap">
        {NAV.map((item, i) => (
          <NavCard
            key={item.id}
            item={item}
            index={i}
            onClick={() => onNav(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CareerScreen({
  onBack,
  onCompany,
  onUniv,
}: {
  onBack: () => void;
  onCompany: (k: CompanyKey) => void;
  onUniv: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-12 h-full w-full">
      <BackButton onClick={onBack} />

      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-[0.52rem] tracking-[0.55em] text-black/18 uppercase"
      >
        Career
      </motion.p>

      <TimelineTrack
        nodes={CAREER_NODES}
        onNodeClick={(n) => {
          if (n.companyKey) onCompany(n.companyKey);
          else if (n.id === 'univ') onUniv();
        }}
        startDelay={0.4}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        className="text-[0.48rem] tracking-[0.3em] text-black/16"
      >
        아이콘을 클릭하면 상세를 볼 수 있습니다
      </motion.p>
    </div>
  );
}

function CompanyScreen({
  companyKey,
  onBack,
  onProject,
}: {
  companyKey: CompanyKey;
  onBack: () => void;
  onProject: (projectId: string) => void;
}) {
  const company = COMPANIES[companyKey];

  return (
    <div className="relative flex flex-col items-center justify-center gap-10 h-full w-full">
      <BackButton onClick={onBack} />

      <div className="flex flex-col items-center gap-2">
        <motion.h2
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55, ease: [0.34, 1.2, 0.64, 1] }}
          className="text-[0.95rem] font-light tracking-[0.38em] text-black/55"
        >
          {company.name}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.5 }}
          className="text-[0.5rem] tracking-[0.32em] text-black/22"
        >
          {company.period} · {company.role}
        </motion.p>
      </div>

      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.55 }}
      >
        <DrumCarousel projects={company.projects} onSelect={onProject} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="text-[0.48rem] tracking-[0.3em] text-black/16"
      >
        드래그로 탐색 · 탭하면 상세보기
      </motion.p>
    </div>
  );
}

function ProjectScreen({
  project,
  companyName,
  onBack,
}: {
  project: Project;
  companyName: string;
  onBack: () => void;
}) {
  return (
    <div className="relative flex flex-col h-full w-full">
      <BackButton onClick={onBack} />

      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-1.5 pt-16 pb-4 shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">{companyName}</p>
        <h2 className="text-[0.9rem] font-light tracking-[0.32em] text-black/60">{project.label}</h2>
        <p className="text-[0.48rem] tracking-[0.3em] text-black/28">{project.dates}</p>
        <p className="text-[0.54rem] tracking-[0.14em] text-black/38 mt-0.5">{project.desc}</p>
      </motion.div>

      {/* 2-column content */}
      <motion.div
        className="flex flex-1 gap-4 px-6 sm:px-10 pb-8 min-h-0"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        {/* Left: Mermaid diagram */}
        <div className="flex-1 border border-black/8 rounded-xl flex flex-col overflow-hidden bg-white/50 p-4">
          <p className="text-[0.44rem] tracking-[0.38em] text-black/20 uppercase mb-2 shrink-0">
            설계도
          </p>
          <MermaidDiagram code={project.mermaidCode ?? DEFAULT_MERMAID} />
        </div>

        {/* Right: Image placeholder */}
        <div className="flex-1 border border-black/8 rounded-xl flex flex-col items-center justify-center bg-white/50 relative overflow-hidden">
          {/* Tech-map SVG placeholder */}
          <svg
            viewBox="0 0 240 180"
            className="absolute inset-0 w-full h-full opacity-[0.07]"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          >
            {/* nodes */}
            {[
              [120, 90], [60, 45], [180, 45], [30, 120], [90, 140],
              [150, 140], [210, 110], [60, 160], [190, 170],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={8} />
            ))}
            {/* edges */}
            {[
              [120,90,60,45],[120,90,180,45],[120,90,90,140],[120,90,150,140],
              [60,45,30,120],[180,45,210,110],[90,140,60,160],[150,140,190,170],
            ].map(([x1,y1,x2,y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </svg>
          <p className="text-[0.44rem] tracking-[0.38em] text-black/20 uppercase absolute top-4 left-4">
            이미지
          </p>
          <p className="text-[0.5rem] tracking-[0.15em] text-black/18">준비 중</p>
        </div>
      </motion.div>
    </div>
  );
}

const UNIV_PROJECTS = [
  { id: 'auto-report', label: '자동신고', dates: '2013', desc: '충격 감지 시 자동 신고 앱' },
  { id: 'janggi',      label: '장기',     dates: '2014', desc: '서버-클라이언트 장기 게임' },
  { id: 'shooting',    label: '슈팅게임', dates: '2014', desc: '갤러그 스타일 슈팅 게임' },
];

function UniversityScreen({ onBack, onProject }: { onBack: () => void; onProject: (id: string) => void }) {
  const gradeColor = (g: string) =>
    g.startsWith('A')
      ? 'text-black/70'
      : g.startsWith('B')
        ? 'text-black/45'
        : 'text-black/25';

  return (
    <div className="relative flex flex-col h-full w-full max-w-xl mx-auto">
      <BackButton onClick={onBack} />

      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-1 pt-20 pb-6 shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">
          Inje University
        </p>
        <h2 className="text-[0.85rem] font-light tracking-[0.35em] text-black/55">
          인제대학교
        </h2>
        <p className="text-[0.48rem] tracking-[0.28em] text-black/22 mt-1">
          컴퓨터공학 관련 이수과목
        </p>
      </motion.div>

      {/* Project cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.42 }}
        className="px-6 pb-4 shrink-0"
      >
        <p className="text-[0.46rem] tracking-[0.38em] text-black/20 uppercase mb-3">프로젝트</p>
        <div className="flex gap-3">
          {UNIV_PROJECTS.map((proj, i) => (
            <motion.button
              key={proj.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.07, duration: 0.38 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onProject(proj.id)}
              className="flex-1 text-left rounded-xl border border-black/8 bg-white/70 p-3 cursor-pointer"
              style={{ minWidth: 0 }}
            >
              <p className="text-[0.65rem] font-medium tracking-[0.1em] text-black/60 leading-none mb-1.5">{proj.label}</p>
              <p className="text-[0.44rem] tracking-[0.12em] text-black/25">{proj.dates}</p>
              <p className="text-[0.46rem] tracking-[0.06em] text-black/35 mt-1 leading-snug">{proj.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Course list */}
      <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-6">
        {UNIV_COURSES.map((group, gi) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 + gi * 0.06, duration: 0.42 }}
          >
            {/* Category label */}
            <p className="text-[0.46rem] tracking-[0.38em] text-black/20 uppercase mb-2.5">
              {group.label}
            </p>
            {/* Course rows */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {group.courses.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between gap-2 py-0.5 border-b border-black/4"
                >
                  <span className="text-[0.56rem] tracking-[0.1em] text-black/45 leading-none truncate">
                    {c.name}
                  </span>
                  <span
                    className={`text-[0.54rem] font-medium tracking-[0.08em] leading-none shrink-0 ${gradeColor(c.grade)}`}
                  >
                    {c.grade}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FreelanceCard({
  item,
  index,
  stripX,
  onSelect,
  wasDragRef,
}: {
  item: FreelanceItem;
  index: number;
  stripX: MotionValue<number>;
  onSelect: () => void;
  wasDragRef: { current: boolean };
}) {
  const cardCenterX = useTransform(stripX, (sx) => index * CAROUSEL_STEP + sx);
  const norm = useTransform(cardCenterX, (cx) => cx / CAROUSEL_STEP);
  const translateX = useTransform(cardCenterX, (cx) => cx - CARD_W / 2);
  const rotateY = useTransform(norm, [-3, -1, 0, 1, 3], [55, 42, 0, -42, -55]);
  const scale = useTransform(norm, (o) => Math.max(0.74, 1 - Math.abs(o) * 0.13));
  const opacity = useTransform(norm, [-3, -2, 0, 2, 3], [0, 0.7, 1, 0.7, 0]);
  const zIndex = useTransform(norm, (o) => Math.max(1, 50 - Math.round(Math.abs(o) * 12)));
  const filterStr = useTransform(
    norm,
    (o) => `brightness(${Math.max(0.65, 1 - Math.abs(o) * 0.25)})`,
  );

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        width: CARD_W,
        height: CARD_H,
        left: '50%',
        top: '50%',
        marginTop: -CARD_H / 2,
        x: translateX,
        rotateY,
        scale,
        opacity,
        zIndex,
        transformStyle: 'preserve-3d',
        filter: filterStr,
      }}
      onClick={() => {
        if (!wasDragRef.current) onSelect();
      }}
    >
      <div className="w-full h-full rounded-xl border border-black/8 bg-white flex flex-col items-center justify-center gap-2.5 shadow-[0_2px_14px_rgba(0,0,0,0.06)] px-5">
        <span className="text-[0.68rem] font-medium tracking-[0.15em] text-black/55 text-center leading-snug">
          {item.label}
        </span>
        <div className="h-px w-8 bg-black/8" />
        <span className="text-[0.5rem] tracking-[0.22em] text-black/28 text-center">
          {item.period}
        </span>
      </div>
    </motion.div>
  );
}

function FreelanceDragCarousel({
  items,
  onSelect,
}: {
  items: FreelanceItem[];
  onSelect: (key: FreelanceKey) => void;
}) {
  const stripX = useMotionValue(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const isDown = useRef(false);
  const startClientX = useRef(0);
  const startStripX = useRef(0);
  const lastClientX = useRef(0);
  const lastEventTime = useRef(0);
  const pointerVel = useRef(0);
  const wasDrag = useRef(false);

  const clamp = useCallback(
    (v: number) => Math.max(-(items.length - 1) * CAROUSEL_STEP, Math.min(0, v)),
    [items.length],
  );

  const snapTo = useCallback(
    (idx: number, initVel = 0) => {
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      animate(stripX, -clamped * CAROUSEL_STEP, {
        type: 'spring',
        stiffness: 200,
        damping: 28,
        velocity: initVel,
      });
      setActiveIdx(clamped);
    },
    [items.length, stripX],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      isDown.current = true;
      startClientX.current = e.clientX;
      startStripX.current = stripX.get();
      lastClientX.current = e.clientX;
      lastEventTime.current = performance.now();
      pointerVel.current = 0;
      wasDrag.current = false;
    },
    [stripX],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDown.current) return;
      const dx = e.clientX - startClientX.current;
      if (Math.abs(dx) > 6) wasDrag.current = true;
      const now = performance.now();
      const dt = now - lastEventTime.current;
      if (dt > 0) pointerVel.current = ((e.clientX - lastClientX.current) / dt) * 1000;
      lastClientX.current = e.clientX;
      lastEventTime.current = now;
      stripX.set(clamp(startStripX.current + dx));
    },
    [clamp, stripX],
  );

  const onPointerUp = useCallback(() => {
    if (!isDown.current) return;
    isDown.current = false;
    if (!wasDrag.current) return;
    const projected = stripX.get() + pointerVel.current * 0.1;
    snapTo(Math.round(-projected / CAROUSEL_STEP), -pointerVel.current);
  }, [snapTo, stripX]);

  const onPointerCancel = useCallback(() => {
    isDown.current = false;
    wasDrag.current = false;
  }, []);

  return (
    <div className="relative w-full" style={{ height: CARD_H + 50 }}>
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ perspective: 900 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {items.map((item, i) => (
          <FreelanceCard
            key={item.key}
            item={item}
            index={i}
            stripX={stripX}
            onSelect={() => onSelect(item.key)}
            wasDragRef={wasDrag}
          />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
        {items.map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full bg-black"
            animate={{
              width: i === activeIdx ? 14 : 5,
              height: 5,
              opacity: i === activeIdx ? 0.35 : 0.12,
            }}
            transition={{ duration: 0.22 }}
          />
        ))}
      </div>
    </div>
  );
}

function FreelanceScreen({
  onBack,
  onItem,
}: {
  onBack: () => void;
  onItem: (key: FreelanceKey) => void;
}) {
  const items = FREELANCE_LIST.map((k) => FREELANCE[k]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-10 h-full w-full">
      <BackButton onClick={onBack} />

      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-[0.52rem] tracking-[0.55em] text-black/18 uppercase"
      >
        Freelance
      </motion.p>

      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.55 }}
      >
        <FreelanceDragCarousel items={items} onSelect={onItem} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="text-[0.48rem] tracking-[0.3em] text-black/16"
      >
        드래그로 탐색하세요
      </motion.p>
    </div>
  );
}

function FreelanceDetailScreen({
  itemKey,
  onBack,
}: {
  itemKey: FreelanceKey;
  onBack: () => void;
}) {
  const item = FREELANCE[itemKey];

  return (
    <div className="relative flex flex-col h-full w-full max-w-xl mx-auto">
      <BackButton onClick={onBack} />

      <motion.div
        className="flex flex-col items-center gap-1.5 pt-20 pb-6 shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">Freelance</p>
        <h2 className="text-[0.9rem] font-light tracking-[0.35em] text-black/60">{item.label}</h2>
        <p className="text-[0.48rem] tracking-[0.28em] text-black/30 mt-0.5">{item.period}</p>
        <p className="text-[0.52rem] tracking-[0.15em] text-black/38 mt-1 text-center leading-relaxed">
          {item.tagline}
        </p>
      </motion.div>

      <motion.div
        className="flex-1 overflow-y-auto px-6 pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <div className="w-full border border-black/6 rounded-xl p-6 bg-white/60">
          {item.body.split('\n\n').map((para, i) => (
            <p
              key={i}
              className="text-[0.58rem] tracking-[0.08em] text-black/45 leading-[1.85] mb-4 last:mb-0"
            >
              {para}
            </p>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   AboutScreen
═══════════════════════════════════════════════════ */
const ABOUT_SKILLS = [
  { label: 'React · Vue · Nuxt', note: '5 ~ 7년' },
  { label: 'Leaflet', note: '지도 시각화' },
  { label: 'Electron', note: 'Desktop App' },
  { label: 'Android', note: 'Hybrid / Native' },
  { label: 'Node · Spring', note: 'IoT / API' },
  { label: 'ML · 시계열예측', note: '데이터 분석' },
];

const ABOUT_KEYWORDS = [
  '실시간 처리', '대용량 트래픽', '상태 관리 최적화',
  '지도 시각화', 'IoT 파이프라인', '음영지역 대응',
  'Self-hosted 인프라', '마이데이터 API', '디지털 트윈',
  '이기종 연동', 'CI/CD', '무결점 납품',
];

function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 전체화면 3D 캔버스 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <RobotWalking />
      </motion.div>

      <BackButton onClick={onBack} />

      {/* 텍스트 오버레이 — 왼쪽 절반 */}
      <motion.div
        className="absolute top-0 bottom-0 left-0 flex flex-col justify-center px-10 sm:px-14 gap-7 pt-16 z-10"
        style={{ width: '48%' }}
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.55 }}
      >
        {/* Identity */}
        <div className="flex flex-col gap-1">
          <p className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase">About</p>
          <h2 className="text-[1rem] font-light tracking-[0.4em] text-black/60">정 영 균</h2>
          <p className="text-[0.52rem] tracking-[0.25em] text-black/30">Frontend Developer · 10yr</p>
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-2">
          <p className="text-[0.44rem] tracking-[0.38em] text-black/18 uppercase mb-1">기술 스택</p>
          {ABOUT_SKILLS.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="text-[0.6rem] font-medium tracking-[0.1em] text-black/55">{s.label}</span>
              <span className="text-[0.46rem] tracking-[0.12em] text-black/22">{s.note}</span>
            </div>
          ))}
        </div>

        {/* Keywords */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[0.44rem] tracking-[0.38em] text-black/18 uppercase mb-1">키워드</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {ABOUT_KEYWORDS.map((kw) => (
              <span key={kw} className="text-[0.5rem] tracking-[0.1em] text-black/35 leading-none">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SimpleScreen({ view, onBack }: { view: View; onBack: () => void }) {
  const LABELS: Partial<Record<View, string>> = {
    freelance: '외주',
    about: '소개',
    schedule: '스케줄',
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-8 h-full w-full">
      <BackButton onClick={onBack} />
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="text-[0.52rem] tracking-[0.55em] text-black/18 uppercase"
      >
        {LABELS[view] ?? view}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38, duration: 0.6 }}
        className="text-[0.62rem] tracking-[0.28em] text-black/22"
      >
        준비 중입니다
      </motion.p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Page  —  state machine + animated screen transitions
═══════════════════════════════════════════════════ */
const slideVariants = {
  enter: (d: number) => ({
    x: d > 0 ? '12%' : '-12%',
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({
    x: d > 0 ? '-12%' : '12%',
    opacity: 0,
  }),
};

export default function Page() {
  const [view, setView] = useState<View>('home');
  const [company, setCompany] = useState<CompanyKey | null>(null);
  const [project, setProject] = useState<string | null>(null);
  const [univOpen, setUnivOpen] = useState(false);
  const [freelanceItem, setFreelanceItem] = useState<FreelanceKey | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);

  const navigate = (v: View) => {
    history.pushState(null, '');
    setDir(1);
    setView(v);
  };

  const openCompany = (k: CompanyKey) => {
    history.pushState(null, '');
    setDir(1);
    setCompany(k);
  };

  const openProject = (projectId: string) => {
    history.pushState(null, '');
    setDir(1);
    setProject(projectId);
  };

  const openUniv = () => {
    history.pushState(null, '');
    setDir(1);
    setUnivOpen(true);
  };

  const openFreelanceItem = (key: FreelanceKey) => {
    history.pushState(null, '');
    setDir(1);
    setFreelanceItem(key);
  };

  // 상태 복원 로직 (UI 버튼 & 브라우저 뒤로가기 공유)
  const applyBack = useCallback(() => {
    setDir(-1);
    if (project && univOpen) {
      setProject(null);          // univ 프로젝트 → univ 화면으로
    } else if (project) {
      setProject(null);
    } else if (company) {
      setCompany(null);
    } else if (univOpen) {
      setUnivOpen(false);
    } else if (freelanceItem) {
      setFreelanceItem(null);
    } else {
      setView('home');
    }
  }, [project, company, univOpen, freelanceItem]);

  // 브라우저 뒤로가기 버튼 → applyBack
  useEffect(() => {
    const onPop = () => applyBack();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [applyBack]);

  const goBack = () => {
    history.back(); // popstate 발생 → applyBack 호출
  };

  const screenKey = project && univOpen
    ? `univ-project-${project}`
    : project
      ? `project-${project}`
      : univOpen
        ? 'university'
        : company
          ? `company-${company}`
          : freelanceItem
            ? `freelance-${freelanceItem}`
            : view;

  const renderScreen = () => {
    if (view === 'home') return <HomeScreen onNav={navigate} />;

    if (project && company) {
      if (project === 'o2')  return <BookCafeDemo onBack={goBack} />;
      if (project === 'c1')  return <MyDataApiDemo onBack={goBack} />;
      if (project === 'c2')  return <KrxDownloadDemo onBack={goBack} />;
      if (project === 'c3')  return <KrxSiteDemo onBack={goBack} />;
      const proj = COMPANIES[company].projects.find((p) => p.id === project);
      if (proj)
        return (
          <ProjectScreen
            project={proj}
            companyName={COMPANIES[company].name}
            onBack={goBack}
          />
        );
    }

    if (univOpen) {
      if (project === 'auto-report') return <AutoReportDemo onBack={goBack} />;
      if (project === 'janggi')      return <JanggiDemo onBack={goBack} />;
      if (project === 'shooting')    return <ShootingGameDemo onBack={goBack} />;
      return <UniversityScreen onBack={goBack} onProject={openProject} />;
    }

    if (company)
      return (
        <CompanyScreen
          companyKey={company}
          onBack={goBack}
          onProject={openProject}
        />
      );

    if (view === 'career')
      return (
        <CareerScreen
          onBack={goBack}
          onCompany={openCompany}
          onUniv={openUniv}
        />
      );

    if (view === 'freelance') {
      if (freelanceItem)
        return <FreelanceDetailScreen itemKey={freelanceItem} onBack={goBack} />;
      return <FreelanceScreen onBack={goBack} onItem={openFreelanceItem} />;
    }

    if (view === 'about') return <AboutScreen onBack={goBack} />;

    if (view === 'schedule') return <ScheduleScreen onBack={goBack} />;

    return <SimpleScreen view={view} onBack={goBack} />;
  };

  // About 화면은 풀스크린 캔버스 — 패딩 제거
  const isFullBleed = view === 'about' && !company && !project && !univOpen && !freelanceItem;

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#f6f6f6] relative">
      {/* Very subtle dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Radial vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.03) 100%)',
        }}
      />

      {/* Screen content */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={screenKey}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute inset-0 z-10 flex items-center justify-center ${isFullBleed ? '' : 'px-6 sm:px-12'}`}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-5 left-0 right-0 z-20 flex justify-center pointer-events-none"
      >
        <p className="text-[0.46rem] tracking-[0.45em] text-black/14 uppercase">
          Jung Young Kyun · github.com/inpiniti
        </p>
      </motion.div>
    </div>
  );
}
