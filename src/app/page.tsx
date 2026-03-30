"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Renderer } from "@json-render/react";
import { registry } from "@/lib/render-setup";
import { toSpec } from "@/lib/nested-to-spec";
import { WheelCardSlider } from "@/components/WheelCardSlider";

// ─── 헬퍼 ───────────────────────────────────────────────
const heading = (text: string, level: "h1" | "h2" | "h3" = "h2") => ({
  component: "Heading",
  props: { text, level },
});

const text = (t: string, variant: "body" | "muted" | "lead" | "caption" = "body") => ({
  component: "Text",
  props: { text: t, variant },
});

const badge = (t: string, variant: "default" | "secondary" | "outline" = "secondary") => ({
  component: "Badge",
  props: { text: t, variant },
});

const badgeRow = (...items: string[]) => ({
  component: "Stack",
  props: { direction: "horizontal", gap: "sm" },
  children: items.map((t) => badge(t)),
});

const sep = { component: "Separator", props: {} };

// ─── 섹션: Hero ─────────────────────────────────────────
const hero = {
  component: "Stack",
  props: { direction: "horizontal", gap: "lg", align: "center" },
  children: [
    {
      component: "Stack",
      props: { direction: "vertical", gap: "sm" },
      children: [
        heading("정 영 균 (Jung Young Kyun)", "h1"),
        text("프론트엔드 전문 개발자 · 10년차", "lead"),
        text("10년 이상의 풀스택 기반 프론트엔드 전문가. 브라우저 렌더링 원리와 성능 최적화에 깊은 이해를 보유한 개발자입니다.", "muted"),
        {
          component: "Stack",
          props: { direction: "horizontal", gap: "sm" },
          children: [
            badge("React", "default"),
            badge("Vue / Nuxt"),
            badge("TypeScript"),
            badge("Leaflet.js"),
            badge("Node.js", "outline"),
          ],
        },
        {
          component: "Stack",
          props: { direction: "horizontal", gap: "sm" },
          children: [
            badge("KakaoTalk: dhlxhfl", "secondary"),
            badge("github.com/inpiniti", "secondary"),
          ],
        },
      ],
    },
  ],
};

// ─── 섹션: 소개 ─────────────────────────────────────────
const about = {
  component: "Stack",
  props: { direction: "vertical", gap: "md" },
  children: [
    heading("소개"),
    {
      component: "Card",
      props: {},
      children: [
        text(
          "10년 이상의 풀스택 기반 프론트엔드 전문가로, 단순 UI 구현을 넘어 브라우저 렌더링 원리와 성능 최적화에 깊은 이해를 보유한 6년 이상의 프론트엔드 집중 경력자입니다. " +
            "금융(거래소/마이데이터), 해양 IoT, 공공 시스템 등 복잡한 도메인 지식을 빠르게 습득하여 기술로 풀어내는 주도적 개발자입니다."
        ),
      ],
    },
    {
      component: "Grid",
      props: { columns: 2, gap: "md" },
      children: [
        {
          component: "Card",
          props: {},
          children: [
            heading("🎓 학력", "h3"),
            text("인제대학교 컴퓨터공학부"),
            text("2005.03 ~ 2012.08", "muted"),
            {
              component: "Button",
              props: { label: "이수 과목 보기 →", variant: "secondary" },
              on: { press: { action: "setState", params: { statePath: "/educationOpen", value: true } } },
            },
          ],
        },
        {
          component: "Card",
          props: {},
          children: [heading("📄 자격증", "h3"), text("정보처리기사"), text("2015.07.31 취득", "muted")],
        },
      ],
    },
    {
      component: "ScrollableDialog",
      props: {
        title: "인제대학교 컴퓨터공학부 이수 과목",
        description: "컴퓨터/코딩 관련 과목 · 2005.03 ~ 2012.08",
        openPath: "/educationOpen",
      },
      children: [
        {
          component: "Stack",
          props: { direction: "vertical", gap: "md" },
          children: [
            heading("프로그래밍 언어", "h3"),
            badgeRow("C프로그래밍Ⅰ", "C++프로그래밍", "Java프로그래밍Ⅰ", "Web프로그래밍", "모바일프로그래밍", "Linux프로그래밍", "객체지향윈도우프로그래밍", "컴퓨터프로그래밍"),
            heading("CS 기초", "h3"),
            badgeRow("데이터구조", "알고리즘", "운영체제", "컴퓨터구조", "이산구조", "오토마타 및 컴파일러", "파일구조론", "프로그래밍언어론"),
            heading("네트워크", "h3"),
            badgeRow("네트워크미들웨어실습", "네트워크프로그래밍", "컴퓨터통신및지능형홈네트워킹"),
            heading("데이터베이스 / SW공학", "h3"),
            badgeRow("데이터베이스", "전산수학", "소프트웨어공학", "소프트웨어요구분석및설계", "공학설계입문", "종합설계"),
            heading("기타", "h3"),
            badgeRow("정보보안", "멀티미디어개론"),
          ],
        },
      ],
    },
  ],
};

