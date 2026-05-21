import { useEffect, useRef } from "react";
import { LinkButton } from "../components/Button";
import { Card, PageHeader } from "../components/Card";
import { client } from "../lib/edgespark";

export function LoginPage() {
  const authRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!authRef.current) {
      return;
    }

    const ui = client.authUI.mount(authRef.current, {
      redirectTo: "/history",
    });

    return () => ui.destroy();
  }, []);

  return (
    <main className="page-shell">
      <div className="mb-6">
        <LinkButton to="/" variant="ghost">
          返回首页
        </LinkButton>
      </div>
      <PageHeader
        copy="登录后，占卜历史会保存到云端。未登录也可以继续使用本地历史。"
        kicker="Account"
        title="登录同步你的牌面记录"
      />
      <Card className="max-w-xl">
        <div ref={authRef} />
      </Card>
    </main>
  );
}
