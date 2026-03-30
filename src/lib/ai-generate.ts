import { catalog } from "./render-setup";
import Anthropic from "@anthropic-ai/sdk";

// AI 시스템 프롬프트 - catalog.prompt()가 shadcn 컴포넌트 목록/스키마를 자동 포함
export function getSystemPrompt() {
  return `You are a UI generator for a personal portfolio website.
Generate a JSON spec using ONLY the components defined in this catalog.
Do NOT invent new component names. Do NOT use HTML tags directly.
Output nested JSON (not JSONL patches). Respond with valid JSON only, no markdown.

Available components: ${catalog.componentNames.join(", ")}

Component schema:
${JSON.stringify(catalog.jsonSchema(), null, 2)}`;
}

const client = new Anthropic();

export async function generateUI(userPrompt: string) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: getSystemPrompt(),
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // 마크다운 코드블록 제거
  const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error(`Invalid JSON from AI: ${clean.slice(0, 200)}`);
  }
}
