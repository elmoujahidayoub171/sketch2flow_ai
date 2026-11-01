import Link from "next/link";
import { ArrowRight, Blocks, Check, Download, GitBranch, MoveRight, Play, SlidersHorizontal, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/Button";

const features = [
  [Blocks, "Visual Workflow Builder", "Shape a clear automation plan on an infinite canvas."],
  [MoveRight, "Drag-and-Drop Components", "Start with proven building blocks and arrange them visually."],
  [GitBranch, "Smart Connections", "Make branches, joins, and handoffs easy to understand."],
  [SlidersHorizontal, "Workflow Configuration", "Tune node settings without leaving the diagram."],
  [Download, "Save and Export", "Persist work locally and export a portable workflow file."],
  [Sparkles, "Future AI-Powered Automation", "A stable visual graph today, with AI assistance planned later."],
];

const steps = ["Create a workflow", "Add components", "Connect nodes", "Configure properties", "Save and export"];

export default function LandingPage() {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;
  return <main className="min-h-screen overflow-hidden bg-[#090c12] text-slate-100">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link href="/" className="flex items-center gap-3 font-extrabold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-400/40 bg-violet-500/15 text-violet-300"><Workflow size={19} /></span><span>Sketch<span className="text-violet-300">2</span>Flow</span></Link>
      <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
        <a href="#features" className="transition hover:text-white">Features</a>
        <a href="#how-it-works" className="transition hover:text-white">How it works</a>
        {githubUrl ? <a href={githubUrl} target="_blank" rel="noreferrer" className="transition hover:text-white">GitHub</a> : <span className="cursor-not-allowed opacity-50" title="Repository link is not configured yet">GitHub <small>(soon)</small></span>}
      </div>
      <Link href="/dashboard"><Button variant="secondary">Launch editor <ArrowRight size={15} /></Button></Link>
    </nav>
    <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-10 lg:pt-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[130px]" />
      <div className="relative mx-auto max-w-3xl text-center">
        <div className="hero-reveal mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.18em] text-violet-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#6ee7b7]" />V1 visual workflow builder</div>
        <h1 className="hero-reveal text-5xl font-extrabold tracking-[-.06em] text-white sm:text-7xl">Turn Ideas into <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-200 bg-clip-text text-transparent">Intelligent Workflows.</span></h1>
        <p className="hero-reveal-delay mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">Design, connect, and organize automation workflows with an intuitive visual editor. From simple diagrams to intelligent automation.</p>
        <div className="hero-reveal-delay-2 mt-9 flex flex-wrap justify-center gap-3"><Link href="/editor/new"><Button variant="primary" className="px-6 py-3">Start Building <ArrowRight size={16} /></Button></Link><a href="#features"><Button variant="secondary" className="px-6 py-3">Explore Features</Button></a></div>
      </div>
      <div className="hero-reveal-delay-2 relative mx-auto mt-20 max-w-5xl rounded-2xl border border-slate-700/70 bg-[#0f141e] p-2 shadow-2xl shadow-violet-950/20">
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3"><span className="h-2 w-2 rounded-full bg-red-400/70" /><span className="h-2 w-2 rounded-full bg-amber-300/70" /><span className="h-2 w-2 rounded-full bg-emerald-300/70" /><span className="ml-3 font-mono text-[10px] text-slate-600">sketch2flow / welcome-workflow</span></div>
        <div className="relative h-[280px] overflow-hidden rounded-b-xl bg-[radial-gradient(#253148_1px,transparent_1px)] [background-size:22px_22px] sm:h-[350px]">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 320" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="edge-a" x1="0" x2="1"><stop offset="0%" stopColor="#9b7cff" /><stop offset="100%" stopColor="#67e8f9" /></linearGradient><linearGradient id="edge-b" x1="0" x2="1"><stop offset="0%" stopColor="#67e8f9" /><stop offset="100%" stopColor="#6ee7b7" /></linearGradient><linearGradient id="edge-c" x1="0" x2="1"><stop offset="0%" stopColor="#6ee7b7" /><stop offset="100%" stopColor="#f0abfc" /></linearGradient></defs>
            <path d="M 152 150 C 240 150 292 98 372 98" fill="none" stroke="url(#edge-a)" strokeWidth="2" className="preview-edge" />
            <path d="M 502 98 C 570 98 552 176 612 176" fill="none" stroke="url(#edge-b)" strokeWidth="2" className="preview-edge" />
            <path d="M 742 176 C 800 176 794 104 840 104" fill="none" stroke="url(#edge-c)" strokeWidth="2" className="preview-edge" />
          </svg>
          <div className="preview-node absolute left-[5%] top-[38%] w-32 rounded-xl border border-violet-400/40 bg-[#182033] p-3 shadow-xl sm:left-[8%] sm:w-36"><span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-violet-500/20 text-violet-300"><Play size={13} fill="currentColor" /></span><strong className="block text-xs">Webhook</strong><small className="text-[10px] text-slate-500">Receive an event</small></div>
          <div className="preview-node absolute left-[30%] top-[14%] w-32 rounded-xl border border-cyan-300/30 bg-[#182033] p-3 shadow-xl sm:w-36"><span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-cyan-400/15 text-cyan-200"><Sparkles size={14} /></span><strong className="block text-xs">AI Processing</strong><small className="text-[10px] text-slate-500">Prepare the payload</small></div>
          <div className="preview-node absolute left-[55%] top-[45%] w-32 rounded-xl border border-emerald-300/30 bg-[#182033] p-3 shadow-xl sm:w-36"><span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-emerald-400/15 text-emerald-200"><Check size={14} /></span><strong className="block text-xs">PostgreSQL</strong><small className="text-[10px] text-slate-500">Save the record</small></div>
          <div className="preview-node absolute left-[78%] top-[22%] hidden w-32 rounded-xl border border-fuchsia-300/30 bg-[#182033] p-3 shadow-xl sm:block sm:w-36"><span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-fuchsia-400/15 text-fuchsia-200"><MoveRight size={14} /></span><strong className="block text-xs">Notification</strong><small className="text-[10px] text-slate-500">Notify the team</small></div>
        </div>
      </div>
    </section>
    <section id="features" className="mx-auto max-w-7xl border-t border-slate-800/80 px-6 py-24 lg:px-10">
      <div className="max-w-xl"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-violet-300">Build with clarity</p><h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">A calmer way to plan automation.</h2></div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(([Icon, title, text]) => <div key={title as string} className="feature-card rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-600"><div className="mb-7 grid h-9 w-9 place-items-center rounded-lg bg-violet-400/10 text-violet-300"><Icon size={17} /></div><h3 className="font-semibold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text as string}</p></div>)}</div>
    </section>
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#151c2b] to-[#0d111a] p-8 sm:p-12"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-slate-500">How it works</p><div className="mt-8 grid gap-8 sm:grid-cols-5">{steps.map((step, index) => <div key={step} className="feature-card"><span className="font-mono text-xs text-violet-300">0{index + 1}</span><p className="mt-3 text-sm font-semibold text-slate-200">{step}</p></div>)}</div></div>
    </section>
    <footer id="footer" className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-slate-800/80 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
      <span>Sketch2Flow AI · Visual workflow design for thoughtful automation.</span>
      <div className="flex flex-wrap items-center gap-5"><a href="#features" className="transition hover:text-white">Features</a><a href="#how-it-works" className="transition hover:text-white">How it works</a><Link href="/dashboard" className="transition hover:text-white">Dashboard</Link>{githubUrl ? <a href={githubUrl} target="_blank" rel="noreferrer" className="transition hover:text-white">GitHub</a> : <span title="Repository link is not configured yet">GitHub (soon)</span>}</div>
    </footer>
  </main>;
}
