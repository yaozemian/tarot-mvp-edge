import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, LinkButton } from "../components/Button";
import { Card, PageHeader } from "../components/Card";
import { consumeReading, getRemaining } from "../lib/limits";
import { savePendingReading } from "../lib/reading-storage";

const ERROR_TIMEOUT_MS = 3200;
const QUESTION_EXAMPLES = [
  "例如：我该不该主动联系他？",
  "例如：这份新工作适合我吗？",
  "例如：我和这个合作还有继续的必要吗？",
  "例如：我现在要不要做这个决定？",
  "例如：接下来这段关系会怎么发展？",
  "例如：我最近的状态为什么一直提不起来？",
];

function pickQuestionExample() {
  return QUESTION_EXAMPLES[Math.floor(Math.random() * QUESTION_EXAMPLES.length)];
}

export function HomePage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [questionExample] = useState(() => pickQuestionExample());
  const [remainingQuestion, setRemainingQuestion] = useState(3);
  const [remainingDaily, setRemainingDaily] = useState(1);

  useEffect(() => {
    setRemainingQuestion(getRemaining("question"));
    setRemainingDaily(getRemaining("daily"));
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = window.setTimeout(() => {
      setError("");
    }, ERROR_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [error]);

  function startQuestionReading(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = question.trim();

    if (!value) {
      setError("请先写下你想询问的问题。");
      return;
    }

    if (!consumeReading("question")) {
      setError("今天的问题占卜次数已用完，请明天再来。");
      return;
    }

    savePendingReading({ mode: "question", question: value });
    navigate("/reading");
  }

  function startDailyReading() {
    if (!consumeReading("daily")) {
      setError("今天的每日运势已经抽过了，请明天再来。");
      return;
    }

    savePendingReading({ mode: "daily", question: "我今天的整体运势如何？" });
    navigate("/reading");
  }

  return (
    <main className="page-shell">
      <PageHeader
        copy="输入一个正在困扰你的问题，或抽取今日运势。解读会保持温和、启发式，不替你做决定。"
        kicker="MVP Tarot Reading"
        title="把问题交给三张牌，让答案慢慢显影"
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <Card className="reveal-in">
          <form onSubmit={startQuestionReading}>
            <label className="text-sm font-semibold text-oracle-soft">
              你的问题
              <textarea
                className="mt-3 min-h-36 w-full rounded-[1.5rem] border border-oracle/20 bg-night/70 p-4 text-moon outline-none transition placeholder:text-mist/60 focus:border-oracle"
                onChange={(event) => {
                  setQuestion(event.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                placeholder={questionExample}
                value={question}
              />
            </label>
            {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="submit">开始占卜</Button>
              <Button onClick={startDailyReading} type="button" variant="secondary">
                每日运势
              </Button>
              <LinkButton to="/history" variant="ghost">
                历史记录
              </LinkButton>
            </div>
          </form>
        </Card>

        <Card className="reveal-in lg:mt-16">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-oracle">
            今日额度
          </p>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-oracle/10 pb-4">
              <span className="text-mist">问题占卜</span>
              <strong className="font-serif text-4xl text-moon">
                {remainingQuestion}/3
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-mist">每日运势</span>
              <strong className="font-serif text-4xl text-moon">
                {remainingDaily}/1
              </strong>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
