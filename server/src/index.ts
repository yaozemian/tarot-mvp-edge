/**
 * EDGESPARK SERVER
 *
 * Define your Hono routes. The app is static — created once, reused across requests.
 *
 * SDK imports from 'edgespark' are per-request (backed by AsyncLocalStorage).
 * They can ONLY be used inside route handlers, not at the top level.
 *
 * ═══════════════════════════════════════════════════════════════════
 * PATH CONVENTIONS (Authentication)
 *
 * /api/*          → Login required (auth.user guaranteed)
 * /api/public/*   → Login optional (auth.user if logged in)
 * /api/webhooks/* → No auth check (handle verification yourself)
 * ═══════════════════════════════════════════════════════════════════
 */

import { db, secret, vars } from "edgespark";
import { auth } from "edgespark/http";
import { readingRecords } from "@defs";
import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";

type DrawnCardInput = {
  card?: {
    id?: unknown;
    name?: unknown;
    zhName?: unknown;
    meanings?: {
      upright?: unknown;
      reversed?: unknown;
    };
  };
  orientation?: unknown;
  position?: unknown;
};

type InterpretationResponse = {
  aiSummary: string;
  aiFullText: string;
};

type ReadingRecordInput = {
  id?: unknown;
  createdAt?: unknown;
  question?: unknown;
  mode?: unknown;
  cards?: unknown;
  aiSummary?: unknown;
  aiFullText?: unknown;
};

type NormalizedReadingRecord = {
  id: string;
  createdAt: string;
  question: string;
  mode: "question" | "daily";
  cards: unknown[];
  aiSummary: string;
  aiFullText: string;
};

const positionLabels: Record<string, string> = {
  past: "过去",
  present: "现在",
  future: "未来",
};

const orientationLabels: Record<string, string> = {
  upright: "正位",
  reversed: "逆位",
};

const app = new Hono()
  .get("/api/public/hello", (c) =>
    c.json({ message: "Hello from EdgeSpark! Spark your idea to the Edge." })
  )
  .get("/api/readings", async (c) => {
    const rows = await db
      .select()
      .from(readingRecords)
      .where(eq(readingRecords.userId, auth.user!.id))
      .orderBy(desc(readingRecords.createdAt))
      .limit(50);

    return c.json({ records: rows.map(rowToRecord) });
  })
  .get("/api/readings/:id", async (c) => {
    const id = c.req.param("id");
    const [row] = await db
      .select()
      .from(readingRecords)
      .where(and(eq(readingRecords.id, id), eq(readingRecords.userId, auth.user!.id)))
      .limit(1);

    if (!row) {
      return c.json({ error: "Reading record not found." }, 404);
    }

    return c.json({ record: rowToRecord(row) });
  })
  .post("/api/readings", async (c) => {
    const body = (await c.req.json().catch(() => null)) as ReadingRecordInput | null;
    const record = normalizeReadingRecord(body);

    if (!record) {
      return c.json({ error: "Invalid reading record." }, 400);
    }

    const [saved] = await db
      .insert(readingRecords)
      .values({
        aiFullText: record.aiFullText,
        aiSummary: record.aiSummary,
        cardsJson: JSON.stringify(record.cards),
        createdAt: record.createdAt,
        id: record.id,
        mode: record.mode,
        question: record.question,
        userId: auth.user!.id,
      })
      .onConflictDoUpdate({
        target: readingRecords.id,
        set: {
          aiFullText: record.aiFullText,
          aiSummary: record.aiSummary,
          cardsJson: JSON.stringify(record.cards),
          mode: record.mode,
          question: record.question,
        },
      })
      .returning();

    return c.json({ record: rowToRecord(saved) }, 201);
  })
  .post("/api/public/interpret", async (c) => {
    const apiKey = secret.get("OPENAI_API_KEY");

    if (!apiKey) {
      return c.json({ error: "OpenAI API key is not configured." }, 503);
    }

    const body = await c.req.json().catch(() => null);
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const mode = body?.mode === "daily" ? "daily" : "question";
    const cards = normalizeCards(body?.cards);

    if (!question || cards.length !== 3) {
      return c.json({ error: "Question and three cards are required." }, 400);
    }

    const result = await requestOpenAiInterpretation(
      apiKey,
      vars.get("OPENAI_MODEL") ?? "gpt-4.1-mini",
      buildInterpretationPrompt(question, mode, cards),
    );

    if (!result.ok) {
      console.error("OpenAI interpretation failed", result.detail);
      return c.json({ detail: result.detail, error: "OpenAI interpretation failed." }, 502);
    }

    const text = result.text;
    const interpretation = parseInterpretation(text);

    if (!interpretation) {
      return c.json({ error: "OpenAI returned an invalid interpretation." }, 502);
    }

    return c.json(interpretation);
  });