// ─── 가스 링크 주요화면 Dialog ────────────────────────────
const gasLinkScreenshotsDialog = {
  component: "ScrollableDialog",
  props: {
    title: "가스 링크 주요 화면",
    description: "계량기 인식 · 검침 · 지도 · 점검 · 방문 · 교체 · 체납",
    openPath: "/gasLinkScreenshotsOpen",
  },
  children: [{ component: "GasLinkScreenshots", props: {} }],
};

// ─── 가스 링크 작업내역 Dialog ────────────────────────────
const gasLinkWorkDialog = {
  component: "ScrollableDialog",
  props: {
    title: "가스 링크 작업 내역",
    description: "2024.11 ~ 2026.03 · Git 커밋 기반 · 총 2,182건",
    openPath: "/gasLinkWorkOpen",
  },
  children: [
    {
      component: "Stack",
      props: { direction: "vertical", gap: "lg", align: "stretch" },
      children: [
        // 모듈별 커밋 건수
        {
          component: "Stack",
          props: { direction: "vertical", gap: "sm", align: "stretch" },
          children: [
            heading("모듈별 작업 건수", "h3"),
            {
              component: "Grid",
              props: { columns: 2, gap: "sm" },
              children: [
                { component: "Card", props: { title: "점검" }, children: [text("977건", "lead"), text("일반·특정·사용전·개선권고", "muted")] },
                { component: "Card", props: { title: "체납" }, children: [text("382건", "lead"), text("방문등록·중지의뢰·SMS", "muted")] },
                { component: "Card", props: { title: "계량기 교체" }, children: [text("194건", "lead"), text("바코드·작업검증·이력", "muted")] },
                { component: "Card", props: { title: "개선권고" }, children: [text("42건", "lead"), text("발행·차수관리·사진", "muted")] },
                { component: "Card", props: { title: "로그인/인증" }, children: [text("40건", "lead"), text("계정·자동로그인", "muted")] },
                { component: "Card", props: { title: "검침·방문·조정기 외" }, children: [text("82건", "lead"), text("검침·방문·조정기·문자", "muted")] },
              ],
            },
          ],
        },
        sep,
        // 주요 작업 내역
        {
          component: "Stack",
          props: { direction: "vertical", gap: "sm", align: "stretch" },
          children: [
            heading("주요 작업 내역", "h3"),
            ...[
              {
                title: "점검 (977건)",
                lines: ["• 안전점검 전 모듈 UI/로직 구현 및 유지보수", "• 특정점검 > 점검필·서명 데이터 유지 처리", "• 사용전점검 스크롤 튀는 현상 수정", "• 점검 취소 후 재전송 시 차수 오류 수정", "• 부재 3일 조건 완화 및 장기부재 매일 처리", "• 사전문자 예약시간 과거 시점 차단 로직", "• 개선권고 발행 차수 계산 오류 및 차단 로직", "• 일일자료 수신 리팩토링", "• CO경보기 명칭 및 위치 변경 반영"],
              },
              {
                title: "체납 (382건)",
                lines: ["• 체납관리 전 모듈 UI/비즈니스 로직 구현", "• 중지의뢰 API Content-Type multipart/form-data 전환", "• 납부확약·중지유예 확인 후 뒤로가기 UX 개선", "• 수신거부 세대 문자발송 버튼 비활성화", "• 체납 방문등록 숫자패드 3자리 오닫힘 버그", "• 중지·중지해제 회수이력 누적 처리", "• 특별관리·재이관 확정반영 누락 필드 추가", "• 상황금액 0원 이하 저장 방지 팝업"],
              },
              {
                title: "계량기 교체 (194건)",
                lines: ["• 교체 입력 디바운스 이슈로 인한 데이터 덮임 방지", "• 바코드 스캔 및 버튼 클릭 여부 검증 로직", "• 보정기 번호 누락 방어 로직", "• 철거 계량기 철거구분 알림 처리", "• 교체불가 등록 시 철거지침 값 없는 경우 예외처리", "• 소용량·대용량 수신조건 거점 구분 추가"],
              },
              {
                title: "자율안전점검 (47건)",
                lines: ["• 자율안전점검 대상 삭제 시 점검 가능 상태 전환", "• 결과승인 상태인데 점검반영 미처리 세대 버그", "• 미진행 세대 대면 전환 기능 및 문자 서비스", "• 6·12월 미제출 세대 회색 표시 및 안내 문구", "• 안전매니저 결과제출·빌트인 수정 권한 추가", "• 독려문자 중복 발송 방지"],
              },
              {
                title: "검침·방문·조정기·문자전송 (82건)",
                lines: ["• 검침 신규세대 도로명/구주소 표시 오류 수정", "• 재검 스와이프 동작 불가 버그", "• 방문 > 전단밸브 차단유무 저장 오류", "• 방문 > 이메일 ID 입력 후 다음 단계 진행 불가", "• 조정기 > 공동지번 village 필드 추가", "• 문자전송 타임아웃 1초→5초 변경", "• 문자전송 실패 시 15분 간격 자동 재전송"],
              },
            ].map(({ title, lines }) => ({
              component: "Collapsible",
              props: { title },
              children: [
                {
                  component: "Stack",
                  props: { direction: "vertical", gap: "sm", align: "stretch" },
                  children: lines.map((l) => text(l, "muted")),
                },
              ],
            })),
          ],
        },
      ],
    },
  ],
};

