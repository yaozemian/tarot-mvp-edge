import { getTarotCardById, tarotDeck } from "./tarot-data";
import { createLocalInterpretation } from "./interpret";
import type { DrawnCard, ReadingRecord } from "../types/tarot";

export function hydrateDrawnCard(item: DrawnCard): DrawnCard {
  const freshCard =
    getTarotCardById(item.card.id) ??
    tarotDeck.find((card) => card.name === item.card.name) ??
    tarotDeck.find((card) => card.zhName === item.card.zhName);

  if (!freshCard) {
    return item;
  }

  return {
    ...item,
    card: freshCard,
  };
}

export function hydrateReadingRecord(record: ReadingRecord): ReadingRecord {
  const cards = record.cards.map(hydrateDrawnCard);

  if (hasLegacyFallbackInterpretation(record)) {
    const local = createLocalInterpretation(record.question, cards);
    return {
      ...record,
      aiFullText: local.fullText,
      aiSummary: local.summary,
      cards,
    };
  }

  return {
    ...record,
    cards,
  };
}

function hasLegacyFallbackInterpretation(record: ReadingRecord) {
  const text = `${record.aiSummary}\n${record.aiFullText}`;

  return (
    text.includes("牌面像是一面镜子") ||
    text.includes("这次牌面像是一面镜子") ||
    text.includes("这组牌不是在给你一个脱离语境的通用答案") ||
    text.includes("帮助你把问题里的关键矛盾看得更清楚") ||
    text.includes("当前最卡的是") ||
    text.includes("代表的优势需要被具体呈现") ||
    text.includes("把优势转成可展示的行动成果")
  );
}
