import type { DrawnCard } from "../types/tarot";

const positionLabels: Record<string, string> = {
  past: "过去",
  present: "现在",
  future: "未来",
};

const orientationLabels: Record<string, string> = {
  upright: "正位",
  reversed: "逆位",
};

export function TarotCardView({ index, item }: { index: number; item: DrawnCard }) {
  const meaning =
    item.orientation === "upright"
      ? item.card.meanings.upright
      : item.card.meanings.reversed;

  return (
    <article
      className="flip-in mystic-panel rounded-[2rem] p-5"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.24em] text-oracle">
        <span>{positionLabels[item.position]}</span>
        <span>{orientationLabels[item.orientation]}</span>
      </div>
      <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.5rem] border border-oracle/20 bg-night/70 p-4 text-center">
        {item.card.imageUrl ? (
          <img
            alt={`${item.card.zhName} ${item.card.name}`}
            className="float-card aspect-[2.75/4.75] max-h-80 w-full max-w-44 rounded-xl object-cover shadow-oracle"
            loading="lazy"
            src={item.card.imageUrl}
          />
        ) : (
          <div className="float-card text-7xl text-oracle">{item.card.image}</div>
        )}
        <h2 className="mt-5 font-serif text-4xl text-moon">{item.card.zhName}</h2>
        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-mist">
          {item.card.name}
        </p>
      </div>
      <p className="mt-5 text-sm leading-7 text-mist">{meaning}</p>
    </article>
  );
}
