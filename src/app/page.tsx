"use client";

import { Renderer } from "@json-render/react";
import { registry } from "@/lib/render-setup";
import { toSpec } from "@/lib/nested-to-spec";

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
    { component: "Avatar", props: { name: "김 인피니티", size: "lg" } },
    {
      component: "Stack",
      props: { direction: "vertical", gap: "sm" },
      children: [
        heading("김인피니티", "h1"),
        text("풀스택 개발자 · 10년차", "lead"),
        text("서버부터 화면까지, 사용자 경험을 중심에 두고 직접 만드는 개발자입니다.", "muted"),
        {
          component: "Stack",
          props: { direction: "horizontal", gap: "sm" },
          children: [
            badge("Next.js", "default"),
            badge("React"),
            badge("TypeScript"),
            badge("Python"),
            badge("FastAPI", "outline"),
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
          "안녕하세요! 저는 10년간 스타트업과 중견기업에서 웹 서비스를 개발해온 풀스택 개발자입니다. " +
            "프론트엔드는 React · Next.js, 백엔드는 FastAPI · Django를 주로 사용하며 " +
            "AI 모델 서빙과 데이터 파이프라인 구축 경험도 갖추고 있습니다."
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
          children: [heading("🎓 학력", "h3"), text("한국대학교 컴퓨터공학과"), text("2011 ~ 2015 졸업", "muted")],
        },
        {
          component: "Card",
          props: {},
          children: [heading("📍 위치", "h3"), text("서울, 대한민국"), text("원격 근무 가능", "muted")],
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
          props: { direction: "horizontal", gap: "md", align: "center" },
          children: [
            {
              component: "Stack",
              props: { direction: "vertical", gap: "sm" },
              children: [
                heading("테크스타트", "h3"),
                text("시니어 풀스택 개발자 · 2022 ~ 현재", "muted"),
                text(
                  "AI 기반 핀테크 SaaS 프론트엔드 아키텍처 설계 주도. Next.js App Router 도입으로 " +
                    "초기 로드 성능 40% 개선."
                ),
                badgeRow("Next.js 14", "FastAPI", "PostgreSQL", "AWS"),
              ],
            },
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
            heading("이커머스랩", "h3"),
            text("프론트엔드 개발자 · 2019 ~ 2022", "muted"),
            text(
              "월 거래액 500억 규모 이커머스 플랫폼 React 마이그레이션. " +
                "디자인 시스템 구축 및 컴포넌트 라이브러리 정비 담당."
            ),
            badgeRow("React", "Redux", "GraphQL"),
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
            heading("소프트하우스", "h3"),
            text("웹 개발자 · 2015 ~ 2019", "muted"),
            text(
              "Django 기반 B2B SaaS 솔루션 개발. " +
                "관공서 및 중소기업 대상 ERP 시스템 구축 프로젝트 다수 리드."
            ),
            badgeRow("Django", "MySQL", "jQuery"),
          ],
        },
      ],
    },
  ],
};

// ─── 섹션: 프로젝트 ─────────────────────────────────────
const projectCard = (
  title: string,
  description: string,
  desc: string,
  tags: string[],
  hasDemo = false
) => ({
  component: "Card",
  props: { title, description },
  children: [
    text(desc, "muted"),
    badgeRow(...tags),
    {
      component: "Stack",
      props: { direction: "horizontal", gap: "sm" },
      children: [
        { component: "Button", props: { label: "GitHub", variant: "secondary" } },
        ...(hasDemo ? [{ component: "Button", props: { label: "데모", variant: "primary" } }] : []),
      ],
    },
  ],
});

const projects = {
  component: "Stack",
  props: { direction: "vertical", gap: "md" },
  children: [
    heading("프로젝트"),
    {
      component: "Grid",
      props: { columns: 2, gap: "md" },
      children: [
        projectCard(
          "비트코인 시뮬레이션",
          "AI 기반 암호화폐 자동매매 시뮬레이터",
          "XGBoost · 딥러닝으로 가격 예측, 실시간 차트와 백테스팅 기능 제공.",
          ["Next.js", "FastAPI", "XGBoost"],
          true
        ),
        projectCard(
          "글로벌 뉴스 대시보드",
          "Gemini AI로 요약하는 실시간 뉴스 피드",
          "News API 기사를 Gemini로 요약 · 카테고리 분류하는 React Native 앱.",
          ["React Native", "Gemini API", "Expo"]
        ),
        projectCard(
          "FMS 가스관리 시스템",
          "검침 · 안전점검 통합 관리 플랫폼",
          "Oracle DB 기반 가스 설비 검침 · 요금 · 안전점검 데이터 통합 B2B 시스템.",
          ["Oracle", "MCP", "Spring"]
        ),
        projectCard(
          "AI 백엔드 서비스",
          "모델 학습 · 추론 API 서버",
          "XGBoost · LSTM · Transformer 모델 학습 및 서빙 FastAPI 마이크로서비스.",
          ["FastAPI", "Python", "WebSocket"]
        ),
      ],
    },
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
            { component: "Progress", props: { label: "React / Next.js", value: 95 } },
            { component: "Progress", props: { label: "TypeScript", value: 90 } },
            { component: "Progress", props: { label: "Tailwind CSS", value: 85 } },
            { component: "Progress", props: { label: "React Native", value: 70 } },
          ],
        },
        {
          component: "Card",
          props: { title: "백엔드 / 데이터" },
          children: [
            { component: "Progress", props: { label: "Python / FastAPI", value: 90 } },
            { component: "Progress", props: { label: "PostgreSQL / Oracle", value: 80 } },
            { component: "Progress", props: { label: "XGBoost / Scikit-learn", value: 75 } },
            { component: "Progress", props: { label: "Docker / AWS", value: 70 } },
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
            badge("Git / GitHub", "default"),
            badge("Vercel"),
            badge("Jira / Notion"),
            badge("Figma", "outline"),
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
          props: { title: "📧 이메일" },
          children: [
            text("inpiniti@example.com"),
            { component: "Button", props: { label: "이메일 보내기", variant: "primary" } },
          ],
        },
        {
          component: "Card",
          props: { title: "💬 카카오톡" },
          children: [
            text("카카오톡 ID: inpiniti"),
            { component: "Button", props: { label: "오픈채팅 바로가기", variant: "secondary" } },
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

// ─── 전체 페이지 조합 ────────────────────────────────────
const portfolioSpec = {
  component: "Stack",
  props: { direction: "vertical", gap: "lg" },
  children: [hero, sep, about, sep, experience, sep, projects, sep, skills, sep, contact],
};

const spec = toSpec(portfolioSpec);

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <Renderer registry={registry} spec={spec} />
    </main>
  );
}
