import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "ai" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({ className = "", variant = "secondary", size = "md", loading = false, children, disabled, ...props }: ButtonProps) {
  const variants = {
    primary: "border border-accent/70 bg-accent text-white shadow-lg shadow-accent/20 hover:border-accent-soft hover:bg-accent-soft hover:text-ink",
    secondary: "border border-slate-200 bg-white text-slate-600 hover:border-accent/50 hover:bg-slate-50 hover:text-slate-950 dark:border-line dark:bg-surface-2/70 dark:text-slate-200 dark:hover:border-accent/50 dark:hover:bg-surface-2 dark:hover:text-white",
    ghost: "border border-transparent text-slate-500 hover:bg-surface-2 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
    ai: "border border-mint/30 bg-mint/10 text-emerald-700 hover:border-mint/60 hover:bg-mint/20 dark:text-mint",
    danger: "border border-danger/40 bg-danger/10 text-rose-600 hover:bg-danger/20 dark:text-danger",
  };
  const sizes = { sm: "gap-1.5 rounded-lg px-3 py-1.5 text-xs", md: "gap-2 rounded-xl px-4 py-2 text-sm", lg: "gap-2 rounded-xl px-5 py-2.5 text-sm" };
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
