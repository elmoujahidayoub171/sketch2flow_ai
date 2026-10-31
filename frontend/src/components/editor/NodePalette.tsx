"use client";

import { useState } from "react";
import { Search, Zap, GitBranch, Send, Database, Plus, Settings2, X, Clock3, Mail, FileJson, Globe, ShieldCheck, Workflow } from "lucide-react";

export type PaletteNode = {
  kind: string;
  label: string;
  description: string;
  category: "Trigger" | "Logic" | "Action" | "Data" | "Utility";
  color: string;
  icon: typeof Zap;
};

export const paletteNodes: PaletteNode[] = [
  { kind: "trigger.manual", label: "Manual Trigger", description: "Start on demand", category: "Trigger", color: "violet", icon: Zap },
  { kind: "trigger.webhook", label: "Webhook", description: "Receive an HTTP event", category: "Trigger", color: "violet", icon: Zap },
  { kind: "trigger.schedule", label: "Schedule", description: "Run on a recurring schedule", category: "Trigger", color: "violet", icon: Clock3 },
  { kind: "trigger.email", label: "Email Trigger", description: "Start when an email arrives", category: "Trigger", color: "violet", icon: Mail },
  { kind: "trigger.form", label: "Form Submission", description: "Start from submitted data", category: "Trigger", color: "violet", icon: FileJson },
  { kind: "logic.if", label: "IF", description: "Branch on a condition", category: "Logic", color: "amber", icon: GitBranch },
  { kind: "logic.switch", label: "Switch", description: "Route between cases", category: "Logic", color: "amber", icon: GitBranch },
  { kind: "logic.merge", label: "Merge", description: "Join multiple branches", category: "Logic", color: "amber", icon: GitBranch },
  { kind: "logic.filter", label: "Filter", description: "Keep matching items", category: "Logic", color: "amber", icon: ShieldCheck },
  { kind: "logic.loop", label: "Loop", description: "Repeat for each item", category: "Logic", color: "amber", icon: Workflow },
  { kind: "action.http", label: "HTTP Request", description: "Call an external API", category: "Action", color: "cyan", icon: Send },
  { kind: "action.email", label: "Email", description: "Send a notification", category: "Action", color: "cyan", icon: Send },
  { kind: "action.slack", label: "Slack Message", description: "Post to a channel", category: "Action", color: "cyan", icon: Send },
  { kind: "action.discord", label: "Discord Message", description: "Send to a Discord channel", category: "Action", color: "cyan", icon: Send },
  { kind: "action.create-record", label: "Create Record", description: "Create an item in a service", category: "Action", color: "cyan", icon: Database },
  { kind: "action.update-record", label: "Update Record", description: "Update an existing item", category: "Action", color: "cyan", icon: Database },
  { kind: "action.code", label: "Code", description: "Transform data with logic", category: "Action", color: "cyan", icon: Settings2 },
  { kind: "action.approval", label: "Approval", description: "Pause for human review", category: "Action", color: "cyan", icon: ShieldCheck },
  { kind: "data.postgres", label: "PostgreSQL", description: "Read or write records", category: "Data", color: "emerald", icon: Database },
  { kind: "data.sheets", label: "Google Sheets", description: "Work with a spreadsheet", category: "Data", color: "emerald", icon: Database },
  { kind: "data.mysql", label: "MySQL", description: "Read or write records", category: "Data", color: "emerald", icon: Database },
  { kind: "data.mongodb", label: "MongoDB", description: "Work with documents", category: "Data", color: "emerald", icon: Database },
  { kind: "data.redis", label: "Redis", description: "Read or write cached data", category: "Data", color: "emerald", icon: Database },
  { kind: "data.file", label: "File", description: "Read or write a file", category: "Data", color: "emerald", icon: FileJson },
  { kind: "data.csv", label: "CSV", description: "Parse tabular data", category: "Data", color: "emerald", icon: FileJson },
  { kind: "utility.delay", label: "Delay", description: "Wait before continuing", category: "Utility", color: "slate", icon: Clock3 },
  { kind: "utility.set", label: "Set Fields", description: "Add or rename values", category: "Utility", color: "slate", icon: Settings2 },
  { kind: "utility.webhook-response", label: "Respond", description: "Return a webhook response", category: "Utility", color: "slate", icon: Globe },
];

type NodePaletteProps = { onAddNode: (node: PaletteNode) => void };

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const [query, setQuery] = useState("");
  const [customNodes, setCustomNodes] = useState<PaletteNode[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const allNodes = [...paletteNodes, ...customNodes];
  const filtered = allNodes.filter((node) => `${node.label} ${node.category}`.toLowerCase().includes(query.toLowerCase()));
  const categories = ["Trigger", "Logic", "Action", "Data", "Utility"] as const;
  const createCustomNode = () => {
    const label = customLabel.trim();
    if (!label) return;
    const node: PaletteNode = { kind: `custom.${Date.now()}`, label, description: customDescription.trim() || "Custom workflow component", category: "Utility", color: "slate", icon: Settings2 };
    setCustomNodes((current) => [...current, node]);
    setCustomLabel("");
    setCustomDescription("");
    setIsAdding(false);
  };

  return (
    <aside className="panel palette-panel">
      <div className="panel-heading"><div><span className="eyebrow">Components</span><h2>Node library</h2></div><span className="node-count">{allNodes.length}</span></div>
      <label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search nodes" aria-label="Search nodes" /></label>
      {isAdding ? <div className="custom-node-form"><div className="custom-form-heading"><strong>Add component</strong><button className="icon-button" onClick={() => setIsAdding(false)} aria-label="Close add component form"><X size={14} /></button></div><input value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} placeholder="Component name" aria-label="Component name" autoFocus /><textarea value={customDescription} onChange={(event) => setCustomDescription(event.target.value)} placeholder="What does it do?" aria-label="Component description" rows={2} /><button className="create-node-button" onClick={createCustomNode} disabled={!customLabel.trim()}><Plus size={14} />Add to library</button></div> : <button className="add-component-button" onClick={() => setIsAdding(true)}><Plus size={15} />Add custom component</button>}
      <div className="palette-list">
        {categories.map((category) => {
          const nodes = filtered.filter((node) => node.category === category);
          if (!nodes.length) return null;
          return <section className="palette-section" key={category}><h3>{category}</h3>{nodes.map((node) => { const Icon = node.icon; return <button className="palette-item" draggable onDragStart={(event) => { event.dataTransfer.setData("application/sketch2flow-node", node.kind); event.dataTransfer.setData("application/sketch2flow-node-data", JSON.stringify({ label: node.label, description: node.description, category: node.category, color: node.color })); }} onClick={() => onAddNode(node)} key={node.kind}><span className={`node-icon ${node.color}`}><Icon size={16} /></span><span className="palette-copy"><strong>{node.label}</strong><small>{node.description}</small></span><Plus className="add-icon" size={15} /></button>; })}</section>;
        })}
        {!filtered.length && <div className="empty-small">No matching components.</div>}
      </div>
      <div className="palette-tip"><span className="tip-dot" />Drag any component onto the canvas, or click to add it.</div>
    </aside>
  );
}