// Example: Get all posts
// .get('/api/posts', async (c) => {
//   const allPosts = await db.select().from(posts);
//   return c.json({ posts: allPosts });
// })

// Example: Create post
// .post('/api/posts', async (c) => {
//   const data = await c.req.json();
//   await db.insert(posts).values({ title: data.title, content: data.content });
//   return c.json({ success: true }, 201);
// })

// Example: Background task (doesn't block response)
// .post('/api/analytics', async (c) => {
//   const event = await c.req.json();
//   ctx.runInBackground(logEvent(event));
//   return c.json({ ok: true });
// })

export default app;

function normalizeReadingRecord(
  record: ReadingRecordInput | null,
): NormalizedReadingRecord | null {
  if (!record) {
    return null;
  }

  const id = typeof record.id === "string" ? record.id : "";
  const createdAt = typeof record.createdAt === "string" ? record.createdAt : "";
  const question = typeof record.question === "string" ? record.question.trim() : "";
  const mode =
    record.mode === "daily" || record.mode === "question" ? record.mode : null;
  const aiSummary = typeof record.aiSummary === "string" ? record.aiSummary : "";
  const aiFullText = typeof record.aiFullText === "string" ? record.aiFullText : "";
  const cards = Array.isArray(record.cards) ? record.cards : [];

  if (!id || !createdAt || !question || !mode || !aiSummary || !aiFullText || cards.length !== 3) {
    return null;
  }

  return { aiFullText, aiSummary, cards, createdAt, id, mode, question };
}

function rowToRecord(row: typeof readingRecords.$inferSelect) {
  return {
    aiFullText: row.aiFullText,
    aiSummary: row.aiSummary,
    cards: JSON.parse(row.cardsJson),
    createdAt: row.createdAt,
    id: row.id,
    mode: row.mode,
    question: row.question,
  };
}

function normalizeCards(cards: unknown) {
  if (!Array.isArray(cards)) {
    return [];
  }

  return cards
    .map((item: DrawnCardInput) => {
      const position = typeof item.position === "string" ? item.position : "";
      const orientation = typeof item.orientation === "string" ? item.orientation : "";
      const card = item.card ?? {};
      const meanings = card.meanings ?? {};

      return {
        name: typeof card.name === "string" ? card.name : "",
        zhName: typeof card.zhName === "string" ? card.zhName : "",
        position,
        orientation,
        uprightMeaning: typeof meanings.upright === "string" ? meanings.upright : "",
        reversedMeaning: typeof meanings.reversed === "string" ? meanings.reversed : "",
        id: typeof card.id === "string" ? card.id : "",
      };
    })
    .filter(
      (item) =>
        item.name &&
        item.zhName &&
        positionLabels[item.position] &&
        orientationLabels[item.orientation],
    );
}

