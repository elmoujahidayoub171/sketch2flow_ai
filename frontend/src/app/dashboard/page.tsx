"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, Copy, FileDown, FileJson, FolderKanban, LayoutDashboard, LayoutTemplate, MessageSquare, Moon, MoreHorizontal, Pencil, Plus, Search, Settings, ShieldCheck, Sparkles, Sun, Trash2, Workflow, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useThemeStore } from "@/features/theme/theme-store";
import { downloadWorkflow } from "@/features/workflows/import-export";
import { workflowTemplates } from "@/features/workflows/templates";
import { useWorkflowStore, type WorkflowDocument } from "@/features/workflows/workflow-store";

type SortKey = "updated" | "created" | "name";

const reviewSteps = [
  { icon: ShieldCheck, label: "Review logic", detail: "Triggers, routing, configuration" },
  { icon: MessageSquare, label: "Resolve questions", detail: "Targeted node-level updates" },
  { icon: FileJson, label: "Compile JSON", detail: "Reviewable n8n artifact" },
];

export default function DashboardPage() {
  const router = useRouter();
  const hydrate = useWorkflowStore((state) => state.hydrate);
  const hydrated = useWorkflowStore((state) => state.hydrated);
  const workflows = useWorkflowStore((state) => state.workflows);
  const saveWorkflow = useWorkflowStore((state) => state.save);
  const removeWorkflow = useWorkflowStore((state) => state.remove);
  const duplicateWorkflow = useWorkflowStore((state) => state.duplicate);
  const { theme, toggleTheme } = useThemeStore();
  const hydrateTheme = useThemeStore((state) => state.hydrate);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [previewId, setPreviewId] = useState<string>();
  const [pendingDelete, setPendingDelete] = useState<string>();
  const [menuId, setMenuId] = useState<string>();
  const [renamingId, setRenamingId] = useState<string>();
  const [renameValue, setRenameValue] = useState("");
  const [notice, setNotice] = useState<string>();
  const renameCancelled = useRef(false);

  useEffect(() => { hydrate(); hydrateTheme(); }, [hydrate, hydrateTheme]);

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => (current === message ? undefined : current)), 2600);
  };

  const list = useMemo(() => Object.values(workflows)
    .filter((workflow) => `${workflow.name} ${workflow.description ?? ""}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : sort === "created" ? b.createdAt.localeCompare(a.createdAt) : b.updatedAt.localeCompare(a.updatedAt)), [query, sort, workflows]);

  const stats = useMemo(() => {
    const values = Object.values(workflows);
    const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      total: values.length,
      recent: values.filter((workflow) => new Date(workflow.updatedAt).getTime() >= recentCutoff).length,
      saved: values.length,
    };
  }, [workflows]);
  const previewTemplate = workflowTemplates.find((template) => template.id === previewId);
  const pendingWorkflow = pendingDelete ? workflows[pendingDelete] : undefined;
  const latest = list[0] ?? Object.values(workflows).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const date = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "Unknown" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
  };

  const createWorkflow = () => {
    const now = new Date().toISOString();
    const document: WorkflowDocument = {
      schemaVersion: "1.0",
      id: `workflow_${Date.now()}`,
      name: "Untitled workflow",
      nodes: [{ id: "manual-1", type: "workflow", position: { x: 160, y: 190 }, data: { kind: "trigger.manual", label: "Manual Trigger", description: "Start on demand", category: "trigger", color: "emerald", config: {} } }],
      edges: [],
      createdAt: now,
      updatedAt: now,
    };
    saveWorkflow(document);
    notify("Workflow created.");
    router.push(`/editor/${document.id}`);
  };

  const useTemplate = (templateId: string) => {
    const template = workflowTemplates.find((item) => item.id === templateId);
    if (!template) return;
    const copy = structuredClone(template.document);
    const now = new Date().toISOString();
    copy.id = `workflow_${Date.now()}`;
    copy.createdAt = now;
    copy.updatedAt = now;
    saveWorkflow(copy);
    notify(`Created from ${template.name}.`);
    router.push(`/editor/${copy.id}`);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const name = workflows[pendingDelete]?.name ?? "Workflow";
    removeWorkflow(pendingDelete);
    setPendingDelete(undefined);
    notify(`${name} deleted.`);
  };

  const duplicate = (id: string) => {
    const newId = duplicateWorkflow(id);
    setMenuId(undefined);
    notify(newId ? "Workflow duplicated." : "Unable to duplicate this workflow.");
  };

  const exportWorkflow = (workflow: WorkflowDocument) => {
    downloadWorkflow(workflow);
    setMenuId(undefined);
    notify("JSON exported.");
  };

  const startRename = (workflow: WorkflowDocument) => {
    setRenamingId(workflow.id);
    setRenameValue(workflow.name);
    setMenuId(undefined);
  };

  const commitRename = () => {
    if (!renamingId) return;
    const workflow = workflows[renamingId];
    const name = renameValue.trim();
    if (workflow && name) {
      saveWorkflow({ ...workflow, name, updatedAt: new Date().toISOString() });
      notify("Workflow renamed.");
    }
    setRenamingId(undefined);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-canvas dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-slate-200 bg-white p-4 dark:border-line dark:bg-[#0d1118] md:flex md:flex-col">
          <Link href="/" className="flex items-center gap-3 px-2 py-2 font-extrabold tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:border-accent/30 dark:bg-accent/10 dark:text-accent-soft"><Workflow size={18} /></span><span>Sketch<span className="text-violet-500 dark:text-accent-soft">2</span>Flow</span></Link>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-line dark:bg-surface/60">
            <p className="font-mono text-[9px] uppercase tracking-[.14em] text-slate-400 dark:text-slate-600">Workspace</p>
            <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">Local prototype</p>
            <p className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-500">Browser storage only. No database connected.</p>
          </div>
          <nav className="mt-6 space-y-1">
            <p className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[.15em] text-slate-400 dark:text-slate-600">Navigate</p>
            <NavItem icon={LayoutDashboard} label="Overview" active onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
            <NavItem icon={FolderKanban} label="My Workflows" onClick={() => window.document.getElementById("workflows")?.scrollIntoView({ behavior: "smooth" })} />
            <NavItem icon={Sparkles} label="Agent review" badge="Preview" onClick={() => window.document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })} />
            <NavItem icon={LayoutTemplate} label="Templates" onClick={() => window.document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })} />
            <NavItem icon={Settings} label="Settings" disabled />
          </nav>
          <div className="mt-auto space-y-2">
            <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-surface-2 dark:hover:text-white" aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}{theme === "dark" ? "Light theme" : "Dark theme"}</button>
            <p className="px-3 font-mono text-[9px] text-slate-400 dark:text-slate-700">V1 · local workspace</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-5 backdrop-blur dark:border-line dark:bg-canvas/85 sm:px-8">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-sm font-bold md:hidden"><Workflow size={16} className="text-violet-500 dark:text-accent-soft" />Sketch<span className="text-violet-500 dark:text-accent-soft">2</span>Flow</Link>
              <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[.12em] text-slate-400 dark:text-slate-600 md:flex"><span>Workspace</span><span>/</span><span className="text-slate-600 dark:text-slate-300">Overview</span></div>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button className="icon-button md:hidden" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} title="Toggle theme">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
              <Link href="/editor/new?tab=review" className="hidden sm:block"><Button variant="secondary" size="sm"><Sparkles size={14} />AI review</Button></Link>
              <Button variant="primary" size="sm" onClick={createWorkflow}><Plus size={15} />New workflow</Button>
            </div>
          </header>

          <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.18em] text-violet-500 dark:text-accent-soft">Workspace</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Your Workspace</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">Create, manage, and review automation workflows. Everything stays in this browser.</p>
              </div>
              <Link href="/editor/new"><Button variant="secondary">Open blank editor <ArrowRight size={15} /></Button></Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Stat icon={FolderKanban} label="Total Workflows" value={stats.total} detail="Stored locally" />
              <Stat icon={Clock3} label="Recently Edited" value={stats.recent} detail="Last 7 days" />
              <Stat icon={CheckCircle2} label="Saved Workflows" value={stats.saved} detail="Available offline" />
            </div>

            <section id="reviews" className="mt-10 scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-line dark:bg-surface">
              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><Badge tone="accent"><Sparkles size={11} />Agent review</Badge><span className="font-mono text-[9px] uppercase tracking-[.12em] text-slate-400 dark:text-slate-600">UI preview</span></div>
                  <h2 className="mt-4 text-xl font-bold tracking-tight">Review the flow before compiling.</h2>
                  <p className="mt-2 max-w-xl text-xs leading-6 text-slate-500 dark:text-slate-400">Open any workflow in the AI Review tab to inspect triggers, connectivity, configuration, and branch readiness. The mock agent asks targeted questions before producing n8n JSON.</p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {reviewSteps.map(({ icon: Icon, label, detail }) => <div key={label} className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-line dark:bg-surface-2/50"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-violet-500 dark:border-line dark:bg-surface dark:text-accent-soft"><Icon size={13} /></span><div><p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{label}</p><p className="mt-0.5 text-[9px] leading-4 text-slate-500 dark:text-slate-500">{detail}</p></div></div>)}
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:min-w-[190px]">
                  {latest ? <Link href={`/editor/${latest.id}?tab=review`}><Button variant="ai" className="w-full"><Sparkles size={14} />Review latest</Button></Link> : <Button variant="ai" onClick={createWorkflow}><Plus size={14} />Create to review</Button>}
                  <p className="text-center font-mono text-[9px] text-slate-400 dark:text-slate-600">{latest ? latest.name : "No workflows yet"}</p>
                  <Link href="#workflows" className="text-center text-[10px] font-semibold text-slate-500 transition hover:text-violet-500 dark:text-slate-400 dark:hover:text-accent-soft">Browse workflows</Link>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-3 dark:border-line dark:bg-surface-2/30 sm:px-6">
                <span className="font-mono text-[9px] uppercase tracking-[.12em] text-slate-400 dark:text-slate-600">Review surfaces</span>
                {["Readiness checks", "Agent questions", "Issues by node", "n8n preview"].map((label) => <span key={label} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] text-slate-500 dark:border-line dark:bg-surface dark:text-slate-400">{label}</span>)}
              </div>
            </section>

            <section id="workflows" className="mt-12 scroll-mt-24">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="text-xl font-bold tracking-tight">Recent workflows</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Search, sort, and manage your local workspace.</p></div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 dark:border-line dark:bg-surface"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workflows" aria-label="Search workflows" className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100" /></label>
                  <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-500 dark:border-line dark:bg-surface"><span className="font-mono text-[9px] uppercase tracking-wider">Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} aria-label="Sort workflows" className="cursor-pointer bg-transparent text-xs text-slate-900 outline-none dark:text-slate-100"><option value="updated">Last updated</option><option value="created">Newest</option><option value="name">Name</option></select></label>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {!hydrated && [0, 1, 2].map((index) => <div key={index} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-line dark:bg-surface" />)}
                {hydrated && list.map((workflow) => (
                  <article key={workflow.id} className={`workflow-card group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 dark:border-line dark:bg-surface dark:hover:border-slate-600 sm:flex-row sm:items-center sm:p-5 ${menuId === workflow.id ? "is-menu-open" : ""}`}>
                    <WorkflowThumbnail workflow={workflow} />
                    <div className="min-w-0 flex-1">
                      {renamingId === workflow.id
                        ? <input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} onBlur={() => { if (renameCancelled.current) { renameCancelled.current = false; return; } commitRename(); }} onKeyDown={(event) => { if (event.key === "Enter") commitRename(); if (event.key === "Escape") { renameCancelled.current = true; setRenamingId(undefined); } }} autoFocus aria-label="Workflow name" className="w-full rounded-md border border-violet-400 bg-slate-50 px-2 py-1 text-sm font-bold text-slate-900 outline-none dark:bg-[#0b1019] dark:text-slate-100" />
                        : <Link href={`/editor/${workflow.id}`} className="truncate text-sm font-bold hover:text-violet-500 dark:hover:text-accent-soft">{workflow.name}</Link>}
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-500"><span>{workflow.nodes.length} nodes</span><span className="text-slate-300 dark:text-slate-700">·</span><span>{workflow.edges.length} connections</span><span className="rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-slate-400 dark:border-line dark:text-slate-600">Draft</span></p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 dark:text-slate-600"><span>Created {date(workflow.createdAt)}</span><span className="text-slate-300 dark:text-slate-700">·</span><span className="flex items-center gap-1"><Clock3 size={10} />Updated {date(workflow.updatedAt)}</span></p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/editor/${workflow.id}?tab=review`} className="hidden items-center gap-1.5 rounded-lg border border-mint/30 bg-mint/10 px-2.5 py-2 text-[11px] font-semibold text-emerald-700 transition hover:border-mint/60 hover:bg-mint/20 dark:text-mint sm:flex" title="Review with the AI agent"><Sparkles size={13} />Review</Link>
                      <Link href={`/editor/${workflow.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-400/50 hover:text-violet-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-accent/50 dark:hover:text-accent-soft">Open</Link>
                      <div className="action-menu-wrap">
                        <button className="card-action" onClick={() => setMenuId((current) => current === workflow.id ? undefined : workflow.id)} title="Workflow actions" aria-label={`Actions for ${workflow.name}`} aria-expanded={menuId === workflow.id}><MoreHorizontal size={16} /></button>
                        {menuId === workflow.id && <>
                          <div className="fixed inset-0 z-30" onClick={() => setMenuId(undefined)} />
                          <div className="action-menu" role="menu">
                            <Link href={`/editor/${workflow.id}`} role="menuitem"><ArrowRight size={13} />Open</Link>
                            <Link href={`/editor/${workflow.id}?tab=review`} role="menuitem"><Sparkles size={13} />Review with AI</Link>
                            <button role="menuitem" onClick={() => startRename(workflow)}><Pencil size={13} />Rename</button>
                            <button role="menuitem" onClick={() => duplicate(workflow.id)}><Copy size={13} />Duplicate</button>
                            <button role="menuitem" onClick={() => exportWorkflow(workflow)}><FileDown size={13} />Export JSON</button>
                            <button role="menuitem" className="danger-menu-item" onClick={() => { setPendingDelete(workflow.id); setMenuId(undefined); }}><Trash2 size={13} />Delete</button>
                          </div>
                        </>}
                      </div>
                    </div>
                  </article>
                ))}
                {hydrated && !list.length && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-line">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-500 dark:border-accent/30 dark:bg-accent/10 dark:text-accent-soft"><Workflow size={20} /></div>
                    <h3 className="mt-4 text-sm font-bold">{Object.keys(workflows).length ? "No matching workflows" : "No workflows yet."}</h3>
                    <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">{Object.keys(workflows).length ? "Try a different search term or clear the filter." : "Create your first workflow and start connecting your ideas."}</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2"><Button variant="primary" onClick={createWorkflow}><Plus size={15} />New workflow</Button><Button variant="secondary" onClick={() => window.document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}>Browse templates</Button></div>
                  </div>
                )}
              </div>
            </section>

            <section id="templates" className="mt-16 scroll-mt-24">
              <div className="flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-violet-500 dark:text-accent-soft">Starting points</p><h2 className="mt-2 text-xl font-bold tracking-tight">Workflow templates</h2><p className="mt-1 text-xs text-slate-500">Preview a real graph and create an editable copy.</p></div><span className="font-mono text-[10px] text-slate-400">{workflowTemplates.length} templates</span></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {workflowTemplates.map((template) => (
                  <article key={template.id} className="template-card flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 dark:border-line dark:bg-surface dark:hover:border-slate-600">
                    <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold">{template.name}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{template.description}</p></div><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:bg-surface-2">{template.document.nodes.length} steps</span></div>
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">{template.document.nodes.map((node, index) => <span key={node.id} className="flex items-center gap-1.5">{index > 0 && <ArrowRight size={11} className="text-slate-400" />}<span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600 dark:border-line dark:bg-surface-2/60 dark:text-slate-300">{String(node.data.label)}</span></span>)}</div>
                    <div className="mt-auto flex items-center gap-2 pt-5"><Button variant="primary" size="sm" onClick={() => useTemplate(template.id)}>Use template</Button><button className="text-xs font-semibold text-slate-500 transition hover:text-violet-500 dark:hover:text-accent-soft" onClick={() => setPreviewId(template.id)}>Preview graph</button></div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      {notice && <div className="toast" role="status" aria-live="polite">{notice}</div>}

      {previewTemplate && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setPreviewId(undefined)}>
          <div className="dialog-card dialog-wide" role="dialog" aria-modal="true" aria-labelledby="template-title" onClick={(event) => event.stopPropagation()}>
            <div className="dialog-heading"><div><span className="eyebrow">Template preview</span><h2 id="template-title">{previewTemplate.name}</h2><p className="mt-2 text-xs leading-5 text-slate-500">{previewTemplate.description}</p></div><button className="icon-button" onClick={() => setPreviewId(undefined)} aria-label="Close preview"><X size={16} /></button></div>
            <div className="mt-5 flex flex-wrap items-center gap-2">{previewTemplate.document.nodes.map((node, index) => <span key={node.id} className="flex items-center gap-2">{index > 0 && <ArrowRight size={13} className="text-slate-400" />}<span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">{String(node.data.label)}</span></span>)}</div>
            <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={() => setPreviewId(undefined)}>Close</Button><Button variant="primary" onClick={() => useTemplate(previewTemplate.id)}>Use this template <ArrowRight size={14} /></Button></div>
          </div>
        </div>
      )}

      {pendingWorkflow && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setPendingDelete(undefined)}>
          <div className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="delete-title" onClick={(event) => event.stopPropagation()}>
            <div className="dialog-heading"><div><span className="eyebrow">Confirm</span><h2 id="delete-title">Delete workflow?</h2></div><button className="icon-button" onClick={() => setPendingDelete(undefined)} aria-label="Close confirmation"><X size={16} /></button></div>
            <p className="mt-4 text-xs leading-6 text-slate-500">“{pendingWorkflow.name}” will be removed from this browser. This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={() => setPendingDelete(undefined)}>Cancel</Button><Button variant="danger" onClick={confirmDelete}><Trash2 size={14} />Delete</Button></div>
          </div>
        </div>
      )}
    </main>
  );
}

function NavItem({ icon: Icon, label, active = false, disabled = false, badge, onClick }: { icon: typeof LayoutTemplate; label: string; active?: boolean; disabled?: boolean; badge?: string; onClick?: () => void }) {
  return <button disabled={disabled} onClick={onClick} title={disabled ? "Coming soon" : undefined} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${active ? "bg-violet-500/10 text-violet-700 dark:bg-accent/10 dark:text-accent-soft" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-surface-2 dark:hover:text-white"} disabled:cursor-not-allowed disabled:opacity-40`}><Icon size={16} />{label}{badge && <span className="ml-auto rounded border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-violet-500 dark:border-accent/20 dark:bg-accent/10 dark:text-accent-soft">{badge}</span>}{disabled && <span className="ml-auto font-mono text-[9px]">soon</span>}</button>;
}

