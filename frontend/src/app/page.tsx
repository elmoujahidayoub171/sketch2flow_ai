import Link from "next/link";
import { ArrowRight, Blocks, Check, CheckCircle2, Database, Download, FileJson, GitBranch, MessageSquare, MoveRight, Play, ShieldCheck, SlidersHorizontal, Sparkles, Workflow, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const features = [
  [Blocks, "Visual Workflow Builder", "Shape a clear automation plan on an infinite canvas."],
  [MoveRight, "Drag-and-Drop Components", "Start with proven building blocks and arrange them visually."],
  [GitBranch, "Smart Connections", "Make branches, joins, and handoffs easy to understand."],
  [SlidersHorizontal, "Workflow Configuration", "Tune node settings without leaving the diagram."],
  [Download, "Save and Export", "Persist work locally and export a portable workflow file."],
  [Sparkles, "Agent Review Preview", "Inspect readiness, answer questions, and compile n8n JSON."],
];

const reviewSteps = [
  { icon: ShieldCheck, title: "Review the logic", text: "The agent checks triggers, connectivity, configuration, and branch completeness." },
  { icon: MessageSquare, title: "Resolve questions", text: "Missing settings become focused questions tied to the exact node that needs attention." },
  { icon: FileJson, title: "Compile n8n JSON", text: "Once the graph is ready, compile a reviewable artifact without leaving the editor." },
];

const steps = ["Create a workflow", "Add components", "Connect nodes", "Configure properties", "Review and export"];

export default function LandingPage() {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;
  return (
    <main className="landing-shell dark min-h-screen overflow-hidden bg-ink text-slate-100">
      <nav className="relative z-20 border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-extrabold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent-soft"><Workflow size={18} /></span><span>Sketch<span className="text-accent-soft">2</span>Flow</span><span className="hidden rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-muted sm:inline">V1</span></Link>
          <div className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-white">Product</a>
            <a href="#agent-review" className="transition hover:text-white">Agent review</a>
            <a href="#how-it-works" className="transition hover:text-white">How it works</a>
            {githubUrl ? <a href={githubUrl} target="_blank" rel="noreferrer" className="transition hover:text-white">GitHub</a> : <span className="cursor-not-allowed opacity-50" title="Repository link is not configured yet">GitHub</span>}
          </div>
          <Link href="/dashboard"><Button variant="primary" size="sm">Open workspace <ArrowRight size={14} /></Button></Link>
        </div>
      </nav>

      <section className="hero-grid relative mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-10 lg:pt-24">
        <div className="relative z-10 grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr]">
          <div>
            <div className="hero-reveal"><Badge tone="mint"><span className="h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_10px_#5fe3c0]" />Visual builder · Agent review preview</Badge></div>
            <h1 className="hero-reveal-delay mt-7 max-w-2xl text-5xl font-extrabold leading-[1.02] tracking-[-.06em] text-white sm:text-6xl lg:text-7xl">Turn Ideas into <span className="bg-gradient-to-r from-accent-soft via-violet-300 to-mint bg-clip-text text-transparent">Intelligent Workflows.</span></h1>
            <p className="hero-reveal-delay mt-7 max-w-xl text-base leading-8 text-slate-400">Design, connect, and review automation workflows in one focused workspace. The visual graph stays local; the agent reviews the logic before anything is compiled.</p>
            <div className="hero-reveal-delay-2 mt-9 flex flex-wrap gap-3">
              <Link href="/editor/new"><Button variant="primary" size="lg">Start building <ArrowRight size={16} /></Button></Link>
              <a href="#agent-review"><Button variant="secondary" size="lg"><Sparkles size={15} />See the review flow</Button></a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[.12em] text-slate-500">
              <span className="flex items-center gap-2"><Check size={12} className="text-mint" />Local-first workspace</span>
              <span className="flex items-center gap-2"><Check size={12} className="text-mint" />No database required</span>
              <span className="flex items-center gap-2"><Check size={12} className="text-mint" />Review before compile</span>
            </div>
          </div>

          <div className="hero-reveal-delay-2 relative">
            <div className="absolute -inset-8 rounded-[2rem] bg-accent/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/90 shadow-panel">
              <div className="flex items-center gap-2 border-b border-line bg-surface-2/80 px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-danger/70" /><span className="h-2 w-2 rounded-full bg-warning/70" /><span className="h-2 w-2 rounded-full bg-mint/70" />
                <span className="ml-3 font-mono text-[10px] text-slate-500">sketch2flow / order-routing</span>
                <span className="ml-auto flex items-center gap-1.5 rounded-full border border-mint/30 bg-mint/10 px-2 py-1 font-mono text-[9px] text-mint"><span className="h-1 w-1 rounded-full bg-mint" />local</span>
              </div>
              <div className="relative h-[320px] bg-[radial-gradient(#202838_1px,transparent_1px)] [background-size:22px_22px] sm:h-[360px]">
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 620 360" preserveAspectRatio="none" aria-hidden="true">
                  <defs><linearGradient id="edge-a" x1="0" x2="1"><stop offset="0%" stopColor="#5fe3c0" /><stop offset="100%" stopColor="#8b7cf6" /></linearGradient><linearGradient id="edge-b" x1="0" x2="1"><stop offset="0%" stopColor="#8b7cf6" /><stop offset="100%" stopColor="#f3b35b" /></linearGradient></defs>
                  <path d="M 144 180 C 210 180 214 108 282 108" fill="none" stroke="url(#edge-a)" strokeWidth="2" className="preview-edge" />
                  <path d="M 412 108 C 476 108 462 200 526 200" fill="none" stroke="url(#edge-b)" strokeWidth="2" className="preview-edge" />
                </svg>
                <div className="preview-node absolute left-[4%] top-[42%] w-32 rounded-xl border border-mint/30 bg-[#151b24] p-3 shadow-xl sm:w-36"><span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-mint/10 text-mint"><Play size={13} fill="currentColor" /></span><strong className="block text-xs">Webhook</strong><small className="text-[10px] text-slate-500">Receive an event</small></div>
                <div className="preview-node absolute left-[42%] top-[18%] w-32 rounded-xl border border-accent/30 bg-[#151b24] p-3 shadow-xl sm:w-36"><span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-accent/10 text-accent-soft"><Sparkles size={14} /></span><strong className="block text-xs">Normalize</strong><small className="text-[10px] text-slate-500">Prepare the payload</small></div>
                <div className="preview-node absolute bottom-[13%] left-[36%] hidden w-36 rounded-xl border border-violet-400/30 bg-[#151b24] p-3 shadow-xl sm:block"><span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-violet-500/15 text-violet-300"><Database size={13} /></span><strong className="block text-xs">PostgreSQL</strong><small className="text-[10px] text-slate-500">Save the record</small></div>
                <div className="preview-node absolute right-[4%] top-[52%] hidden w-32 rounded-xl border border-warning/30 bg-[#151b24] p-3 shadow-xl sm:block sm:w-36"><span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-warning/10 text-warning"><MoveRight size={13} /></span><strong className="block text-xs">Notify</strong><small className="text-[10px] text-slate-500">Alert the team</small></div>

                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-line bg-[#0c1119]/95 p-3 shadow-panel backdrop-blur sm:left-auto sm:w-[250px]">
                  <div className="flex items-center justify-between border-b border-line pb-2"><span className="flex items-center gap-2 text-[10px] font-bold text-slate-200"><Sparkles size={12} className="text-accent-soft" />AI review</span><span className="flex items-center gap-1 rounded-full border border-mint/30 bg-mint/10 px-2 py-0.5 font-mono text-[8px] text-mint"><CheckCircle2 size={9} />Ready</span></div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-[9px] text-slate-400"><Check size={10} className="text-mint" />Trigger and routing look complete</div>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400"><MessageSquare size={10} className="text-warning" />1 question about the webhook path</div>
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-2/60 px-2 py-2"><span className="flex items-center gap-1.5 text-[9px] text-slate-300"><FileJson size={10} className="text-accent-soft" />n8n JSON</span><span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[8px] text-accent-soft">compile</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative border-y border-line/70 bg-canvas/60 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div className="max-w-xl"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-accent-soft">Build with clarity</p><h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">A calmer way to plan automation.</h2></div><p className="max-w-sm text-sm leading-7 text-slate-500">A visual editing surface with a structured review loop, designed to stay understandable as the graph grows.</p></div>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([Icon, title, text]) => <div key={title as string} className="feature-card rounded-2xl border border-line bg-surface/70 p-5 hover:border-accent/30 hover:bg-surface"><div className="mb-8 grid h-9 w-9 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent-soft"><Icon size={17} /></div><h3 className="font-semibold text-slate-100">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text as string}</p></div>)}
          </div>
        </div>
      </section>

      <section id="agent-review" className="px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <Badge tone="accent"><Sparkles size={11} />Agent review</Badge>
            <h2 className="mt-5 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">Review the logic before you compile it.</h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">The review workspace is part of the editor. It summarizes readiness, asks targeted questions, and keeps every finding tied to a node on the canvas.</p>
            <div className="mt-8 space-y-3">
              {reviewSteps.map(({ icon: Icon, title, text }, index) => <div key={title} className="flex gap-4 rounded-xl border border-line bg-surface/60 p-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-accent-soft"><Icon size={16} /></div><div><p className="font-mono text-[9px] text-slate-600">0{index + 1}</p><h3 className="mt-1 text-sm font-bold text-slate-100">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div>)}
            </div>
            <Link href="/editor/new?tab=review" className="mt-8 inline-flex"><Button variant="ai">Try the review workspace <ArrowRight size={15} /></Button></Link>
          </div>
          <div className="relative rounded-2xl border border-line bg-surface p-4 shadow-panel sm:p-6">
            <div className="flex items-center justify-between border-b border-line pb-4"><div><p className="font-mono text-[9px] uppercase tracking-[.16em] text-slate-500">Agent</p><h3 className="mt-1 text-sm font-bold text-slate-100">Readiness review</h3></div><span className="agent-status is-needs_input">Needs input</span></div>
            <div className="agent-summary is-blocked mt-4"><Zap size={15} /><p>Resolve 1 blocking issue before compiling.</p></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[["Trigger", "pass"], ["Connectivity", "pass"], ["Configuration", "fail"], ["Logic paths", "warning"]].map(([label, state]) => <div key={label} className={`agent-check is-${state}`}><span className={`agent-check-icon is-${state}`}>{state === "pass" ? <Check size={11} /> : <ShieldCheck size={11} />}</span><div><strong>{label}</strong><small>{state === "pass" ? "Looks complete" : state === "fail" ? "Needs attention" : "Review recommended"}</small></div></div>)}
            </div>
            <div className="mt-4 rounded-lg border border-line bg-[#0c1119] p-3">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[10px] font-bold text-slate-200"><MessageSquare size={12} className="text-warning" />Needs your input</span><span className="font-mono text-[9px] text-slate-500">1 question</span></div>
              <p className="mt-3 text-[10px] leading-5 text-slate-400">What webhook path should “Incoming order” use?</p>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-2 py-2 text-[10px] text-slate-500">/incoming-order<span className="ml-auto rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[8px] text-accent-soft">focus node</span></div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-surface-2/50 p-3"><span className="flex items-center gap-2 text-[10px] text-slate-400"><FileJson size={13} className="text-accent-soft" />Compile after review</span><span className="font-mono text-[9px] text-slate-600">locked</span></div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="rounded-3xl border border-line bg-gradient-to-br from-surface to-canvas p-8 sm:p-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-slate-500">How it works</p><h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">From sketch to reviewed workflow.</h2></div><span className="font-mono text-[10px] text-slate-600">Create · Design · Connect · Review · Export</span></div>
          <div className="mt-10 grid gap-6 sm:grid-cols-5">{steps.map((step, index) => <div key={step} className="step-card"><span className="font-mono text-xs text-accent-soft">0{index + 1}</span><p className="mt-3 text-sm font-semibold text-slate-200">{step}</p><div className="mt-3 h-px w-full bg-line"><div className="h-px bg-accent/60" style={{ width: `${(index + 1) * 20}%` }} /></div></div>)}</div>
        </div>
      </section>

      <footer className="border-t border-line/70 px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2"><Workflow size={14} className="text-accent-soft" />Sketch2Flow AI · Visual workflow design for thoughtful automation.</span>
          <div className="flex flex-wrap items-center gap-5"><a href="#features" className="transition hover:text-white">Product</a><a href="#agent-review" className="transition hover:text-white">Agent review</a><Link href="/dashboard" className="transition hover:text-white">Workspace</Link>{githubUrl ? <a href={githubUrl} target="_blank" rel="noreferrer" className="transition hover:text-white">GitHub</a> : null}</div>
        </div>
      </footer>
    </main>
  );
}
