import type { DrawnCard, ReadingMode } from "../types/tarot";

type AiInterpretation = {
  aiSummary: string;
  aiFullText: string;
};

export async function createAiInterpretation(
  question: string,
  mode: ReadingMode,
  cards: DrawnCard[],
): Promise<AiInterpretation> {
  const response = await fetch("/api/public/interpret", {
    body: JSON.stringify({ cards, mode, question }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("AI interpretation failed");
  }

  return (await response.json()) as AiInterpretation;
}
