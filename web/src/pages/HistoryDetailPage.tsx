import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LinkButton } from "../components/Button";
import { Card, PageHeader } from "../components/Card";
import { ShareImage } from "../components/ShareImage";
import { TarotCardView } from "../components/TarotCardView";
import { getCloudReadingRecord } from "../lib/cloud-readings";
import { getReadingRecord } from "../lib/reading-storage";
import { useAuth } from "../hooks/useAuth";
import type { ReadingRecord } from "../types/tarot";

export function HistoryDetailPage() {
  const { id = "" } = useParams();
  const { isAuthenticated, loading } = useAuth();
  const [record, setRecord] = useState<ReadingRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    setLoaded(false);

    if (!isAuthenticated) {
      setRecord(getReadingRecord(id));
      setLoaded(true);
      return;
    }

    getCloudReadingRecord(id)
      .then(setRecord)
      .catch(() => setRecord(getReadingRecord(id)))
      .finally(() => setLoaded(true));
  }, [id, isAuthenticated, loading]);

  if (!loaded) {
    return (
      <main className="page-shell">
        <PageHeader kicker="History" title="正在读取历史记录" />
      </main>
    );
  }

  if (!record) {
    return (
      <main className="page-shell">
        <PageHeader kicker="Not Found" title="没有找到这条历史记录" />
        <LinkButton to="/history">返回历史</LinkButton>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="mb-6 flex flex-wrap gap-3">
        <LinkButton to="/" variant="ghost">
          返回首页
        </LinkButton>
        <LinkButton to="/history" variant="ghost">
          返回历史
        </LinkButton>
      </div>
      <PageHeader
        copy={new Date(record.createdAt).toLocaleString("zh-CN")}
        kicker={record.mode === "daily" ? "每日运势" : "问题占卜"}
        title={record.question}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {record.cards.map((item, index) => (
          <TarotCardView item={item} index={index} key={item.position} />
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.78fr]">
        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-oracle">
            解读
          </p>
          <p className="mt-4 text-lg leading-8 text-oracle-soft">
            {record.aiSummary}
          </p>
          <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-7 text-mist">
            {record.aiFullText}
          </pre>
        </Card>
        <Card>
          <ShareImage record={record} />
        </Card>
      </section>
    </main>
  );
}
