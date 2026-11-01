"use client";

import { create } from "zustand";
import { z } from "zod";

export const STORAGE_KEY = "sketch2flow:v1:workflows";
export const workflowDocumentSchema = z.object({ schemaVersion: z.literal("1.0"), id: z.string().min(1), name: z.string().min(1), description: z.string().optional(), nodes: z.array(z.object({ id: z.string().min(1), type: z.string(), position: z.object({ x: z.number(), y: z.number() }), data: z.record(z.unknown()) })), edges: z.array(z.object({ id: z.string().min(1), source: z.string(), target: z.string(), sourceHandle: z.string().nullable().optional(), targetHandle: z.string().nullable().optional(), label: z.string().optional(), type: z.string().optional(), animated: z.boolean().optional() })), viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number() }).optional(), createdAt: z.string(), updatedAt: z.string() }).superRefine((value, ctx) => { const ids = new Set(value.nodes.map((node) => node.id)); if (ids.size !== value.nodes.length) ctx.addIssue({ code: "custom", message: "Node IDs must be unique" }); value.edges.forEach((edge) => { if (!ids.has(edge.source) || !ids.has(edge.target)) ctx.addIssue({ code: "custom", message: "An edge references an unknown node" }); }); });
export type WorkflowDocument = z.infer<typeof workflowDocumentSchema>;
type WorkflowStore = { workflows: Record<string, WorkflowDocument>; hydrated: boolean; hydrate: () => void; save: (document: WorkflowDocument) => boolean; remove: (id: string) => void; duplicate: (id: string) => string | undefined; importDocument: (document: WorkflowDocument) => string; };
const persist = (workflows: Record<string, WorkflowDocument>) => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.values(workflows))); return true; } catch { return false; } };
const clone = <T,>(value: T): T => structuredClone(value);

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflows: {}, hydrated: false,
  hydrate: () => { if (get().hydrated) return; try { const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown; const values = Array.isArray(raw) ? raw.map((item) => workflowDocumentSchema.safeParse(item)).filter((result): result is { success: true; data: WorkflowDocument } => result.success).map((result) => result.data) : []; set({ workflows: Object.fromEntries(values.map((item) => [item.id, item])), hydrated: true }); } catch { set({ workflows: {}, hydrated: true }); } },
  save: (document) => { const workflows = { ...get().workflows, [document.id]: document }; const ok = persist(workflows); set({ workflows }); return ok; },
  remove: (id) => { const workflows = { ...get().workflows }; delete workflows[id]; persist(workflows); set({ workflows }); },
  duplicate: (id) => { const source = get().workflows[id]; if (!source) return undefined; const copy = clone(source); copy.id = `workflow_${Date.now()}`; copy.name = `${source.name} copy`; copy.createdAt = new Date().toISOString(); copy.updatedAt = copy.createdAt; const workflows = { ...get().workflows, [copy.id]: copy }; persist(workflows); set({ workflows }); return copy.id; },
  importDocument: (document) => { const workflows = { ...get().workflows, [document.id]: document }; persist(workflows); set({ workflows }); return document.id; },
}));
