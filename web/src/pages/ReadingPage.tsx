import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LinkButton } from "../components/Button";
import { Card, PageHeader } from "../components/Card";
import { TarotCardView } from "../components/TarotCardView";
import { drawThreeCards } from "../lib/draw";
import { getPendingReading, savePendingReading } from "../lib/reading-storage";
import type { DrawnCard } from "../types/tarot";

export function ReadingPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [phase, setPhase] = useState<"shuffle" | "reveal">("shuffle");

  useEffect(() => {
    const pending = getPendingReading();

    if (!pending) {
      navigate("/");
      return;
    }

    const timer = window.setTimeout(() => {
      const nextCards = drawThreeCards();
      savePendingReading({ ...pending, cards: nextCards });
      setCards(nextCards);
      setPhase("reveal");
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="page-shell">
      <div className="mb-6">
        <LinkButton to="/" variant="ghost">
          返回首页
        </LinkButton>
      </div>
      <PageHeader
        copy="过去、现在、未来会依次出现。请把它们当成提醒，而不是命令。"
        kicker="Drawing Cards"
        title={phase === "shuffle" ? "正在洗牌" : "牌面已经显现"}
      />

      {phase === "shuffle" ? (
        <Card className="mx-auto flex max-w-xl justify-center gap-4 py-16">
          {[0, 1, 2].map((item) => (
            <div
              className="shuffle-card h-52 w-32 rounded-[1.5rem] border border-oracle/30 bg-veil"
              key={item}
              style={{ animationDelay: `${item * 120}ms` }}
            />
          ))}
        </Card>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {cards.map((item, index) => (
              <TarotCardView item={item} index={index} key={item.position} />
            ))}
          </section>
          <div className="mt-8">
            <LinkButton to="/result">查看解读</LinkButton>
          </div>
        </>
      )}
    </main>
  );
}
