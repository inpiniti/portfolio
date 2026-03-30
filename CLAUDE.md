@AGENTS.md

# 포트폴리오 프로젝트 개발 원칙

## UI 개발 방식: json-render + shadcn/ui

이 프로젝트의 **모든 UI는 json-render 방식**으로 개발한다.

### 핵심 규칙

1. **컴포넌트는 오직 shadcn/ui만 사용**
   - `src/lib/render-setup.ts`에 정의된 catalog의 컴포넌트만 사용
   - 임의의 HTML 태그(`<div>`, `<p>` 등)를 직접 작성하지 않는다
   - shadcn 외 UI 라이브러리(MUI, Chakra 등)를 추가하지 않는다

2. **UI는 JSON spec으로 표현**
   - 컴포넌트 트리를 nested JSON으로 작성
   - `toSpec()` (`src/lib/nested-to-spec.ts`)으로 flat spec 변환
   - `<Renderer registry={registry} spec={spec} />`으로 렌더링

3. **새 컴포넌트가 필요할 때**
   - **반드시** `shadcnComponentDefinitions`에 있는지 먼저 확인 (`node -e "const s = require('@json-render/shadcn/catalog'); console.log(Object.keys(s.shadcnComponentDefinitions))"`)
   - 카탈로그에 있으면 `src/lib/render-setup.ts`에 추가 후 사용
   - 카탈로그에 없으면 shadcn/ui 공식 컴포넌트 목록 확인 (`npx shadcn@latest add <component>`)
   - shadcn/ui에도 없는 경우에만 커스텀 컴포넌트 정의

4. **AI 생성 UI**
   - `src/lib/ai-generate.ts`의 `generateUI(prompt)` 사용
   - catalog에 정의된 컴포넌트만 생성하도록 시스템 프롬프트로 제약됨

### 파일 구조

```
src/
  lib/
    render-setup.ts      # catalog + registry 정의 (shadcn 컴포넌트 선택)
    nested-to-spec.ts    # nested JSON → flat spec 변환 유틸
    ai-generate.ts       # Claude API로 UI JSON 생성
  app/
    providers.tsx        # JSONUIProvider 래퍼
    page.tsx             # 예시: JSON spec 기반 페이지
```

### 사용 패턴 예시

```tsx
import { Renderer } from "@json-render/react";
import { registry } from "@/lib/render-setup";
import { toSpec } from "@/lib/nested-to-spec";

const spec = toSpec({
  component: "Card",
  props: { title: "제목" },
  children: [
    { component: "Text", props: { variant: "body", children: "내용" } }
  ],
});

export default function Page() {
  return <Renderer registry={registry} spec={spec} />;
}
```

### 사용 가능한 shadcn 컴포넌트

`render-setup.ts`에 등록된 컴포넌트:
- **Layout**: Card, Stack, Grid, Separator
- **Content**: Heading, Text, Badge, Avatar, Alert
- **Navigation**: Tabs, Accordion
- **Action**: Button, Link
- **Feedback**: Skeleton, Progress