function buildInterpretationPrompt(
  question: string,
  mode: "question" | "daily",
  cards: ReturnType<typeof normalizeCards>,
) {
  const cardLines = cards
    .map((item) => {
      const meaning =
        item.orientation === "upright" ? item.uprightMeaning : item.reversedMeaning;
      return `${positionLabels[item.position]}：${item.zhName} / ${item.name}${item.id ? ` [${item.id}]` : ""}（${orientationLabels[item.orientation]}）- ${meaning}`;
    })
    .join("\n");

  const modeGuide =
    mode === "daily"
      ? "用户是在问今天的状态，请把问题落到今天可以观察、调整和行动的事情上。"
      : "用户是在问一个具体问题，请直接围绕这个问题回应，不要写成通用运势。";

  return [
    `占卜模式：${mode === "daily" ? "每日运势" : "问题占卜"}`,
    `用户问题：${question}`,
    `解读焦点：${modeGuide}`,
    "三张牌：",
    cardLines,
    "",
    "请生成中文解读：",
    "1. aiSummary 为 80 到 130 字，一段话。",
    "2. aiSummary 必须明确点到用户问题里的关键词，不能只说成长、关系、节奏、边界这类泛化词。",
    "3. aiFullText 使用四段结构：问题核心、单牌解析、牌阵合读、下一步建议。",
    "4. 问题核心：先用 2 到 3 句说明你理解到的具体困惑，并直接回应这个问题。",
    "5. 单牌解析：每张牌都要说明它和用户问题的具体关系，而不只是复述牌义。",
    "6. 牌阵合读：说明三张牌之间的张力、转折或递进关系。",
    "7. 下一步建议：给 2 到 3 个可执行的小建议，必须贴合问题场景。",
    "8. 不要套用固定模板，不要生成和其他问题也能通用的解读。",
    "9. 避免恐吓、绝对预言和命令式建议。",
  ].join("\n");
}

async function requestOpenAiInterpretation(
  apiKey: string,
  preferredModel: string,
  input: string,
) {
  const fallbackModel = "gpt-4.1-mini";
  const models = Array.from(new Set([preferredModel, fallbackModel]));
  const failures: string[] = [];

  for (const model of models) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        instructions:
          "你是 Luna Arcana Tarot 的中文塔罗解读助手。你的语气温和、清醒、有边界感。解读应是启发式心理提示，不做宿命化断言，不替用户做决定，不提供医疗、法律、投资等专业结论。只输出 JSON，格式为 {\"aiSummary\":\"...\",\"aiFullText\":\"...\"}。",
        model,
      }),
    });

    const data = (await response.json().catch(() => null)) as {
      error?: { message?: string };
      output?: unknown;
      output_text?: string;
    } | null;

    if (response.ok && data) {
      return {
        ok: true as const,
        text: data.output_text ?? extractOutputText(data.output),
      };
    }

    const message = data?.error?.message ?? response.statusText;
    failures.push(`${model}: ${response.status} ${message}`);

    if (response.status === 401 || response.status === 429) {
      break;
    }
  }

  return {
    detail: failures.join(" | "),
    ok: false as const,
    text: "",
  };
}

function extractOutputText(output: unknown): string {
  if (!Array.isArray(output)) {
    return "";
  }

  return output
    .flatMap((item) => {
      if (
        typeof item === "object" &&
        item !== null &&
        "content" in item &&
        Array.isArray(item.content)
      ) {
        return item.content;
      }
      return [];
    })
    .map((content) => {
      if (
        typeof content === "object" &&
        content !== null &&
        "text" in content &&
        typeof content.text === "string"
      ) {
        return content.text;
      }
      return "";
    })
    .join("");
}

function parseInterpretation(text: string): InterpretationResponse | null {
  try {
    const parsed = JSON.parse(text) as Partial<InterpretationResponse>;
    if (typeof parsed.aiSummary === "string" && typeof parsed.aiFullText === "string") {
      return {
        aiFullText: parsed.aiFullText,
        aiSummary: parsed.aiSummary,
      };
    }
  } catch {
    return null;
  }

  return null;
}
