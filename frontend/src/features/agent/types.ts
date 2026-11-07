import type { WorkflowDocument } from "@/features/workflows/workflow-store";

export type ReviewStatus = "pass" | "warning" | "fail";
export type ReviewSeverity = "error" | "warning";

export type ReviewCheck = {
  id: string;
  label: string;
  status: ReviewStatus;
  detail: string;
};

export type ReviewIssue = {
  id: string;
  severity: ReviewSeverity;
  nodeId?: string;
  title: string;
  detail: string;
  suggestion?: string;
};

export type ReviewQuestion = {
  id: string;
  nodeId?: string;
  field?: string;
  prompt: string;
  placeholder?: string;
  required: boolean;
  kind: "text" | "choice";
  options?: string[];
};

export type AgentReview = {
  ready: boolean;
  summary: string;
  checks: ReviewCheck[];
  issues: ReviewIssue[];
  questions: ReviewQuestion[];
  checkedAt: string;
};

export type AgentStatus = "idle" | "reviewing" | "needs_input" | "ready" | "compiling" | "compiled" | "error";

export type AnswerMap = Record<string, string>;

export type ConfigUpdate = { nodeId: string; config: Record<string, string> };

export type CompiledN8nWorkflow = {
  name: string;
  nodes: Array<{ parameters: Record<string, string>; name: string; type: string; typeVersion: number; position: [number, number] }>;
  connections: Record<string, { main: Array<Array<{ node: string; type: "main"; index: number }>> }>;
  settings: { executionOrder: "v1" };
  meta: { source: "sketch2flow"; compiledAt: string };
};

export type AgentAudit = {
  runId: string;
  status: "ready" | "needs_input" | "error";
  summary: string;
  checks: ReviewCheck[];
  issues: ReviewIssue[];
  questions: ReviewQuestion[];
  suggestedConfigUpdates: ConfigUpdate[];
  agent: { provider: string; model: string; durationMs: number };
};

export type AgentAuditRequest = {
  workflow: WorkflowDocument;
  compiled: CompiledN8nWorkflow;
  localReview?: AgentReview;
  answers?: AnswerMap;
  targetN8nVersion?: string;
};
