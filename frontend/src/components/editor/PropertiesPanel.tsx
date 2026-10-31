"use client";

import { X, SlidersHorizontal, Trash2 } from "lucide-react";
import type { Node } from "@xyflow/react";
import type { WorkflowNodeData } from "./WorkflowNode";

type PropertiesPanelProps = { selectedNode: Node<WorkflowNodeData> | undefined; onUpdate: (id: string, data: Partial<WorkflowNodeData>) => void; onDelete: (id: string) => void; onClose: () => void };

export function PropertiesPanel({ selectedNode, onUpdate, onDelete, onClose }: PropertiesPanelProps) {
  return <aside className="panel inspector-panel"><div className="panel-heading"><div><span className="eyebrow">Configuration</span><h2>Inspector</h2></div>{selectedNode && <button className="icon-button" onClick={onClose} aria-label="Close inspector"><X size={16} /></button>}</div>{selectedNode ? <div className="inspector-content"><div className="inspector-node-title"><span className={`node-icon ${selectedNode.data.color}`}><SlidersHorizontal size={16} /></span><div><strong>{selectedNode.data.label}</strong><small>{selectedNode.data.category} node</small></div></div><label className="field-label">Label<input value={selectedNode.data.label} onChange={(event) => onUpdate(selectedNode.id, { label: event.target.value })} /></label><label className="field-label">Description<textarea value={selectedNode.data.description} onChange={(event) => onUpdate(selectedNode.id, { description: event.target.value })} rows={3} /></label><div className="field-label">Type<div className="readonly-field">{selectedNode.type}</div></div><button className="delete-node-button" onClick={() => onDelete(selectedNode.id)}><Trash2 size={14} />Remove component</button><div className="inspector-note"><span className="tip-dot" />Properties are stored in your Sketch2Flow graph.</div></div> : <div className="inspector-empty"><div className="empty-orbit"><SlidersHorizontal size={20} /></div><strong>Select a node</strong><p>Choose a component on the canvas to view and edit its properties.</p></div>}</aside>;
}