// ─── 섹션: 경력 ─────────────────────────────────────────
const experience = {
  component: "Stack",
  props: { direction: "vertical", gap: "md" },
  children: [
    heading("경력"),
    {
      component: "Card",
      props: {},
      children: [
        {
          component: "Stack",
          props: { direction: "vertical", gap: "sm" },
          children: [
            heading("GRM · 운영1팀", "h3"),
            text("서울도시가스 자회사 · 정규직 · 2024.11.18 ~ 현재", "muted"),
            text("가스 링크 (1, 2차) — C언어 기반 PDA 로직을 분석하여 점검·검침·계량기 교체·체납 관리 기능을 React로 전면 재구축. 프론트엔드 자원 부재 상황에서 1년 만에 전 모듈 구축 및 상용화(동접 500명)."),
            badgeRow("React.js", "Zustand", "TanStack Query"),
          ],
        },
      ],
    },
    {
      component: "Card",
      props: {},
      children: [
        {
          component: "Stack",
          props: { direction: "vertical", gap: "sm" },
          children: [
            heading("에코마린 · 개발팀", "h3"),
            text("정규직 · 2023.08.21 ~ 2024.11.14", "muted"),
            text("OceanLook 구축 및 고도화 — Nuxt.js 버전 업그레이드(2.0→3.0) 주도, 자체 타일 서버 구축으로 지도 API 비용 100% 절감. CI/CD 자동화로 배포 시간 50% 단축."),
            badgeRow("Nuxt.js", "Leaflet.js", "Docker", "CI/CD"),
          ],
        },
      ],
    },
    {
      component: "Card",
      props: {},
      children: [
        {
          component: "Stack",
          props: { direction: "vertical", gap: "sm" },
          children: [
            heading("아이오코드 · 개발팀", "h3"),
            text("정규직 · 2021.08.02 ~ 2023.08.19", "muted"),
            text("IoT 기반 지능형 항만물류 기술 개발, 스마트제조혁신기술개발사업, 프로세스 마이닝 분석 플랫폼 'IPR ENT' 고도화."),
            badgeRow("Vue.js", "Node.js", "Mobius", "MQTT", "AAS"),
          ],
        },
      ],
    },
    {
      component: "Card",
      props: {},
      children: [
        {
          component: "Stack",
          props: { direction: "vertical", gap: "sm" },
          children: [
            heading("사이버이메지네이션 · 개발팀", "h3"),
            text("정규직 · 2018.01.02 ~ 2021.07.24", "muted"),
            text("대신증권 마이데이터 표준 API 시스템 구축, 한국거래소(KRX) 대용량 다운로드 센터 구축, KRX 홈페이지 유지보수 및 운영."),
            badgeRow("Electron", "Node.js", "Java", "Oracle"),
          ],
        },
      ],
    },
    {
      component: "Card",
      props: {},
      children: [
        {
          component: "Stack",
          props: { direction: "vertical", gap: "sm" },
          children: [
            heading("온웨어 · 개발팀", "h3"),
            text("정규직 · 2015.02.05 ~ 2017.12.01", "muted"),
            text("O2O 세탁 서비스 플랫폼 안드로이드 앱 개발, 한국동서발전소 '북카페' Full-Stack 개발(DB 설계부터 앱·키오스크까지 1인 수행)."),
            badgeRow("Android", "Spring Framework", "MSSQL"),
          ],
        },
      ],
    },
  ],
};

// ─── 경력 슬라이드 추출 (heading은 WheelCardSlider가 정의하므로 제외) ───────
// experience.children[0] 은 heading → slice(1) 로 카드만 추출
const experienceSlides = experience.children.slice(1);

// ─── FMS 작업내역 Dialog ──────────────────────────────────

