import type { ReactNode } from "react";

type BadgeTone = "neutral" | "accent" | "mint" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-500 dark:border-line dark:bg-surface-2 dark:text-muted",
  accent: "border-violet-200 bg-violet-50 text-violet-700 dark:border-accent/30 dark:bg-accent/10 dark:text-accent-soft",
  mint: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-mint/30 dark:bg-mint/10 dark:text-emerald-300",
  warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-warning/30 dark:bg-warning/10 dark:text-warning",
  danger: "border-rose-200 bg-rose-50 text-rose-700 dark:border-danger/30 dark:bg-danger/10 dark:text-danger",
};

export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.12em] ${tones[tone]} ${className}`}>{children}</span>;
}
