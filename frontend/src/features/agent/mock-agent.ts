import type { Edge, Node } from "@xyflow/react";
import type { WorkflowNodeData } from "@/components/editor/WorkflowNode";
import { validateNodeConfig } from "@/features/workflows/graph-schema";
import type { AgentReview, CompiledN8nWorkflow, ReviewCheck, ReviewIssue, ReviewQuestion } from "./types";

type ReviewNode = Node<WorkflowNodeData>;

const requiredConfig: Record<string, Array<{ field: string; label: string; placeholder: string }>> = {
  "action.http": [{ field: "url", label: "HTTP URL", placeholder: "https://api.example.com/endpoint" }],
  "action.email": [{ field: "recipient", label: "recipient email", placeholder: "team@example.com" }],
  "data.postgres": [{ field: "table", label: "database table", placeholder: "orders" }],
  "trigger.webhook": [{ field: "path", label: "webhook path", placeholder: "/incoming-order" }],
  "trigger.schedule": [{ field: "timezone", label: "schedule time zone", placeholder: "UTC" }],
  "logic.if": [{ field: "left", label: "left condition operand", placeholder: "order.total" }],
};

const n8nTypes: Record<string, string> = {
  "trigger.manual": "n8n-nodes-base.manualTrigger",
  "trigger.webhook": "n8n-nodes-base.webhook",
  "trigger.schedule": "n8n-nodes-base.scheduleTrigger",
  "trigger.email": "n8n-nodes-base.emailReadImap",
  "trigger.form": "n8n-nodes-base.formTrigger",
  "logic.if": "n8n-nodes-base.if",
  "logic.switch": "n8n-nodes-base.switch",
  "logic.merge": "n8n-nodes-base.merge",
  "logic.filter": "n8n-nodes-base.filter",
  "logic.loop": "n8n-nodes-base.splitInBatches",
  "action.http": "n8n-nodes-base.httpRequest",
  "action.email": "n8n-nodes-base.emailSend",
  "action.slack": "n8n-nodes-base.slack",
  "action.discord": "n8n-nodes-base.discord",
  "action.code": "n8n-nodes-base.code",
  "data.postgres": "n8n-nodes-base.postgres",
  "data.sheets": "n8n-nodes-base.googleSheets",
  "data.mysql": "n8n-nodes-base.mySql",
  "data.mongodb": "n8n-nodes-base.mongoDb",
  "data.redis": "n8n-nodes-base.redis",
  "utility.delay": "n8n-nodes-base.wait",
  "utility.set": "n8n-nodes-base.set",
  "utility.webhook-response": "n8n-nodes-base.respondToWebhook",
};

const incidentCount = (nodeId: string, edges: Edge[]) => edges.filter((edge) => edge.source === nodeId || edge.target === nodeId).length;

