'use client';

import { useCallback, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';

/* ═══════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════ */
type View =
  | 'home'
  | 'career'
  | 'freelance'
  | 'about'
  | 'skills'
  | 'contact'
  | 'schedule';

type CompanyKey = 'onware' | 'cyberi' | 'iocode' | 'ecomarine' | 'grm';

/* ═══════════════════════════════════════════════════
   Data
═══════════════════════════════════════════════════ */
const NAV: { id: View; label: string }[] = [
  { id: 'career', label: '경력' },
  { id: 'freelance', label: '외주' },
  { id: 'about', label: '소개' },
  { id: 'skills', label: '보유기술' },
  { id: 'contact', label: '연락처' },
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
      className="absolute top-8 left-8 flex items-center gap-1.5 cursor-pointer select-none group focus:outline-none"
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
   DocIcon
═══════════════════════════════════════════════════ */
function DocIcon({ doc, index }: { doc: ProjectDoc; index: number }) {
  const svgContent = {
    design: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
        <line x1="3" y1="9" x2="21" y2="9" strokeWidth="1.2" />
        <line x1="3" y1="15" x2="21" y2="15" strokeWidth="1.2" />
        <line x1="9" y1="3" x2="9" y2="21" strokeWidth="1.2" />
        <line x1="15" y1="3" x2="15" y2="21" strokeWidth="1.2" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.2" />
        <polyline
          points="21,15 16,10 5,21"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </>
    ),
    other: (
      <>
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          strokeWidth="1.5"
        />
        <polyline points="14,2 14,8 20,8" strokeWidth="1.3" />
        <line x1="8" y1="13" x2="16" y2="13" strokeWidth="1.2" />
        <line x1="8" y1="17" x2="16" y2="17" strokeWidth="1.2" />
      </>
    ),
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-3 group cursor-pointer select-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.5 + index * 0.1,
        duration: 0.5,
        ease: [0.34, 1.2, 0.64, 1],
      }}
    >
      <div className="w-14 h-14 rounded-full bg-black/5 border border-black/6 flex items-center justify-center group-hover:bg-black/10 group-hover:border-black/12 transition-all duration-200">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-6 h-6 text-black/30 group-hover:text-black/55 transition-colors duration-200"
        >
          {svgContent[doc.type]}
        </svg>
      </div>
      <span className="text-[0.52rem] tracking-[0.28em] text-black/28 group-hover:text-black/50 transition-colors duration-200">
        {doc.label}
      </span>
    </motion.div>
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
  const projectNodes: TNode[] = company.projects.map((p) => ({
    id: p.id,
    label: p.label,
    sub: p.dates,
    isClickable: true,
  }));

  return (
    <div className="relative flex flex-col items-center justify-center gap-10 h-full w-full">
      <BackButton onClick={onBack} />

      <div className="flex flex-col items-center gap-2">
        <motion.h2
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.55,
            ease: [0.34, 1.2, 0.64, 1],
          }}
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

      <TimelineTrack
        nodes={projectNodes}
        onNodeClick={(n) => onProject(n.id)}
        startDelay={0.5}
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        className="text-[0.48rem] tracking-[0.3em] text-black/16"
      >
        프로젝트를 클릭하면 상세를 볼 수 있습니다
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
    <div className="relative flex flex-col items-center justify-center gap-10 h-full w-full">
      <BackButton onClick={onBack} />

      <div className="flex flex-col items-center gap-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="text-[0.46rem] tracking-[0.45em] text-black/20 uppercase"
        >
          {companyName}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.22,
            duration: 0.55,
            ease: [0.34, 1.2, 0.64, 1],
          }}
          className="text-[0.9rem] font-light tracking-[0.32em] text-black/60"
        >
          {project.label}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.45 }}
          className="text-[0.48rem] tracking-[0.3em] text-black/22"
        >
          {project.dates}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.45 }}
          className="text-[0.54rem] tracking-[0.18em] text-black/38"
        >
          {project.desc}
        </motion.p>
      </div>

      {project.documents && project.documents.length > 0 && (
        <div className="flex items-start gap-10">
          {project.documents.map((doc, i) => (
            <DocIcon key={doc.type} doc={doc} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function UniversityScreen({ onBack }: { onBack: () => void }) {
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

function SimpleScreen({ view, onBack }: { view: View; onBack: () => void }) {
  const LABELS: Partial<Record<View, string>> = {
    freelance: '외주',
    about: '소개',
    skills: '보유기술',
    contact: '연락처',
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
  const [dir, setDir] = useState<1 | -1>(1);

  const navigate = (v: View) => {
    setDir(1);
    setView(v);
  };

  const openCompany = (k: CompanyKey) => {
    setDir(1);
    setCompany(k);
  };

  const openProject = (projectId: string) => {
    setDir(1);
    setProject(projectId);
  };

  const openUniv = () => {
    setDir(1);
    setUnivOpen(true);
  };

  const goBack = () => {
    setDir(-1);
    if (project) {
      setProject(null);
    } else if (company) {
      setCompany(null);
    } else if (univOpen) {
      setUnivOpen(false);
    } else {
      setView('home');
    }
  };

  const screenKey = project
    ? `project-${project}`
    : univOpen
      ? 'university'
      : company
        ? `company-${company}`
        : view;

  const renderScreen = () => {
    if (view === 'home') return <HomeScreen onNav={navigate} />;

    if (project && company) {
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

    if (univOpen) return <UniversityScreen onBack={goBack} />;

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

    return <SimpleScreen view={view} onBack={goBack} />;
  };

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
          className="absolute inset-0 z-10 flex items-center justify-center px-6 sm:px-12"
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
