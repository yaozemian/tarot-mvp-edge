import { useEffect, useState } from "react";
import { LinkButton } from "../components/Button";
import { Card, PageHeader } from "../components/Card";
import { getCloudReadingRecords } from "../lib/cloud-readings";
import { getReadingRecords } from "../lib/reading-storage";
import { useAuth } from "../hooks/useAuth";
import type { ReadingRecord } from "../types/tarot";

export function HistoryPage() {
  const { isAuthenticated, loading } = useAuth();
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [source, setSource] = useState<"cloud" | "local">("local");

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      setRecords(getReadingRecords());
      setSource("local");
      return;
    }

    getCloudReadingRecords()
      .then((nextRecords) => {
        setRecords(nextRecords);
        setSource("cloud");
      })
      .catch(() => {
        setRecords(getReadingRecords());
        setSource("local");
      });
  }, [isAuthenticated, loading]);

  return (
    <main className="page-shell">
      <div className="mb-6 flex flex-wrap gap-3">
        <LinkButton to="/" variant="ghost">
          返回首页
        </LinkButton>
        <LinkButton to="/login" variant="ghost">
          {isAuthenticated ? "账号中心" : "登录同步"}
        </LinkButton>
      </div>
      <PageHeader
        copy={
          source === "cloud"
            ? "你正在查看云端同步的历史记录。"
            : "当前显示本地历史。登录后，新记录会同步到云端。"
        }
        kicker="History"
        title="你曾经问过月光的问题"
      />

      {loading ? (
        <Card>
          <p className="text-mist">正在读取历史记录。</p>
        </Card>
      ) : records.length === 0 ? (
        <Card>
          <p className="text-mist">还没有历史记录。</p>
          <div className="mt-6">
            <LinkButton to="/">返回首页</LinkButton>
          </div>
        </Card>
      ) : (
        <section className="grid gap-4">
          {records.map((record) => (
            <Card
              className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              key={record.id}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-oracle">
                  {new Date(record.createdAt).toLocaleString("zh-CN")} ·{" "}
                  {record.mode === "daily" ? "每日运势" : "问题占卜"}
                </p>
                <h2 className="mt-3 font-serif text-3xl text-moon">{record.question}</h2>
                <p className="mt-3 text-sm leading-7 text-mist">{record.aiSummary}</p>
              </div>
              <LinkButton to={`/history/${record.id}`} variant="secondary">
                查看详情
              </LinkButton>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
