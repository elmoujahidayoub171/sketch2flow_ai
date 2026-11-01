"use client";

import { paletteNodes } from "@/components/editor/NodePalette";
import { workflowDocumentSchema, type WorkflowDocument } from "./workflow-store";

export function validateWorkflow(value: unknown): { document?: WorkflowDocument; error?: string } { const result = workflowDocumentSchema.safeParse(value); if (!result.success) return { error: result.error.issues[0]?.message ?? "Invalid Sketch2Flow JSON." }; const known = new Set(paletteNodes.map((node) => node.kind)); const unsupported = result.data.nodes.find((node) => !known.has(String(node.data.kind)) && !String(node.data.kind).startsWith("custom.")); if (unsupported) return { error: `Unsupported node type: ${String(unsupported.data.kind)}` }; return { document: result.data }; }
export function downloadWorkflow(document: WorkflowDocument) { const url = URL.createObjectURL(new Blob([JSON.stringify(document, null, 2)], { type: "application/json" })); const link = window.document.createElement("a"); link.href = url; link.download = `${document.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "workflow"}.sketch2flow.json`; link.click(); URL.revokeObjectURL(url); }
export function readWorkflow(file: File): Promise<{ document?: WorkflowDocument; error?: string }> { return new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => { try { resolve(validateWorkflow(JSON.parse(String(reader.result)))); } catch { resolve({ error: "The selected file is not valid JSON." }); } }; reader.onerror = () => resolve({ error: "Unable to read the selected file." }); reader.readAsText(file); }); }
