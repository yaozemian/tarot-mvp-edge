export type ReadingMode = "question" | "daily";

export type CardPosition = "past" | "present" | "future";

export type CardOrientation = "upright" | "reversed";

export type TarotCard = {
  id: string;
  name: string;
  zhName: string;
  image: string;
  imageUrl?: string;
  meanings: {
    upright: string;
    reversed: string;
  };
};

export type DrawnCard = {
  card: TarotCard;
  position: CardPosition;
  orientation: CardOrientation;
};

export type ReadingRecord = {
  id: string;
  createdAt: string;
  question: string;
  mode: ReadingMode;
  cards: DrawnCard[];
  aiSummary: string;
  aiFullText: string;
};

export type PendingReading = {
  question: string;
  mode: ReadingMode;
  cards?: DrawnCard[];
};
