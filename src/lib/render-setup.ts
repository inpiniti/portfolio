import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";

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

    // Input / Action
    Button: shadcnComponentDefinitions.Button,
    Link: shadcnComponentDefinitions.Link,

    // Feedback
    Skeleton: shadcnComponentDefinitions.Skeleton,
    Progress: shadcnComponentDefinitions.Progress,

    // Navigation
    Accordion: shadcnComponentDefinitions.Accordion,
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

    Button: shadcnComponents.Button,
    Link: shadcnComponents.Link,

    Skeleton: shadcnComponents.Skeleton,
    Progress: shadcnComponents.Progress,

    Accordion: shadcnComponents.Accordion,
  },
});
