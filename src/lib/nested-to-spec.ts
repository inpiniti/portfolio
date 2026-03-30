import type { ActionBinding, Spec } from "@json-render/core";

// nestedToFlat이 type을 "unknown"으로 설정하는 문제를 우회.
// 직접 flat spec 포맷으로 변환합니다.
type NestedSpec = {
  component: string;
  props?: Record<string, unknown>;
  on?: Record<string, ActionBinding | ActionBinding[]>;
  children?: NestedSpec[];
};

type FlatSpec = Spec;

let counter = 0;

function convert(node: NestedSpec, elements: FlatSpec["elements"]): string {
  const id = `el-${counter++}`;
  const childIds = (node.children ?? []).map((child) => convert(child, elements));

  elements[id] = {
    type: node.component,
    props: node.props ?? {},
    ...(node.on ? { on: node.on } : {}),
    children: childIds,
  };

  return id;
}

export function toSpec(nested: NestedSpec): FlatSpec {
  counter = 0;
  const elements: FlatSpec["elements"] = {};
  const root = convert(nested, elements);
  return { root, elements };
}
