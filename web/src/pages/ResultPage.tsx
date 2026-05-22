import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LinkButton } from "../components/Button";
import { Card, PageHeader } from "../components/Card";
import { ShareImage } from "../components/ShareImage";
import { TarotCardView } from "../components/TarotCardView";
import { createAiInterpretation } from "../lib/ai-interpret";
import { saveCloudReadingRecord } from "../lib/cloud-readings";
import { createLocalInterpretation } from "../lib/interpret";
import {
  clearPendingReading,
  getPendingReading,
  saveReadingRecord,
} from "../lib/reading-storage";
import type { ReadingRecord } from "../types/tarot";

export function ResultPage() {
  const navigate = useNavigate();
  const [record, setRecord] = useState<ReadingRecord | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState("");

  useEffect(() => {
    const pending = getPendingReading();
    const cards = pending?.cards;

    if (!pending || !cards?.length) {
      navigate("/");
      return;
    }

    const reading = {
      cards,
      mode: pending.mode,
      question: pending.question,
    };

    clearPendingReading();

    let cancelled = false;

    async function buildRecord() {
      let interpretation: { aiFullText: string; aiSummary: string };

      try {
        interpretation = await createAiInterpretation(
          reading.question,
          reading.mode,
          reading.cards,
        );
      } catch {
        const local = createLocalInterpretation(reading.question, reading.cards);
        setFallbackNotice("真实 AI 暂时不可用，已先生成本地备用解读。");
        interpretation = {
          aiFullText: local.fullText,
          aiSummary: local.summary,
        };
      }

      if (cancelled) {
        return;
      }

      const nextRecord: ReadingRecord = {
        aiFullText: interpretation.aiFullText,
        aiSummary: interpretation.aiSummary,
        cards: reading.cards,
        createdAt: new Date().toISOString(),
        id: crypto.randomUUID(),
        mode: reading.mode,
        question: reading.question,
      };

      saveReadingRecord(nextRecord);
      void saveCloudReadingRecord(nextRecord).catch(() => {
        // Unauthenticated users and local previews keep the local record.
      });
      setRecord(nextRecord);
    }

    void buildRecord();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!record) {
    return (
      <main className="page-shell">
        <PageHeader kicker="Result" title="正在生成 AI 解读" />
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="mb-6">
        <LinkButton to="/" variant="ghost">
          返回首页
        </LinkButton>
      </div>
      <PageHeader
        copy={record.question}
        kicker={record.mode === "daily" ? "每日运势" : "问题占卜"}
        title="这次牌面给你的回应"
      />

      <section className="grid gap-4 md:grid-cols-3">
        {record.cards.map((item, index) => (
          <TarotCardView item={item} index={index} key={item.position} />
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.78fr]">
        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-oracle">
            AI 解读
          </p>
          {fallbackNotice ? (
            <p className="mt-3 rounded-2xl border border-oracle/20 bg-oracle/10 px-4 py-3 text-sm leading-6 text-mist">
              {fallbackNotice}
            </p>
          ) : null}
          <p className="mt-4 text-lg leading-8 text-oracle-soft">
            {record.aiSummary}
          </p>
          <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-7 text-mist">
            {record.aiFullText}
          </pre>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton to="/">再次占卜</LinkButton>
            <LinkButton to="/history" variant="secondary">
              查看历史
            </LinkButton>
          </div>
        </Card>
        <Card>
          <ShareImage record={record} />
        </Card>
      </section>
    </main>
  );
}