const fmsWorkDialog = {
  component: "ScrollableDialog",
  props: {
    title: "FMS 작업 내역",
    description: "2026.01 ~ 현재 · 서울도시가스 모바일 현장관리 시스템 · Git 커밋 기반",
    openPath: "/fmsWorkOpen",
  },
  children: [
    {
      component: "Stack",
      props: { direction: "vertical", gap: "lg", align: "stretch" },
      children: [
        ...[
          {
            title: "대용량 계량기 교체",
            lines: [
              "• 교체 리스트 렌더링 속도 최적화",
              "• 지침 비교 오류 수정",
              "• 교체구분 '기타' 선택 시 기타부품 입력 활성화 (숫자만 허용)",
              "• 지침 콤마 표시 함수 누락 수정",
              "• 코드 최적화 및 컨트롤 활성화 조건 수정",
            ],
          },
          {
            title: "시설전 (계량기 등록)",
            lines: [
              "• 유효년월 항목 추가",
              "• 유효년도 기간 변경",
              "• 같은 건물 계량기의 경우 유효년월 디폴트 자동 설정",
              "• 유효년월 필수값으로 지정",
              "• 목록에서 조정기 등록 관련 불필요 메시지 비표시 처리",
            ],
          },
          {
            title: "조정기 계획교체",
            lines: [
              "• 안전일지 작성 실패 시 오류코드 표시",
            ],
          },
          {
            title: "공통 / 기타",
            lines: [
              "• 조정기 개요화면 지번주소 village 항목 추가",
              "• 사진대장 OZ 리포트에서 사진 미표시 현상 수정 (공개 외부 저장소 경로 전달)",
              "• 파일 존재 여부 확인 및 에러 처리 추가",
              "• 개발자 모드 추가",
              "• 7-Zip 경로 탐색 및 오류 처리 포함한 배포 스크립트 개선",
            ],
          },
        ].map(({ title, lines }) => ({
          component: "Collapsible",
          props: { title },
          children: [
            {
              component: "Stack",
              props: { direction: "vertical", gap: "sm", align: "stretch" },
              children: lines.map((l) => text(l, "muted")),
            },
          ],
        })),
      ],
    },
  ],
};

