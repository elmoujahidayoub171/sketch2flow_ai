"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import { AlertTriangle, Check, CheckCircle2, Circle, CircleAlert, Copy, Download, FileJson, MessageSquare, RefreshCw, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { WorkflowNodeData } from "./WorkflowNode";
import { agentApiConfigured, requestAgentReview } from "@/features/agent/client";
import { createMockReview, mockCompile } from "@/features/agent/mock-agent";
import type { AgentAudit, AgentReview, AgentStatus, AnswerMap, CompiledN8nWorkflow, ConfigUpdate, ReviewIssue, ReviewQuestion } from "@/features/agent/types";
import type { WorkflowDocument } from "@/features/workflows/workflow-store";

type AgentReviewPanelProps = {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  hasCycle: boolean;
  workflowName: string;
  getWorkflowDocument: () => WorkflowDocument;
  onFocusNode: (id: string) => void;
  onApplyAnswers: (updates: ConfigUpdate[]) => void;
  onNotify: (message: string) => void;
};

const statusLabels: Record<AgentStatus, string> = {
  idle: "Not reviewed",
  reviewing: "Reviewing",
  needs_input: "Needs input",
  ready: "Ready",
  compiling: "Compiling",
  compiled: "Compiled",
  error: "Error",
};

export function AgentReviewPanel({ nodes, edges, hasCycle, workflowName, getWorkflowDocument, onFocusNode, onApplyAnswers, onNotify }: AgentReviewPanelProps) {
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [review, setReview] = useState<AgentReview>();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [compiled, setCompiled] = useState<CompiledN8nWorkflow>();
  const [error, setError] = useState<string>();
  const [reviewedVersion, setReviewedVersion] = useState<string>();
  const [audit, setAudit] = useState<AgentAudit>();
  const [auditState, setAuditState] = useState<"idle" | "reviewing" | "complete" | "error">("idle");
  const [auditError, setAuditError] = useState<string>();
  const timers = useRef<number[]>([]);
  const auditRequest = useRef(0);

  const answerConfig = (nodeId: string, answerMap: AnswerMap) => {
    const config: Record<string, string> = {};
    (review?.questions ?? []).forEach((question) => {
      if (question.nodeId === nodeId && question.field && answerMap[question.id]?.trim()) config[question.field] = answerMap[question.id].trim();
    });
    return config;
  };
  const reviewVersion = (answerMap: AnswerMap) => JSON.stringify({
    nodes: nodes.map((node) => [node.id, node.data.label, node.data.kind, { ...node.data.config, ...answerConfig(node.id, answerMap) }]),
    edges: edges.map((edge) => [edge.id, edge.source, edge.target, edge.sourceHandle]),
    hasCycle,
  });
  const graphVersion = useMemo(() => JSON.stringify({
    nodes: nodes.map((node) => [node.id, node.data.label, node.data.kind, node.data.config]),
    edges: edges.map((edge) => [edge.id, edge.source, edge.target, edge.sourceHandle]),
    hasCycle,
  }), [edges, hasCycle, nodes]);
  const stale = Boolean(review && reviewedVersion !== graphVersion);

  useEffect(() => () => { timers.current.forEach((timer) => window.clearTimeout(timer)); }, []);
  useEffect(() => {
    auditRequest.current += 1;
    setAudit(undefined);
    setAuditState("idle");
    setAuditError(undefined);
  }, [graphVersion]);

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  };

  const runReview = (answerMap: AnswerMap = answers) => {
    setError(undefined);
    setCompiled(undefined);
    setAudit(undefined);
    setAuditState("idle");
    setAuditError(undefined);
    setStatus("reviewing");
    const version = reviewVersion(answerMap);
    schedule(() => {
      const result = createMockReview(nodes, edges, hasCycle, answerMap);
      setReview(result);
      setReviewedVersion(version);
      setStatus(result.ready ? "ready" : "needs_input");
    }, 720);
  };

  const sendToAgent = async (candidate?: CompiledN8nWorkflow) => {
    const target = candidate ?? compiled;
    if (!target) return;
    const requestId = ++auditRequest.current;
    setAuditState("reviewing");
    setAuditError(undefined);
    setAudit(undefined);
    try {
      const result = await requestAgentReview({
        workflow: getWorkflowDocument(),
        compiled: target,
        localReview: review,
        answers,
        targetN8nVersion: "1.x",
      });
      if (requestId !== auditRequest.current) return;
      setAudit(result);
      setAuditState("complete");
      onNotify(result.status === "ready" ? "Agent audit passed." : `Agent audit found ${result.issues.length} ${result.issues.length === 1 ? "issue" : "issues"}.`);
    } catch (cause) {
      if (requestId !== auditRequest.current) return;
      const message = cause instanceof Error ? cause.message : "Agent review failed.";
      setAuditError(message);
      setAuditState("error");
      onNotify("Agent audit unavailable.");
    }
  };

  const applyAgentUpdates = (updates: ConfigUpdate[]) => {
    if (!updates.length) return;
    onApplyAnswers(updates);
    setCompiled(undefined);
    setAudit(undefined);
    setAuditState("idle");
    setStatus(review?.ready ? "ready" : "needs_input");
    onNotify(`${updates.length} ${updates.length === 1 ? "agent suggestion" : "agent suggestions"} applied. Recompile to refresh the artifact.`);
  };

  const applyAndRecheck = () => {
    const updates: ConfigUpdate[] = [];
    (review?.questions ?? []).forEach((question) => {
      const value = answers[question.id]?.trim();
      if (!question.nodeId || !question.field || !value) return;
      const existing = updates.find((update) => update.nodeId === question.nodeId);
      if (existing) existing.config[question.field] = value;
      else updates.push({ nodeId: question.nodeId, config: { [question.field]: value } });
    });
    if (updates.length) {
      onApplyAnswers(updates);
      onNotify(`${updates.length} ${updates.length === 1 ? "answer" : "answers"} applied to the graph.`);
    }
    runReview(answers);
  };

  const compile = () => {
    setError(undefined);
    setStatus("compiling");
    schedule(() => {
      try {
        const next = mockCompile(nodes, edges, workflowName);
        setCompiled(next);
        setStatus("compiled");
        onNotify("n8n workflow compiled.");
        if (agentApiConfigured) void sendToAgent(next);
      } catch {
        setError("The workflow could not be compiled. Review the graph and try again.");
        setStatus("error");
      }
    }, 780);
  };

  const download = () => {
    if (!compiled) return;
    const blob = new Blob([JSON.stringify(compiled, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${workflowName.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "workflow"}.n8n.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    onNotify("n8n JSON downloaded.");
  };

  const copy = async () => {
    if (!compiled) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(compiled, null, 2));
      onNotify("n8n JSON copied.");
    } catch {
      onNotify("Clipboard access is unavailable.");
    }
  };

  const answeredCount = (review?.questions ?? []).filter((question) => answers[question.id]?.trim()).length;
  const displayStatus = stale ? "Out of date" : statusLabels[status];

  return (
    <div className="agent-review">
      <div className="agent-head">
        <div><span className="eyebrow">Agent</span><h2>Readiness review</h2></div>
        <span className={`agent-status is-${stale ? "needs_input" : status}`}>{displayStatus}</span>
      </div>
      <p className="agent-intro">Review the workflow logic, resolve the agent’s questions, then compile an n8n-ready artifact.</p>

      {status === "idle" && !review ? (
        <div className="agent-empty">
          <div className="agent-empty-orbit"><ScanSearch size={20} /></div>
          <strong>Run a readiness review</strong>
          <p>The mock agent checks triggers, connectivity, configuration, and branch completeness before compiling.</p>
          <Button variant="ai" size="sm" className="mt-4" onClick={() => runReview()}><Sparkles size={14} />Review workflow</Button>
        </div>
      ) : status === "reviewing" ? (
        <div className="agent-skeleton" aria-label="Reviewing workflow"><span /><span /><span /><span /></div>
      ) : review ? (
        <>
          <div className="agent-actions">
            <Button variant={stale ? "ai" : "secondary"} size="sm" onClick={() => runReview()}><RefreshCw size={13} />{stale ? "Re-review changes" : "Re-check"}</Button>
          </div>

          <div className={`agent-summary ${review.ready ? "is-ready" : "is-blocked"}`}>
            {review.ready ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
            <p>{stale ? "The graph changed since the last review. Re-run the review to refresh these findings." : review.summary}</p>
          </div>

          <section className="agent-section" aria-label="Readiness checks">
            <div className="agent-section-heading"><h3><ShieldCheck size={13} />Readiness checks</h3><span className="agent-section-count">{review.checks.filter((check) => check.status === "pass").length}/{review.checks.length}</span></div>
            <div className="agent-checks">
              {review.checks.map((check) => <div className={`agent-check is-${check.status}`} key={check.id}><span className={`agent-check-icon is-${check.status}`}>{check.status === "pass" ? <Check size={11} /> : check.status === "warning" ? <AlertTriangle size={11} /> : <CircleAlert size={11} />}</span><div><strong>{check.label}</strong><small>{check.detail}</small></div></div>)}
            </div>
          </section>

          {(review.questions.length > 0 || answeredCount > 0) && (
            <section className="agent-section" aria-label="Agent questions">
              <div className="agent-section-heading"><h3><MessageSquare size={13} />Needs your input</h3><span className="agent-section-count">{answeredCount}/{review.questions.length}</span></div>
              {review.questions.map((question) => <QuestionField key={question.id} question={question} value={answers[question.id] ?? ""} onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} onFocus={question.nodeId ? () => onFocusNode(question.nodeId as string) : undefined} />)}
              <Button variant="ai" size="sm" onClick={applyAndRecheck} disabled={!answeredCount}><Sparkles size={13} />Apply answers &amp; re-check</Button>
            </section>
          )}

          {review.issues.length > 0 && (
            <section className="agent-section" aria-label="Review issues">
              <div className="agent-section-heading"><h3><CircleAlert size={13} />Issues</h3><span className="agent-section-count">{review.issues.length}</span></div>
              {review.issues.map((issue) => <IssueRow key={issue.id} issue={issue} onFocus={issue.nodeId ? () => onFocusNode(issue.nodeId as string) : undefined} />)}
            </section>
          )}

          <section className="agent-section" aria-label="Compile workflow">
            <div className="agent-section-heading"><h3><FileJson size={13} />Compile</h3>{compiled && <Badge tone="mint">n8n JSON</Badge>}</div>
            <div className="agent-compile">
              <div className="agent-compile-top"><span className="agent-compile-icon"><FileJson size={15} /></span><div><strong>{compiled ? "Workflow compiled" : "Compile to n8n"}</strong><p>{compiled ? `${compiled.nodes.length} nodes · ${Object.keys(compiled.connections).length} connection groups` : review.ready ? "The graph passed the readiness review. Review the output before downloading." : "Resolve blocking issues before compiling."}</p></div></div>
              {error && <div className="agent-error" role="alert">{error}</div>}
              {compiled ? (
                <>
                  <div className="agent-output"><div className="agent-output-head"><span>{compiled.name}.n8n.json</span><span>preview</span></div><pre>{JSON.stringify(compiled, null, 2)}</pre></div>
                  <div className="agent-actions"><Button variant="secondary" size="sm" onClick={copy}><Copy size={13} />Copy</Button><Button variant="primary" size="sm" onClick={download}><Download size={13} />Download</Button></div>
                </>
              ) : (
                <Button variant={review.ready ? "primary" : "secondary"} size="sm" onClick={() => compile()} disabled={!review.ready || stale || status === "compiling"} loading={status === "compiling"}>
                  <Sparkles size={13} />{status === "compiling" ? "Compiling…" : "Compile n8n workflow"}
                </Button>
              )}
            </div>
          </section>

          {compiled && (
            <section className="agent-section" aria-label="Agent audit">
              <div className="agent-section-heading">
                <h3><Sparkles size={13} />Agent audit</h3>
                {audit ? <Badge tone={audit.status === "ready" ? "mint" : audit.status === "needs_input" ? "warning" : "danger"}>{audit.agent.provider}</Badge> : <span className="agent-section-count">{agentApiConfigured ? "FastAPI" : "offline"}</span>}
              </div>
              <div className="agent-compile">
                {!agentApiConfigured ? (
                  <p className="agent-audit-note">Set NEXT_PUBLIC_API_URL to send the internal workflow and compiled n8n JSON through FastAPI.</p>
                ) : auditState === "reviewing" ? (
                  <div className="agent-skeleton" aria-label="Auditing compiled workflow"><span /><span /><span /></div>
                ) : auditState === "error" ? (
                  <>
                    <div className="agent-error" role="alert">{auditError}</div>
                    <Button variant="secondary" size="sm" onClick={() => void sendToAgent()}><RefreshCw size={13} />Retry agent audit</Button>
                  </>
                ) : audit ? (
                  <>
                    <div className={`agent-summary ${audit.status === "ready" ? "is-ready" : "is-blocked"}`}>
                      {audit.status === "ready" ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
                      <p>{audit.summary}</p>
                    </div>
                    {audit.questions.length > 0 && (
                      <div className="agent-audit-questions">
                        <strong>Agent requests input</strong>
                        {audit.questions.map((question) => <p key={question.id}>{question.prompt}</p>)}
                      </div>
                    )}
                    {audit.issues.map((issue) => <IssueRow key={issue.id} issue={issue} onFocus={issue.nodeId ? () => onFocusNode(issue.nodeId as string) : undefined} />)}
                    {audit.suggestedConfigUpdates.length > 0 && (
                      <Button variant="primary" size="sm" onClick={() => applyAgentUpdates(audit.suggestedConfigUpdates)}><Sparkles size={13} />Apply agent fixes</Button>
                    )}
                    <p className="agent-audit-meta">{audit.agent.provider} · {audit.agent.model} · {audit.agent.durationMs} ms</p>
                    <Button variant="secondary" size="sm" onClick={() => void sendToAgent()}><RefreshCw size={13} />Re-run agent audit</Button>
                  </>
                ) : (
                  <>
                    <p className="agent-audit-note">Send the internal workflow and compiled n8n JSON through FastAPI for a second review.</p>
                    <Button variant="ai" size="sm" onClick={() => void sendToAgent()}><Sparkles size={13} />Send to agent</Button>
                  </>
                )}
              </div>
            </section>
          )}

          <section className="agent-section" aria-label="Review activity">
            <div className="agent-section-heading"><h3><Circle size={13} />Session activity</h3></div>
            <div className="agent-timeline">
              <div className="agent-timeline-row is-done"><span>Review generated <strong>{new Date(review.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong></span></div>
              <div className={`agent-timeline-row ${review.issues.length ? "is-done" : ""}`}><span><strong>{review.issues.length}</strong> issues detected · <strong>{review.questions.length}</strong> questions</span></div>
              <div className={`agent-timeline-row ${compiled ? "is-done" : ""}`}><span>{compiled ? "n8n workflow compiled and ready to download." : "Compilation not started."}</span></div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function QuestionField({ question, value, onChange, onFocus }: { question: ReviewQuestion; value: string; onChange: (value: string) => void; onFocus?: () => void }) {
  return (
    <div className="agent-question">
      <label htmlFor={question.id}>{question.prompt}</label>
      {question.kind === "choice" ? <select id={question.id} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Select an option</option>{question.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input id={question.id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={question.placeholder} />}
      {question.nodeId && <small><button type="button" className="agent-focus" onClick={onFocus}>{question.nodeId} ↗</button></small>}
    </div>
  );
}

function IssueRow({ issue, onFocus }: { issue: ReviewIssue; onFocus?: () => void }) {
  return (
    <div className={`agent-issue is-${issue.severity}`}>
      <div className="agent-issue-top"><strong>{issue.title}</strong><span className={`node-severity is-${issue.severity}`}>{issue.severity}</span></div>
      <p>{issue.detail}</p>
      {issue.suggestion && <p>{issue.suggestion}</p>}
      {issue.nodeId && <button type="button" className="agent-focus" onClick={onFocus}>Focus node ↗</button>}
    </div>
  );
}
