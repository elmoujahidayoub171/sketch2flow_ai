import type { AgentAudit, AgentAuditRequest } from "./types";

const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export const agentApiConfigured = Boolean(apiBase);

export async function requestAgentReview(payload: AgentAuditRequest): Promise<AgentAudit> {
  if (!apiBase) throw new Error("Agent API is not configured. Set NEXT_PUBLIC_API_URL.");

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 130_000);
  try {
    const response = await fetch(`${apiBase}/agent/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => undefined) as { detail?: string } | undefined;
      throw new Error(body?.detail ?? `Agent review failed with status ${response.status}.`);
    }
    return await response.json() as AgentAudit;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new Error("Agent review timed out.");
    throw error instanceof Error ? error : new Error("Agent review failed.");
  } finally {
    window.clearTimeout(timeout);
  }
}