// ─── 비트코인 시뮬레이션 작업내역 Dialog ──────────────────
const bitcoinWorkDialog = {
  component: "ScrollableDialog",
  props: {
    title: "비트코인 시뮬레이션 작업 내역",
    description: "2024 ~ 현재 · 프론트엔드 + 백엔드 Git 커밋 기반",
    openPath: "/bitcoinWorkOpen",
  },
  children: [
    {
      component: "Stack",
      props: { direction: "vertical", gap: "lg", align: "stretch" },
      children: [
        ...[
          {
            title: "프론트엔드 UI/UX",
            lines: [
              "• 글로벌 뉴스 서비스 UI 구현 (Gemini key manager, newsApi, 뉴스 탭/목록/상세)",
              "• DeepLearningPanel 분리 — 1361줄 → 622줄 + DLServerTrainingTab / DLPredictionTab / DLModelsTab",
              "• DLModelsTab F1 / AUC / Precision / Recall 표시 추가",
              "• KISAccountDialog · PortfolioDashboard 에러 상태 UI 표시",
              "• AutomationSettingsPanel UI 문구 실제 구조에 맞게 수정",
              "• 자동매매 로그 화면 추가 · 로그창 최대화/축소 토글",
              "• TickerTabBar 우클릭 메뉴 · 서버 아이콘 우클릭 기능",
              "• 햄버거 메뉴 · 타이틀바 window controls 제거",
              "• 한투 계좌 개설 및 키 발급 안내 화면",
              "• 달력 UI 수정 · 휴장일 정보 기능",
            ],
          },
          {
            title: "성능 최적화 / 리팩토링",
            lines: [
              "• Zustand 스토어 분리 — 7개 도메인 훅 (useUIStore, useKISStore, useAnalysisStore 등)",
              "• useShallow 셀렉터 7개 컴포넌트 적용 — 불필요한 리렌더링 방지",
              "• batchUpdateRealtimePrices 분리 → realtimeHelpers.js 추출",
              "• runMarketAnalysis 순차 API → Promise.allSettled 병렬 처리 (최대 5x 속도)",
              "• PortfolioDashboard 캐시 + 병렬 처리 적용",
              "• WebSocket 메모리 누수 수정 — stopRealtimeAnalysis async 전환",
              "• DeepLearningPanel 폴링 fetch에 AbortController 추가",
              "• useEffect 의존성 배열 누락 수정 (6건)",
            ],
          },
          {
            title: "백엔드 WebSocket / 통신",
            lines: [
              "• 백엔드 FastAPI 서버에 직접 WebSocket 연결",
              "• /api/reschedule Vercel 프록시 구현 및 에러 처리 개선",
              "• 서버 로그 확인용 Vercel 서버리스 함수 추가",
              "• 서버 헬스체크 기능 · 재기동 중 offline 표시",
              "• Gemini AI 스트리밍 프록시 추가 (복수 모델 지원)",
              "• Gemini 다중 API key 등록 및 자동 로테이션",
              "• 카카오 연동 — 카카오톡으로 리포트 발송",
            ],
          },
          {
            title: "AI/ML — XGBoost · 딥러닝",
            lines: [
              "• XGBoost 기반 학습 및 예측 API 추가 (FastAPI)",
              "• XGBoost 학습 데이터 랜덤 split → 시간순 split (데이터 누수 방지)",
              "• XGBoost 평가 지표 F1 / Precision / Recall / AUC 계산 및 저장",
              "• Supabase 모델 관리 체계 도입 (사용자 지정 이름 저장)",
              "• 대용량 학습 데이터 Supabase Storage 연동",
              "• indicator_service MACD(12/26/9) 지표 추가",
              "• nasdaqtrader.com FTP로 종목 소스 교체 (~6000종목)",
              "• 학습 로직 백엔드로 이전 (프론트 부하 제거)",
            ],
          },
          {
            title: "자동매매 / 리스크 관리",
            lines: [
              "• 백엔드 자동매매 크론 구현 (vercel cron → 백엔드 서버)",
              "• 손실 중 매도 방지 옵션 추가",
              "• 매도 신호 OR 조건 지원 — 로그에 발동 조건 표시",
              "• 자동매매 리스크 관리 3종 수정 (이슈 #40~#42)",
              "• is_active=true 전체 실행 버그 수정 (첫 번째만 실행되던 오류)",
              "• 실행 시간 동적 변경 기능",
              "• KIS API 자동매매 소수점 문자열 → int 변환 오류 수정",
            ],
          },
          {
            title: "뉴스 크롤러 / 카카오 리포트",
            lines: [
              "• 증권 뉴스 서비스 기반 구현 (미국 주식 S&P500/나스닥 중심)",
              "• 뉴스 크롤러 URL 및 CSS 셀렉터 수정",
              "• 구직 크롤러 자동화 추가 (잡코리아·점핏 포함)",
              "• 채용 리포트 압축·링크·필터 개선",
              "• 카카오 리포트 고도화 — 매도/매수 티커별 확률 상세 추가",
            ],
          },
        ].map(({ title, lines }) => ({
          component: "Collapsible",
          props: { title },
          children: [
            {
              component: "Stack",
              props: { direction: "vertical", gap: "sm", align: "stretch" },
              children: lines.map((l) => text(l, "muted")),
            },
          ],
        })),
      ],
    },
  ],
};

// ─── 섹션: 프로젝트 ─────────────────────────────────────
const projectCard = (
  title: string,
  date: string,
  description: string,
  desc: string,
  tags: string[],
  hasDemo = false
) => ({
  component: "Card",
  props: { title, description },
  children: [
    text(date, "caption"),
    text(desc, "muted"),
    badgeRow(...tags),
    ...(hasDemo
      ? [{
          component: "Stack",
          props: { direction: "horizontal", gap: "sm" },
          children: [
            { component: "Button", props: { label: "데모", variant: "primary" } },
          ],
        }]
      : []),
  ],
});

