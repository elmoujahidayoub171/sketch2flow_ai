"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GitBranch, Database, Send, Zap, Settings2 } from "lucide-react";

const icons = { trigger: Zap, logic: GitBranch, action: Send, data: Database, utility: Settings2 };
export type WorkflowNodeData = { label: string; description: string; category: keyof typeof icons; color: string; sourceLabels?: string[] };

export function WorkflowNode({ data, selected }: NodeProps & { data: WorkflowNodeData }) {
  const Icon = icons[data.category];
  const branches = data.sourceLabels ?? ["output"];
  const isTrigger = data.category === "trigger";
  return <div className={`workflow-node ${selected ? "selected" : ""}`}><Handle type="target" position={Position.Left} className={`handle target ${isTrigger ? "hidden-handle" : ""}`} /><div className="workflow-node-top"><span className={`node-icon ${data.color}`}><Icon size={16} /></span><span className="node-category">{data.category}</span><span className="node-menu">•••</span></div><div className="workflow-node-label">{data.label}</div><div className="workflow-node-description">{data.description}</div><div className="source-handles">{branches.map((branch, index) => <span key={branch} className="source-handle-label" style={{ top: `${62 + index * 22}px` }}>{branch}<Handle type="source" position={Position.Right} id={branch} className="handle source" style={{ top: 0 }} /></span>)}</div></div>;
}
