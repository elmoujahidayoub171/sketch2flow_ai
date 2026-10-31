import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" };

export function Button({ className = "", variant = "secondary", ...props }: ButtonProps) {
  const styles = { primary: "bg-violet-500 text-white shadow-lg shadow-violet-500/20 hover:bg-violet-400", secondary: "border border-slate-700 bg-slate-900/70 text-slate-200 hover:border-slate-500 hover:bg-slate-800", ghost: "text-slate-400 hover:bg-slate-800 hover:text-white" };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${styles[variant]} disabled:cursor-not-allowed disabled:opacity-40 ${className}`} {...props} />;
}