const siProjects = {
  component: "Stack",
  props: { direction: "vertical", gap: "sm" },
  children: [
    heading("🏗 SI (신규 구축)", "h3"),
    {
      component: "Grid",
      props: { columns: 2, gap: "md" },
      children: [
        {
          component: "Card",
          props: { title: "가스 링크 (GRM · 서울도시가스 자회사)", description: "가스 검침·점검 통합 모바일 플랫폼" },
          children: [
            text("2024.11.18 ~ 2026.01.27", "caption"),
            text("C언어 PDA 로직을 React로 전면 재구축. Native-Webview 바코드 스캐너 연동, 음영지역 오프라인 저장·자동 재전송 구현. 동접 500명 상용화.", "muted"),
            badgeRow("React.js", "Zustand", "TanStack Query"),
            {
              component: "Stack",
              props: { direction: "horizontal", gap: "sm" },
              children: [
                {
                  component: "Button",
                  props: { label: "작업내역 보기", variant: "secondary" },
                  on: { press: { action: "setState", params: { statePath: "/gasLinkWorkOpen", value: true } } },
                },
                {
                  component: "Button",
                  props: { label: "주요 화면", variant: "secondary" },
                  on: { press: { action: "setState", params: { statePath: "/gasLinkScreenshotsOpen", value: true } } },
                },
              ],
            },
          ],
        },
        projectCard(
          "OceanLook (에코마린)",
          "2023.08.21 ~ 2024.11.14",
          "수만 척 선박 실시간 해양 관제 시스템",
          "Nuxt 2→3 마이그레이션, 자체 타일 서버 구축(API 비용 100% 절감), Viewport 필터링·클러스터링으로 대규모 마커 최적화.",
          ["Nuxt.js", "Leaflet.js", "Docker", "CI/CD"],
          true
        ),
        projectCard(
          "IoT 항만물류 플랫폼",
          "2022.09.01 ~ 2023.04.30",
          "5초 주기 센서 데이터 실시간 수집·알림",
          "Mobius(oneM2M) 플랫폼 활용 대용량 IoT 데이터 파이프라인 구축. MQTT 외부 시스템 연동 게이트웨이 구현.",
          ["Node.js", "Mobius", "MQTT"]
        ),
        projectCard(
          "대신증권 마이데이터 API",
          "2021.01.01 ~ 2021.07.24",
          "금융권 표준 OpenAPI 데이터 제공 시스템",
          "금융보안원 테스트베드 통과. 마이데이터 표준 규격 엄수 및 무결점 API 서비스 제공.",
          ["Java", "D-Bridge", "OpenAPI"]
        ),
        projectCard(
          "KRX 대용량 다운로드 센터",
          "2020.06.01 ~ 2020.07.31",
          "한국거래소 전용 대용량 파일 전송 앱",
          "Electron 기반 이어받기·순차 다운로드 대기열 구현. 네트워크 단절 상황에서도 데이터 무결성 보장.",
          ["Electron", "Node.js", "Vanilla JS"]
        ),
        projectCard(
          "북카페 구축 (한국동서발전소)",
          "2015.03.01 ~ 2016.08.31",
          "도서 대여 자동화 키오스크 시스템",
          "DB 설계, 서버, 앱, 키오스크까지 1인 Full-Stack 개발. 바코드/RFID 하드웨어 제어 및 네이버 검색 API 연동.",
          ["Android", "Spring", "MSSQL"]
        ),
        projectCard(
          "O2O 세탁 서비스 (온웨어)",
          "2017.01.01 ~ 2017.11.30",
          "수거-세탁-배송 워크플로우 모바일 앱",
          "안드로이드 앱 전담 개발. Swagger 도입으로 문서 중심 개발 문화 정착.",
          ["Android", "Swagger", "REST API"]
        ),
      ],
    },
  ],
};

const smProjects = {
  component: "Stack",
  props: { direction: "vertical", gap: "sm" },
  children: [
    heading("🔧 SM (운영·유지보수)", "h3"),
    {
      component: "Grid",
      props: { columns: 2, gap: "md" },
      children: [
        {
          component: "Card",
          props: { title: "FMS (서울도시가스)", description: "모바일 현장관리 시스템 운영·유지보수" },
          children: [
            text("2026.01 ~ 현재", "caption"),
            text("bizMOB 기반 하이브리드 앱. 대용량계량기·조정기계획교체·시설전·자산실사 모듈 유지보수. OZ 리포트 연동 및 SQLite 로컬 DB 관리.", "muted"),
            badgeRow("bizMOB", "SQLite", "Hybrid App", "OZ Report"),
            {
              component: "Button",
              props: { label: "작업내역 보기", variant: "secondary" },
              on: { press: { action: "setState", params: { statePath: "/fmsWorkOpen", value: true } } },
            },
          ],
        },
        projectCard(
          "KRX 홈페이지 운영",
          "2018.01.02 ~ 2019.12.31",
          "한국거래소 홈페이지 무중단 운영",
          "자체 프레임워크 분석 및 기능 개발. APM(Scouter) 고도화 및 이중화 서버 관리로 무중단 서비스 달성.",
          ["자체 프레임워크", "Scouter", "Oracle"]
        ),
        projectCard(
          "IPR ENT 고도화 (아이오코드)",
          "2021.08.02 ~ 2021.12.31",
          "프로세스 마이닝 분석 플랫폼 고도화",
          "Vue.js 기반 분석 플랫폼 UI/UX 개발. 기업/부서/등급별 세분화된 접근 제어 시스템 구축.",
          ["Vue.js", "Vuex", "REST API"]
        ),
        projectCard(
          "스마트제조혁신기술개발사업",
          "2022.01.01 ~ 2023.08.19",
          "AAS 기반 제조 자산 디지털 트윈 연구",
          "이기종 공장 간 데이터 공유를 위한 AAS 표준 모델 설계. 제조 설비 디지털 식별자 정의 및 인터페이스 설계.",
          ["AAS", "데이터 모델링"]
        ),
      ],
    },
  ],
};

