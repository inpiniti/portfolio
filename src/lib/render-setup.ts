import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { ScrollableDialog } from "@/components/ScrollableDialog";
import { LinkButton } from "@/components/LinkButton";

// 포트폴리오에서 사용할 shadcn 컴포넌트만 명시적으로 선택
export const catalog = defineCatalog(schema, {
  components: {
    // Layout
    Card: shadcnComponentDefinitions.Card,
    Stack: shadcnComponentDefinitions.Stack,
    Grid: shadcnComponentDefinitions.Grid,
    Separator: shadcnComponentDefinitions.Separator,

    // Content
    Heading: shadcnComponentDefinitions.Heading,
    Text: shadcnComponentDefinitions.Text,
    Badge: shadcnComponentDefinitions.Badge,
    Avatar: shadcnComponentDefinitions.Avatar,
    Alert: shadcnComponentDefinitions.Alert,

    // Navigation
    Tabs: shadcnComponentDefinitions.Tabs,
    Accordion: shadcnComponentDefinitions.Accordion,
    Collapsible: shadcnComponentDefinitions.Collapsible,

    // Input / Action
    Button: shadcnComponentDefinitions.Button,
    Link: shadcnComponentDefinitions.Link,

    // Feedback
    Skeleton: shadcnComponentDefinitions.Skeleton,
    Progress: shadcnComponentDefinitions.Progress,

    // Overlay
    Dialog: shadcnComponentDefinitions.Dialog,
    ScrollableDialog: shadcnComponentDefinitions.Dialog, // 동일 props, 스크롤 지원 커스텀 래퍼
    LinkButton: shadcnComponentDefinitions.Link, // href + target 지원 버튼 스타일 링크
  },
  actions: {},
});

export const { registry } = defineRegistry(catalog, {
  components: {
    Card: shadcnComponents.Card,
    Stack: shadcnComponents.Stack,
    Grid: shadcnComponents.Grid,
    Separator: shadcnComponents.Separator,

    Heading: shadcnComponents.Heading,
    Text: shadcnComponents.Text,
    Badge: shadcnComponents.Badge,
    Avatar: shadcnComponents.Avatar,
    Alert: shadcnComponents.Alert,

    Tabs: shadcnComponents.Tabs,
    Accordion: shadcnComponents.Accordion,
    Collapsible: shadcnComponents.Collapsible,

    Button: shadcnComponents.Button,
    Link: shadcnComponents.Link,

    Skeleton: shadcnComponents.Skeleton,
    Progress: shadcnComponents.Progress,

    Dialog: shadcnComponents.Dialog,
    ScrollableDialog: ScrollableDialog,
    LinkButton: LinkButton,
  },
});
