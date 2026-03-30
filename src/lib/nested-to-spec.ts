// nestedToFlat이 type을 "unknown"으로 설정하는 문제를 우회.
// 직접 flat spec 포맷으로 변환합니다.
type NestedSpec = {
  component: string;
  props?: Record<string, unknown>;
  children?: NestedSpec[];
};

type FlatSpec = {
  root: string;
  elements: Record<string, {
    type: string;
    props: Record<string, unknown>;
    children: string[];
  }>;
};

let counter = 0;

function convert(node: NestedSpec, elements: FlatSpec["elements"]): string {
  const id = `el-${counter++}`;
  const childIds = (node.children ?? []).map((child) => convert(child, elements));

  elements[id] = {
    type: node.component,
    props: node.props ?? {},
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