const sideProjects = {
  component: "Stack",
  props: { direction: "vertical", gap: "sm" },
  children: [
    heading("🧩 외주 & 토이 프로젝트", "h3"),
    {
      component: "Grid",
      props: { columns: 2, gap: "md" },
      children: [
        projectCard(
          "실버허그",
          "2022.12 ~ 2023.01",
          "노인정 일정·Live 강의 접속 윈도우 앱 (첫 외주)",
          "어르신들이 웹 사용이 어려워 Electron 윈도우 앱으로 전환. cheerio 크롤링으로 일정 수집, 기존 웹 Live 버튼 연동. Nextron + Material UI 사용.",
          ["Electron", "Nextron", "Material UI", "cheerio"]
        ),
        {
          component: "Card",
          props: { title: "비트코인 시뮬레이션", description: "AI 기반 암호화폐 자동매매 시뮬레이터" },
          children: [
            text("2024 ~ 현재", "caption"),
            text("XGBoost · 딥러닝으로 가격 예측, 실시간 차트와 백테스팅 기능 제공.", "muted"),
            badgeRow("Next.js", "FastAPI", "XGBoost"),
            {
              component: "Stack",
              props: { direction: "horizontal", gap: "sm" },
              children: [
                { component: "LinkButton", props: { label: "실행", href: "https://simulation-inpiniti.vercel.app/", target: "_blank" } },
                {
                  component: "Button",
                  props: { label: "작업내역 보기", variant: "secondary" },
                  on: { press: { action: "setState", params: { statePath: "/bitcoinWorkOpen", value: true } } },
                },
              ],
            },
          ],
        },
        projectCard(
          "글로벌 뉴스 대시보드",
          "2024 ~ 현재",
          "Gemini AI로 요약하는 실시간 뉴스 피드",
          "News API 기사를 Gemini로 요약·카테고리 분류하는 React Native 앱.",
          ["React Native", "Gemini API", "Expo"]
        ),
      ],
    },
  ],
};

const projects = {
  component: "Stack",
  props: { direction: "vertical", gap: "lg" },
  children: [
    heading("프로젝트"),
    siProjects,
    smProjects,
    sideProjects,
  ],
};

// ─── 섹션: 기술 ─────────────────────────────────────────
const skills = {
  component: "Stack",
  props: { direction: "vertical", gap: "md" },
  children: [
    heading("기술"),
    {
      component: "Grid",
      props: { columns: 2, gap: "md" },
      children: [
        {
          component: "Card",
          props: { title: "프론트엔드" },
          children: [
            { component: "Progress", props: { label: "React / Vue / Nuxt", value: 95 } },
            { component: "Progress", props: { label: "TypeScript", value: 85 } },
            { component: "Progress", props: { label: "Leaflet.js (GIS)", value: 90 } },
            { component: "Progress", props: { label: "Electron", value: 60 } },
          ],
        },
        {
          component: "Card",
          props: { title: "모바일 / 백엔드" },
          children: [
            { component: "Progress", props: { label: "Android (Native/Hybrid)", value: 70 } },
            { component: "Progress", props: { label: "Node.js / Spring", value: 70 } },
            { component: "Progress", props: { label: "IoT (MQTT / Mobius)", value: 70 } },
            { component: "Progress", props: { label: "시계열 예측 / ML", value: 55 } },
          ],
        },
      ],
    },
    {
      component: "Card",
      props: { title: "도구 및 기타" },
      children: [
        {
          component: "Stack",
          props: { direction: "horizontal", gap: "sm" },
          children: [
            badge("Zustand / React Query", "default"),
            badge("Docker / CI/CD"),
            badge("Git / GitHub"),
            badge("Oracle / MSSQL", "outline"),
            badge("Claude Code", "default"),
            badge("MCP", "outline"),
          ],
        },
      ],
    },
  ],
};

// ─── 섹션: 연락처 ────────────────────────────────────────
const contact = {
  component: "Stack",
  props: { direction: "vertical", gap: "md" },
  children: [
    heading("연락처"),
    {
      component: "Alert",
      props: {
        type: "info",
        title: "함께 일해요!",
        message: "새로운 프로젝트나 협업 제안은 언제든지 환영합니다.",
      },
    },
    {
      component: "Grid",
      props: { columns: 2, gap: "md" },
      children: [
        {
          component: "Card",
          props: { title: "💬 카카오톡" },
          children: [
            text("카카오톡 ID: dhlxhfl"),
            { component: "Button", props: { label: "카카오톡으로 연락하기", variant: "primary" } },
          ],
        },
        {
          component: "Card",
          props: { title: "💻 GitHub" },
          children: [
            text("github.com/inpiniti"),
            { component: "Link", props: { label: "GitHub 프로필 보기", href: "https://github.com/inpiniti" } },
          ],
        },
        {
          component: "Card",
          props: { title: "💻 GitHub" },
          children: [
            text("github.com/inpiniti"),
            { component: "Link", props: { label: "GitHub 프로필 보기", href: "https://github.com/inpiniti" } },
          ],
        },
        {
          component: "Card",
          props: { title: "📝 블로그" },
          children: [
            text("개발 경험과 인사이트를 공유합니다"),
            { component: "Button", props: { label: "블로그 방문", variant: "secondary" } },
          ],
        },
      ],
    },
  ],
};

