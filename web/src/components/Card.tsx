import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mystic-panel rounded-[2rem] p-6 ${className}`} {...props} />;
}

export function PageHeader({
  copy,
  kicker,
  title,
}: {
  copy?: ReactNode;
  kicker: string;
  title: string;
}) {
  return (
    <header className="reveal-in mb-10 pt-10">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-oracle">
        {kicker}
      </p>
      <h1 className="max-w-4xl font-serif text-5xl leading-[0.96] text-moon md:text-7xl">
        {title}
      </h1>
      {copy ? <p className="mt-6 max-w-2xl text-lg leading-8 text-mist">{copy}</p> : null}
    </header>
  );
}
