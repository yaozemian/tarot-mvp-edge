import { getTarotCardById, tarotDeck } from "./tarot-data";
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
  return {
    ...record,
    cards: record.cards.map(hydrateDrawnCard),
  };
}
