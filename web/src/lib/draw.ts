import { tarotDeck } from "./tarot-data";
import type { CardOrientation, CardPosition, DrawnCard } from "../types/tarot";

const positions: CardPosition[] = ["past", "present", "future"];

function randomOrientation(): CardOrientation {
  return Math.random() > 0.5 ? "upright" : "reversed";
}

export function drawThreeCards(): DrawnCard[] {
  const pool = [...tarotDeck];

  return positions.map((position) => {
    const index = Math.floor(Math.random() * pool.length);
    const [card] = pool.splice(index, 1);
    return { card, orientation: randomOrientation(), position };
  });
}
