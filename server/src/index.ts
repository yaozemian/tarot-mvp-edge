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

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: vars.get("OPENAI_MODEL") ?? "gpt-5.2",
        instructions:
          "你是 Luna Arcana Tarot 的中文塔罗解读助手。你的语气温和、清醒、有边界感。解读应是启发式心理提示，不做宿命化断言，不替用户做决定，不提供医疗、法律、投资等专业结论。只输出 JSON，格式为 {\"aiSummary\":\"...\",\"aiFullText\":\"...\"}。",
        input: buildInterpretationPrompt(question, mode, cards),
      }),
    });

    if (!response.ok) {
      return c.json({ error: "OpenAI interpretation failed." }, 502);
    }

    const data = (await response.json()) as { output_text?: string; output?: unknown };
    const text = data.output_text ?? extractOutputText(data.output);
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
      return `${positionLabels[item.position]}：${item.zhName} / ${item.name}（${orientationLabels[item.orientation]}）- ${meaning}`;
    })
    .join("\n");

  return [
    `占卜模式：${mode === "daily" ? "每日运势" : "问题占卜"}`,
    `用户问题：${question}`,
    "三张牌：",
    cardLines,
    "",
    "请生成中文解读：",
    "1. aiSummary 为 80 到 130 字，一段话。",
    "2. aiFullText 使用三段结构：总体结论、单牌解析、建议。",
    "3. 需要结合问题语境、过去/现在/未来位置、正逆位含义。",
    "4. 避免恐吓、绝对预言和命令式建议。",
  ].join("\n");
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
