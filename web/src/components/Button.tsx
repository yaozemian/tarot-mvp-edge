import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-oracle text-night shadow-[0_14px_36px_rgba(201,168,106,0.24)] hover:bg-oracle-soft",
  secondary:
    "border border-oracle/30 bg-oracle/10 text-oracle-soft hover:bg-oracle/18",
  ghost: "text-mist hover:text-moon",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-full px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  children,
  className = "",
  to,
  variant = "primary",
}: {
  children: ReactNode;
  className?: string;
  to: string;
  variant?: Variant;
}) {
  return (
    <Link
      className={`inline-flex rounded-full px-5 py-3 text-sm font-bold transition ${variants[variant]} ${className}`}
      to={to}
    >
      {children}
    </Link>
  );
}