// ─── 섹션별 spec (다이얼로그는 해당 섹션에 co-locate) ───
const projectsWithDialogs = {
  ...projects,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: [...(projects.children as any[]), gasLinkScreenshotsDialog, gasLinkWorkDialog, fmsWorkDialog, bitcoinWorkDialog],
};

// 프로젝트 슬라이드: siProjects, smProjects, sideProjects 가 선언된 후 순서대로 정의
const projectSlides = [siProjects, smProjects, sideProjects];

const SECTIONS = [
  { id: "hero",       label: "TOP",      spec: hero,   dir: "up"    },
  { id: "about",      label: "소개",     spec: about,  dir: "left"  },
  { id: "experience", label: "경력",     spec: null,   dir: "up"    },
  { id: "projects",   label: "프로젝트", spec: null,   dir: "right" },
  { id: "skills",     label: "기술",     spec: skills, dir: "up"    },
  { id: "contact",    label: "연락처",   spec: contact, dir: "left" },
] as const;

const ease = [0.215, 0.61, 0.355, 1] as const;

export default function Home() {
  const [active, setActive] = useState(0);
  const [seen,   setSeen]   = useState<Set<number>>(() => new Set([0]));
  const containerRef        = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.min(Math.round(el.scrollTop / el.clientHeight), SECTIONS.length - 1);
      setActive(idx);
      setSeen(prev => prev.has(idx) ? prev : new Set([...prev, idx]));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: i * el.clientHeight, behavior: "smooth" });
  };

  return (
    <>
      {/* 사이드 내비게이션 도트 */}
      <nav
        className="fixed left-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-start gap-4"
        aria-label="섹션 내비게이션"
      >
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} aria-label={s.label} className="group flex items-center gap-2.5 cursor-pointer">
            <motion.span
              className="block rounded-full bg-foreground"
              style={{ width: 7, height: 7 }}
              animate={{ scale: active === i ? 1.8 : 1, opacity: active === i ? 1 : 0.28 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
            <span className="text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap select-none">
              {s.label}
            </span>
          </button>
        ))}
      </nav>

      {/* 풀스크린 세로 스냅 컨테이너 */}
      <div
        ref={containerRef}
        className="fixed inset-0 overflow-y-scroll scrollbar-none"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {SECTIONS.map((s, i) => {
          const hasSeen = seen.has(i);
          const xInit   = s.dir === "left" ? -80 : s.dir === "right" ? 80 : 0;
          const yInit   = s.dir === "up"   ? 60  : 0;

          return (
            <div
              key={s.id}
              id={s.id}
              className="h-screen overflow-y-auto relative"
              style={{ scrollSnapAlign: "start" }}
            >
              {i === 0 && <div className="absolute inset-0 hero-stripe-bg pointer-events-none" />}

              <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: xInit, y: yInit }}
                  animate={hasSeen ? { opacity: 1, x: 0, y: 0 } : {}}
                  transition={{ duration: 0.75, ease }}
                >
                  {s.id === "experience" && (
                    <WheelCardSlider heading="경력" slides={experienceSlides} />
                  )}
                  {s.id === "projects" && (
                    <>
                      <WheelCardSlider heading="프로젝트" slides={projectSlides} />
                      {/* dialogs: DOM에 존재해야 버튼 트리거 동작 */}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Renderer registry={registry} spec={toSpec({ component: "Stack", props: { direction: "vertical", gap: "sm" }, children: [gasLinkScreenshotsDialog, gasLinkWorkDialog, fmsWorkDialog, bitcoinWorkDialog] } as any)} />
                    </>
                  )}
                  {s.id !== "experience" && s.id !== "projects" && s.spec && (
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    <Renderer registry={registry} spec={toSpec(s.spec as any)} />
                  )}
                </motion.div>
              </div>

              {i === 0 && (
                <motion.div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={hasSeen ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.9, ease }}
                >
                  <span className="text-[10px] tracking-widest uppercase">Scroll</span>
                  <motion.span
                    className="text-lg"
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  >↓</motion.span>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