function Stat({ icon: Icon, label, value, detail }: { icon: typeof FolderKanban; label: string; value: number; detail: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-line dark:bg-surface"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><Icon size={15} className="text-slate-400 dark:text-slate-600" /></div><div className="mt-4 flex items-end justify-between gap-2"><strong className="block text-2xl font-bold">{value}</strong><span className="font-mono text-[9px] text-slate-400 dark:text-slate-600">{detail}</span></div></div>;
}

const thumbnailColors: Record<string, string> = { violet: "#9b7cff", emerald: "#51c9a6", amber: "#e4ad54", cyan: "#4ebed1", blue: "#60a5fa", slate: "#94a3b8" };

function WorkflowThumbnail({ workflow }: { workflow: WorkflowDocument }) {
  if (!workflow.nodes.length) {
    return <div className="workflow-thumb grid h-14 w-20 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400 dark:border-line dark:bg-[#0b1019] dark:text-slate-600"><Workflow size={16} /></div>;
  }
  const xs = workflow.nodes.map((node) => node.position.x);
  const ys = workflow.nodes.map((node) => node.position.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const rangeX = Math.max(Math.max(...xs) - minX, 1);
  const rangeY = Math.max(Math.max(...ys) - minY, 1);
  const points = new Map(workflow.nodes.map((node) => [node.id, { x: 12 + ((node.position.x - minX) / rangeX) * 76, y: 12 + ((node.position.y - minY) / rangeY) * 40 }]));
  return (
    <svg viewBox="0 0 100 64" className="workflow-thumb h-14 w-20 shrink-0 rounded-lg border border-slate-200 bg-slate-50 dark:border-line dark:bg-[#0b1019]" aria-hidden="true">
      {workflow.edges.map((edge) => {
        const source = points.get(edge.source);
        const target = points.get(edge.target);
        return source && target ? <line key={edge.id} x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke="#64748b" strokeWidth="1" className="workflow-thumb-edge" /> : null;
      })}
      {workflow.nodes.map((node) => {
        const point = points.get(node.id);
        return point ? <rect key={node.id} x={point.x - 5} y={point.y - 3} width="10" height="6" rx="2" fill={thumbnailColors[String(node.data.color)] ?? "#94a3b8"} /> : null;
      })}
    </svg>
  );
}
