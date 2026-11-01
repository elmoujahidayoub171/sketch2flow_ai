import { describe, expect, it } from "vitest";
import { validateWorkflow } from "./import-export";
import { workflowTemplates } from "./templates";
import { workflowDocumentSchema, type WorkflowDocument } from "./workflow-store";

const node = (id: string, kind = "trigger.manual") => ({
  id,
  type: "workflow",
  position: { x: 0, y: 0 },
  data: { kind, label: id, description: "Test node", category: "trigger", color: "violet", config: {} },
});

const document = (overrides: Partial<WorkflowDocument> = {}): WorkflowDocument => ({
  schemaVersion: "1.0",
  id: "test-workflow",
  name: "Test workflow",
  nodes: [node("a"), node("b", "action.http")],
  edges: [{ id: "a-b", source: "a", target: "b", type: "default", animated: true }],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("workflow document schema", () => {
  it("accepts a valid workflow", () => {
    expect(workflowDocumentSchema.safeParse(document()).success).toBe(true);
  });

  it("rejects duplicate node IDs", () => {
    const result = workflowDocumentSchema.safeParse(document({ nodes: [node("a"), node("a")] }));
    expect(result.success).toBe(false);
  });

  it("rejects edges that reference unknown nodes", () => {
    const result = workflowDocumentSchema.safeParse(document({ edges: [{ id: "x", source: "a", target: "missing" }] }));
    expect(result.success).toBe(false);
  });

  it("requires a supported schema version", () => {
    const result = workflowDocumentSchema.safeParse({ ...document(), schemaVersion: "2.0" });
    expect(result.success).toBe(false);
  });
});

describe("workflow templates", () => {
  it("all expose real graph data that passes the schema", () => {
    expect(workflowTemplates.length).toBeGreaterThan(0);
    workflowTemplates.forEach((template) => {
      expect(template.document.nodes.length).toBeGreaterThanOrEqual(3);
      expect(template.document.edges.length).toBeGreaterThanOrEqual(2);
      expect(workflowDocumentSchema.safeParse(template.document).success).toBe(true);
    });
  });

  it("can be imported as editable copies", () => {
    workflowTemplates.forEach((template) => {
      const result = validateWorkflow(template.document);
      expect(result.error).toBeUndefined();
      expect(result.document?.nodes).toHaveLength(template.document.nodes.length);
    });
  });
});

describe("workflow import validation", () => {
  it("rejects unsupported component types", () => {
    const invalid = document({ nodes: [node("a", "unknown.component")], edges: [] });
    expect(validateWorkflow(invalid).error).toContain("Unsupported node type");
  });

  it("allows custom components", () => {
    const custom = document({ nodes: [node("a", "custom.1700000000000")], edges: [] });
    expect(validateWorkflow(custom).error).toBeUndefined();
  });

  it("rejects malformed JSON shapes", () => {
    expect(validateWorkflow({ nodes: "not-an-array" }).error).toBeDefined();
  });
});