export function createMockReview(nodes: ReviewNode[], edges: Edge[], hasCycle: boolean, answered: Record<string, string> = {}): AgentReview {
  const issues: ReviewIssue[] = [];
  const questions: ReviewQuestion[] = [];
  const triggers = nodes.filter((node) => node.data.category === "trigger");

  if (!nodes.length) {
    issues.push({ id: "empty-graph", severity: "error", title: "Workflow is empty", detail: "Add a trigger and at least one action before compiling.", suggestion: "Drag a trigger from the node library onto the canvas." });
  } else if (!triggers.length) {
    issues.push({ id: "missing-trigger", severity: "error", title: "No trigger node", detail: "Compiled automations need one event that starts the workflow.", suggestion: "Add a Manual Trigger, Webhook, Schedule, or Email Trigger." });
  } else if (triggers.length > 1) {
    issues.push({ id: "multiple-triggers", severity: "warning", title: "Multiple triggers detected", detail: "This workflow has more than one starting point. Confirm the intended entry point.", suggestion: "Keep one trigger or split the flow into separate workflows." });
  }

  if (nodes.length > 1) {
    nodes.forEach((node) => {
      if (!incidentCount(node.id, edges)) issues.push({ id: `orphan-${node.id}`, severity: "error", nodeId: node.id, title: `${node.data.label} is disconnected`, detail: "This node has no incoming or outgoing connection.", suggestion: "Connect it to the surrounding flow or remove it." });
    });
    triggers.forEach((trigger) => {
      if (edges.some((edge) => edge.target === trigger.id)) issues.push({ id: `trigger-input-${trigger.id}`, severity: "warning", nodeId: trigger.id, title: "Trigger has an incoming connection", detail: "Triggers should start a workflow rather than receive an edge.", suggestion: "Remove the incoming connection." });
    });
  }

  if (hasCycle) issues.push({ id: "cycle", severity: "warning", title: "Workflow contains a cycle", detail: "Loops may not map cleanly to an n8n workflow.", suggestion: "Confirm the loop is intentional or replace it with a Loop node." });

  nodes.forEach((node) => {
    const config = { ...node.data.config };
    Object.entries(answered).forEach(([key, value]) => {
      const separator = key.indexOf(":");
      if (separator < 0) return;
      const nodeId = key.slice(0, separator);
      const field = key.slice(separator + 1);
      if (nodeId === node.id && field) config[field] = value;
    });
    const errors = validateNodeConfig(node.data.kind, config);
    Object.entries(errors).slice(0, 2).forEach(([field, message]) => {
      issues.push({ id: `config-${node.id}-${field}`, severity: "error", nodeId: node.id, title: `${node.data.label} needs ${field}`, detail: message, suggestion: "Open the inspector and complete this setting." });
    });
    const missing = (requiredConfig[node.data.kind] ?? []).find((item) => !config[item.field]?.trim());
    if (missing && !answered[`${node.id}:${missing.field}`]) {
      questions.push({ id: `question-${node.id}-${missing.field}`, nodeId: node.id, field: missing.field, prompt: `What ${missing.label} should “${node.data.label}” use?`, placeholder: missing.placeholder, required: true, kind: "text" });
    }
    if (node.data.kind === "logic.if") {
      const handles = new Set(edges.filter((edge) => edge.source === node.id).map((edge) => edge.sourceHandle));
      if (!handles.has("true") || !handles.has("false")) {
        issues.push({ id: `branch-${node.id}`, severity: "warning", nodeId: node.id, title: "IF branches are incomplete", detail: "Both the true and false outputs should be connected.", suggestion: "Connect both branch handles or remove the node." });
      }
    }
  });

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const checks: ReviewCheck[] = [
    { id: "trigger", label: "Trigger", status: triggers.length === 1 ? "pass" : triggers.length ? "warning" : "fail", detail: triggers.length === 1 ? "One entry point detected" : triggers.length ? "More than one entry point" : "No entry point found" },
    { id: "connectivity", label: "Connectivity", status: nodes.length <= 1 ? "warning" : issues.some((issue) => issue.id.startsWith("orphan")) ? "fail" : "pass", detail: nodes.length <= 1 ? "Add more nodes to test routing" : issues.some((issue) => issue.id.startsWith("orphan")) ? "Disconnected nodes found" : "All nodes are connected" },
    { id: "configuration", label: "Configuration", status: errors.some((issue) => issue.id.startsWith("config-")) ? "fail" : "pass", detail: errors.some((issue) => issue.id.startsWith("config-")) ? "Required settings are incomplete" : "Required settings look complete" },
    { id: "logic", label: "Logic paths", status: hasCycle || warnings.some((issue) => issue.id.startsWith("branch-")) ? "warning" : "pass", detail: hasCycle ? "Cycle detected" : warnings.some((issue) => issue.id.startsWith("branch-")) ? "Incomplete branch outputs" : "Branches look complete" },
  ];

  return {
    ready: errors.length === 0 && nodes.length > 0,
    summary: errors.length ? `Resolve ${errors.length} blocking ${errors.length === 1 ? "issue" : "issues"} before compiling.` : warnings.length ? `Ready to compile with ${warnings.length} ${warnings.length === 1 ? "warning" : "warnings"}.` : "The workflow is logically ready to compile.",
    checks,
    issues,
    questions: questions.slice(0, 4),
    checkedAt: new Date().toISOString(),
  };
}

export function mockCompile(nodes: ReviewNode[], edges: Edge[], name: string): CompiledN8nWorkflow {
  const names = new Map(nodes.map((node) => [node.id, node.data.label]));
  const connections: CompiledN8nWorkflow["connections"] = {};
  edges.forEach((edge) => {
    const source = names.get(edge.source);
    const target = names.get(edge.target);
    if (!source || !target) return;
    connections[source] ??= { main: [[]] };
    connections[source].main[0].push({ node: target, type: "main", index: 0 });
  });
  return {
    name,
    nodes: nodes.map((node) => ({
      parameters: { ...node.data.config },
      name: node.data.label,
      type: n8nTypes[node.data.kind] ?? "n8n-nodes-base.noOp",
      typeVersion: 1,
      position: [Math.round(node.position.x), Math.round(node.position.y)],
    })),
    connections,
    settings: { executionOrder: "v1" },
    meta: { source: "sketch2flow", compiledAt: new Date().toISOString() },
  };
}
