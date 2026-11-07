"use client";

import type { Edge, Node } from "@xyflow/react";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import type { WorkflowNodeData } from "./WorkflowNode";
import { AgentReviewPanel } from "./AgentReviewPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import type { ConfigUpdate } from "@/features/agent/types";
import type { WorkflowDocument } from "@/features/workflows/workflow-store";

export type EditorTab = "inspector" | "review";

type EditorSidebarProps = {
  tab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  hasCycle: boolean;
  workflowName: string;
  selectedNode: Node<WorkflowNodeData> | undefined;
  selectedEdge: Edge | undefined;
  focusNameSignal: number;
  onUpdateNode: (id: string, data: Partial<WorkflowNodeData>) => void;
  onUpdateEdge: (id: string, data: Partial<Edge>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onClose: () => void;
  onFocusNode: (id: string) => void;
  getWorkflowDocument: () => WorkflowDocument;
  onApplyAnswers: (updates: ConfigUpdate[]) => void;
  onNotify: (message: string) => void;
};

export function EditorSidebar({ tab, onTabChange, nodes, edges, hasCycle, workflowName, selectedNode, selectedEdge, focusNameSignal, onUpdateNode, onUpdateEdge, onDeleteNode, onDeleteEdge, onClose, onFocusNode, getWorkflowDocument, onApplyAnswers, onNotify }: EditorSidebarProps) {
  return (
    <aside className="panel inspector-panel editor-sidebar">
      <div className="side-tabs" role="tablist" aria-label="Editor panels">
        <button role="tab" aria-selected={tab === "inspector"} className={`side-tab ${tab === "inspector" ? "is-active" : ""}`} onClick={() => onTabChange("inspector")}><SlidersHorizontal size={13} />Inspector</button>
        <button role="tab" aria-selected={tab === "review"} className={`side-tab ${tab === "review" ? "is-active" : ""}`} onClick={() => onTabChange("review")}><Sparkles size={13} />AI Review<span className="side-tab-badge">AI</span></button>
      </div>
      <div className="side-tab-body">
        {tab === "inspector"
          ? <PropertiesPanel focusNameSignal={focusNameSignal} selectedNode={selectedNode} selectedEdge={selectedEdge} onUpdate={onUpdateNode} onUpdateEdge={onUpdateEdge} onDelete={onDeleteNode} onDeleteEdge={onDeleteEdge} onClose={onClose} />
          : <AgentReviewPanel nodes={nodes} edges={edges} hasCycle={hasCycle} workflowName={workflowName} getWorkflowDocument={getWorkflowDocument} onFocusNode={onFocusNode} onApplyAnswers={onApplyAnswers} onNotify={onNotify} />}
      </div>
    </aside>
  );
}
