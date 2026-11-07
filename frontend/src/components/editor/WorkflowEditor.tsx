"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import { addEdge, Background, BackgroundVariant, ConnectionLineType, Controls, MiniMap, ReactFlow, reconnectEdge, useEdgesState, useNodesState, type Connection, type Edge, type Node, type ReactFlowInstance } from "@xyflow/react";
import { AlertTriangle, ArrowLeft, ChevronDown, Download, FileJson, FileUp, HelpCircle, Keyboard, LayoutTemplate, Maximize, Moon, PanelLeft, Redo2, Save, Settings, Settings2, SlidersHorizontal, Sparkles, Sun, Undo2, Workflow, X } from "lucide-react";
import "@xyflow/react/dist/style.css";
import { NodePalette, paletteNodes, type PaletteNode } from "./NodePalette";
import { EditorSidebar, type EditorTab } from "./EditorSidebar";
import { WorkflowNode, type WorkflowNodeData } from "./WorkflowNode";
import { defaultNodeConfig } from "@/features/workflows/graph-schema";
import { downloadWorkflow, readWorkflow } from "@/features/workflows/import-export";
import { useWorkflowStore, type WorkflowDocument } from "@/features/workflows/workflow-store";
import { useThemeStore } from "@/features/theme/theme-store";
import type { ConfigUpdate } from "@/features/agent/types";

const initialNodes: Node<WorkflowNodeData>[] = [
  { id: "manual-1", type: "workflow", position: { x: 160, y: 190 }, data: { kind: "trigger.manual", label: "Manual Trigger", description: "Start on demand", category: "trigger", color: "emerald", config: {} } },
];
const nodeTypes = { workflow: WorkflowNode };
type GraphSnapshot = { nodes: Node<WorkflowNodeData>[]; edges: Edge[] };
type Clipboard = { nodes: Node<WorkflowNodeData>[]; edges: Edge[] };
type ContextMenu = { x: number; y: number; nodeId?: string };
type FlowMouseEvent = globalThis.MouseEvent | ReactMouseEvent;
type MobilePanel = "palette" | "inspector";
type SaveState = "saved" | "dirty" | "saving" | "failed";

function graphHasCycle(nodes: Node<WorkflowNodeData>[], edges: Edge[]) {
  const adjacency = new Map<string, string[]>();
  nodes.forEach((node) => adjacency.set(node.id, []));
  edges.forEach((edge) => { if (adjacency.has(edge.source) && adjacency.has(edge.target)) adjacency.get(edge.source)?.push(edge.target); });
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    const found = (adjacency.get(id) ?? []).some(visit);
    visiting.delete(id);
    visited.add(id);
    return found;
  };
  return nodes.some((node) => visit(node.id));
}

const shortcuts = [
  ["Ctrl / Cmd + S", "Save workflow"],
  ["Ctrl / Cmd + Z", "Undo"],
  ["Ctrl / Cmd + Shift + Z", "Redo"],
  ["Ctrl / Cmd + C", "Copy selected node"],
  ["Ctrl / Cmd + V", "Paste node"],
  ["Ctrl / Cmd + A", "Select all nodes"],
  ["Delete / Backspace", "Delete selection"],
  ["F", "Fit workflow to view"],
  ["Escape", "Deselect / close dialog"],
  ["?", "Show this dialog"],
];

export function WorkflowEditor({ workflowId = "new", initialTab = "inspector" }: { workflowId?: string; initialTab?: EditorTab }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>();
  const [past, setPast] = useState<GraphSnapshot[]>([]);
  const [future, setFuture] = useState<GraphSnapshot[]>([]);
  const [workflowName, setWorkflowName] = useState("Untitled workflow");
  const [draftName, setDraftName] = useState("Untitled workflow");
  const [editingName, setEditingName] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenu>();
  const [clipboard, setClipboard] = useState<Clipboard>();
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<Node<WorkflowNodeData>, Edge>>();
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>();
  const [saved, setSaved] = useState<SaveState>("saved");
  const [notice, setNotice] = useState<string>();
  const [importError, setImportError] = useState<string>();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [focusNameSignal, setFocusNameSignal] = useState(0);
  const [draggingNode, setDraggingNode] = useState<PaletteNode>();
  const [dropActive, setDropActive] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>();
  const [rightTab, setRightTab] = useState<EditorTab>(initialTab);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const selectedBatch = useRef<Clipboard | undefined>(undefined);
  const fileInput = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);
  const { theme, toggleTheme } = useThemeStore();
  const hydrateTheme = useThemeStore((state) => state.hydrate);
  const hydrated = useWorkflowStore((state) => state.hydrated);
  const workflows = useWorkflowStore((state) => state.workflows);
  const hydrate = useWorkflowStore((state) => state.hydrate);
  const saveWorkflow = useWorkflowStore((state) => state.save);
  const importDocument = useWorkflowStore((state) => state.importDocument);
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedId), [nodes, selectedId]);
  const selectedEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdgeId), [edges, selectedEdgeId]);
  const hasCycle = useMemo(() => graphHasCycle(nodes, edges), [edges, nodes]);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice((current) => (current === message ? undefined : current)), 2600);
  }, []);

  const pushHistory = useCallback(() => {
    setPast((current) => [...current.slice(-49), { nodes: structuredClone(nodes), edges: structuredClone(edges) }]);
    setFuture([]);
  }, [edges, nodes]);

  const undo = useCallback(() => {
    const previous = past.at(-1);
    if (!previous) return;
    setPast((current) => current.slice(0, -1));
    setFuture((current) => [{ nodes, edges }, ...current]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setSelectedId(undefined);
    setSelectedEdgeId(undefined);
  }, [edges, nodes, past, setEdges, setNodes]);

  const redo = useCallback(() => {
    const next = future[0];
    if (!next) return;
    setFuture((current) => current.slice(1));
    setPast((current) => [...current, { nodes, edges }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    setSelectedId(undefined);
    setSelectedEdgeId(undefined);
  }, [edges, future, nodes, setEdges, setNodes]);

  const addNode = useCallback((item: PaletteNode, position?: { x: number; y: number }) => {
    const id = `${item.kind}-${Date.now()}`;
    pushHistory();
    setNodes((current) => [...current, {
      id,
      type: "workflow",
      position: position ?? { x: 160 + current.length * 24, y: 120 + (current.length % 3) * 100 },
      data: {
        kind: item.kind,
        label: item.label,
        description: item.description,
        category: item.category.toLowerCase() as WorkflowNodeData["category"],
        color: item.color,
        config: defaultNodeConfig(item.kind),
        sourceLabels: item.kind === "logic.if" ? ["true", "false"] : item.kind === "logic.switch" ? ["case 1", "case 2", "default"] : undefined,
      },
    }]);
    setSelectedId(id);
  }, [pushHistory, setNodes]);

  const addNodeAtCenter = useCallback((item: PaletteNode) => {
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    const center = bounds && flowInstance ? flowInstance.screenToFlowPosition({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }) : undefined;
    addNode(item, center ? { x: center.x - 95, y: center.y - 60 } : undefined);
    setMobilePanel(undefined);
  }, [addNode, flowInstance]);

  const bringToFront = useCallback((id: string) => {
    pushHistory();
    setNodes((current) => {
      const node = current.find((item) => item.id === id);
      return node ? [...current.filter((item) => item.id !== id), node] : current;
    });
    setContextMenu(undefined);
  }, [pushHistory, setNodes]);

  const renameFromMenu = useCallback((id: string) => {
    selectedBatch.current = undefined;
    setSelectedId(id);
    setSelectedEdgeId(undefined);
    setContextMenu(undefined);
    setFocusNameSignal((current) => current + 1);
    setRightTab("inspector");
    setMobilePanel("inspector");
  }, []);

  const openReview = useCallback(() => {
    setRightTab("review");
    setMobilePanel("inspector");
  }, []);

  const focusNode = useCallback((id: string) => {
    const node = nodes.find((item) => item.id === id);
    setSelectedId(id);
    setSelectedEdgeId(undefined);
    setMobilePanel("inspector");
    if (node && flowInstance) {
      const width = node.measured?.width ?? 190;
      const height = node.measured?.height ?? 120;
      flowInstance.setCenter(node.position.x + width / 2, node.position.y + height / 2, { zoom: Math.max(flowInstance.getZoom(), 0.9), duration: 320 });
    }
  }, [flowInstance, nodes]);

  const applyAnswerUpdates = useCallback((updates: ConfigUpdate[]) => {
    if (!updates.length) return;
    pushHistory();
    setNodes((current) => current.map((node) => {
      const update = updates.find((item) => item.nodeId === node.id);
      return update ? { ...node, data: { ...node.data, config: { ...node.data.config, ...update.config } } } : node;
    }));
  }, [pushHistory, setNodes]);

  const updateNode = useCallback((id: string, data: Partial<WorkflowNodeData>) => {
    pushHistory();
    setNodes((current) => current.map((node) => node.id === id ? { ...node, data: { ...node.data, ...data } } : node));
  }, [pushHistory, setNodes]);

  const removeNodes = useCallback((ids: string[]) => {
    if (!ids.length) return;
    pushHistory();
    setNodes((current) => current.filter((node) => !ids.includes(node.id)));
    setEdges((current) => current.filter((edge) => !ids.includes(edge.source) && !ids.includes(edge.target)));
    setSelectedId(undefined);
    setContextMenu(undefined);
  }, [pushHistory, setEdges, setNodes]);

  const updateEdge = useCallback((id: string, data: Partial<Edge>) => {
    pushHistory();
    setEdges((current) => current.map((edge) => edge.id === id ? { ...edge, ...data } : edge));
  }, [pushHistory, setEdges]);

  const removeEdges = useCallback((ids: string[]) => {
    if (!ids.length) return;
    pushHistory();
    setEdges((current) => current.filter((edge) => !ids.includes(edge.id)));
    setSelectedEdgeId(undefined);
  }, [pushHistory, setEdges]);

  const duplicateNode = useCallback((id: string) => {
    const node = nodes.find((item) => item.id === id);
    if (!node) return;
    pushHistory();
    const newId = `${id}-copy-${Date.now()}`;
    setNodes((current) => [...current, { ...node, id: newId, position: { x: node.position.x + 36, y: node.position.y + 36 }, data: { ...node.data } }]);
    setSelectedId(newId);
    setContextMenu(undefined);
  }, [nodes, pushHistory, setNodes]);

  const pasteNode = useCallback(() => {
    if (!clipboard?.nodes.length) return;
    pushHistory();
    const stamp = Date.now();
    const ids = new Map(clipboard.nodes.map((node, index) => [node.id, `${node.data.kind}-${stamp}-${index}`]));
    const pastedNodes = clipboard.nodes.map((node) => ({
      ...structuredClone(node),
      id: ids.get(node.id) as string,
      selected: true,
      position: { x: node.position.x + 44, y: node.position.y + 44 },
      data: structuredClone(node.data),
    }));
    const pastedEdges = clipboard.edges.map((edge, index) => ({
      ...structuredClone(edge),
      id: `edge-${stamp}-${index}`,
      source: ids.get(edge.source) as string,
      target: ids.get(edge.target) as string,
      selected: false,
    }));
    setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), ...pastedNodes]);
    setEdges((current) => [...current.map((edge) => ({ ...edge, selected: false })), ...pastedEdges]);
    const last = pastedNodes.at(-1);
    if (last) setSelectedId(last.id);
    setContextMenu(undefined);
  }, [clipboard, pushHistory, setEdges, setNodes]);

  const copySelection = useCallback((ids?: string[]) => {
    const batch = ids ? undefined : selectedBatch.current;
    const targets = ids ? nodes.filter((node) => ids.includes(node.id)) : batch?.nodes ?? nodes.filter((node) => node.selected || node.id === selectedId);
    const selected = targets.length ? targets : selectedNode ? [selectedNode] : [];
    if (!selected.length) return;
    const included = new Set(selected.map((node) => node.id));
    setClipboard({
      nodes: selected.map((node) => structuredClone(node)),
      edges: batch?.edges ?? edges.filter((edge) => included.has(edge.source) && included.has(edge.target)).map((edge) => structuredClone(edge)),
    });
    showNotice(selected.length > 1 ? `${selected.length} nodes copied.` : "Node copied.");
  }, [edges, nodes, selectedId, selectedNode, showNotice]);

  const isValidConnection = useCallback((connection: Connection | Edge) => {
    const source = nodes.find((node) => node.id === connection.source);
    const target = nodes.find((node) => node.id === connection.target);
    const duplicate = edges.some((edge) => edge.source === connection.source && edge.target === connection.target && edge.sourceHandle === connection.sourceHandle && edge.targetHandle === connection.targetHandle);
    return Boolean(source && target && source.id !== target.id && target.data.category !== "trigger" && !duplicate);
  }, [edges, nodes]);

  const documentForSave = useCallback((): WorkflowDocument => {
    const existing = activeWorkflowId ? useWorkflowStore.getState().workflows[activeWorkflowId] : undefined;
    const now = new Date().toISOString();
    return {
      schemaVersion: "1.0",
      id: activeWorkflowId ?? `workflow_${Date.now()}`,
      name: workflowName.trim() || "Untitled workflow",
      nodes: nodes.map((node) => ({ id: node.id, type: node.type ?? "workflow", position: node.position, data: node.data as Record<string, unknown> })),
      edges: edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, sourceHandle: edge.sourceHandle, targetHandle: edge.targetHandle, label: typeof edge.label === "string" ? edge.label : undefined, type: edge.type, animated: edge.animated })),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
  }, [activeWorkflowId, edges, nodes, workflowName]);

  const saveNow = useCallback(() => {
    const document = documentForSave();
    if (!activeWorkflowId) setActiveWorkflowId(document.id);
    setSaved("saving");
    window.setTimeout(() => {
      const ok = saveWorkflow(document);
      setSaved(ok ? "saved" : "failed");
      showNotice(ok ? "Workflow saved." : "Save failed. Browser storage is unavailable.");
    }, 200);
  }, [activeWorkflowId, documentForSave, saveWorkflow, showNotice]);

  const exportWorkflow = useCallback(() => {
    const document = documentForSave();
    saveWorkflow(document);
    downloadWorkflow(document);
    showNotice("JSON exported.");
  }, [documentForSave, saveWorkflow, showNotice]);

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const result = await readWorkflow(file);
    if (!result.document) {
      setImportError(result.error ?? "Import failed.");
      showNotice("Import failed.");
      return;
    }
    importDocument(result.document);
    initialized.current = true;
    setImportError(undefined);
    setActiveWorkflowId(result.document.id);
    setWorkflowName(result.document.name);
    setDraftName(result.document.name);
    setNodes(result.document.nodes as unknown as Node<WorkflowNodeData>[]);
    setEdges(result.document.edges as unknown as Edge[]);
    setPast([]);
    setFuture([]);
    setSaved("saved");
    showNotice("Workflow imported.");
  };

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { hydrateTheme(); }, [hydrateTheme]);

  useEffect(() => {
    if (!hydrated || initialized.current) return;
    initialized.current = true;
    const stored = workflowId !== "new" ? workflows[workflowId] : undefined;
    if (stored) {
      setActiveWorkflowId(stored.id);
      setWorkflowName(stored.name);
      setDraftName(stored.name);
      setNodes(stored.nodes as unknown as Node<WorkflowNodeData>[]);
      setEdges(stored.edges as unknown as Edge[]);
      return;
    }
    setActiveWorkflowId(workflowId === "new" ? `workflow_${Date.now()}` : workflowId);
  }, [hydrated, setEdges, setNodes, workflowId, workflows]);

  useEffect(() => {
    if (!initialized.current || !activeWorkflowId) return;
    setSaved("dirty");
    const timer = window.setTimeout(() => {
      setSaved("saving");
      const ok = saveWorkflow(documentForSave());
      setSaved(ok ? "saved" : "failed");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [activeWorkflowId, documentForSave, saveWorkflow]);

  const onDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData("application/sketch2flow-node");
    const payload = event.dataTransfer.getData("application/sketch2flow-node-data");
    const staticItem = paletteNodes.find((node) => node.kind === kind);
    const item = staticItem ?? (() => {
      try {
        const data = JSON.parse(payload) as Omit<PaletteNode, "kind" | "icon">;
        return { ...data, kind, icon: Settings2 };
      } catch {
        return undefined;
      }
    })();
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (item && bounds) addNode(item, { x: event.clientX - bounds.left - 100, y: event.clientY - bounds.top - 50 });
  }, [addNode]);

  const onConnect = useCallback((connection: Connection) => {
    const label = connection.sourceHandle && connection.sourceHandle !== "output" ? connection.sourceHandle : undefined;
    pushHistory();
    setEdges((current) => addEdge({ ...connection, id: `edge-${Date.now()}`, label, type: "default", animated: true }, current));
  }, [pushHistory, setEdges]);

  const onReconnect = useCallback((oldEdge: Edge, connection: Connection) => {
    pushHistory();
    setEdges((current) => reconnectEdge(oldEdge, connection, current));
  }, [pushHistory, setEdges]);

  const confirmName = () => {
    const name = draftName.trim();
    if (name) {
      setWorkflowName(name);
      setDraftName(name);
      setEditingName(false);
    } else {
      setDraftName(workflowName);
    }
  };

  const nameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") confirmName();
    if (event.key === "Escape") {
      setDraftName(workflowName);
      setEditingName(false);
    }
  };

  const onNodeContextMenu = (event: FlowMouseEvent, node: Node<WorkflowNodeData>) => {
    event.preventDefault();
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (bounds) {
      setSelectedId(node.id);
      setContextMenu({ nodeId: node.id, x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    }
  };

  const onPaneContextMenu = (event: FlowMouseEvent) => {
    event.preventDefault();
    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (bounds) setContextMenu({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
  };

  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (mod && key === "s") {
        event.preventDefault();
        saveNow();
      } else if (mod && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      } else if (mod && key === "c") {
        event.preventDefault();
        copySelection();
      } else if (mod && key === "v" && clipboard) {
        event.preventDefault();
        pasteNode();
      } else if (mod && key === "a") {
        event.preventDefault();
        const selectedNodes = nodes.map((node) => ({ ...node, selected: true }));
        const selectedEdges = edges.map((edge) => ({ ...edge, selected: true }));
        selectedBatch.current = { nodes: selectedNodes, edges: selectedEdges };
        setNodes(selectedNodes);
        setEdges(selectedEdges);
      } else if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedId) removeNodes([selectedId]);
        else if (selectedEdgeId) removeEdges([selectedEdgeId]);
      } else if (event.key === "Escape") {
        setContextMenu(undefined);
        setShortcutsOpen(false);
        setMobilePanel(undefined);
        setSelectedId(undefined);
        setSelectedEdgeId(undefined);
      } else if (key === "f") {
        flowInstance?.fitView({ padding: 0.2, duration: 250 });
      } else if (event.key === "?") {
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [clipboard, copySelection, edges, flowInstance, nodes, pasteNode, redo, removeEdges, removeNodes, saveNow, selectedEdgeId, selectedId, setEdges, setNodes, undo]);

  const contextNode = contextMenu?.nodeId ? nodes.find((node) => node.id === contextMenu.nodeId) : undefined;

  return (
    <main className={`app-shell ${mobilePanel ? `mobile-${mobilePanel}` : ""}`} onClick={() => contextMenu && setContextMenu(undefined)}>
      <header className="topbar editor-topbar">
        <div className="editor-left">
          <Link href="/dashboard" className="back-dashboard" aria-label="Back to dashboard"><ArrowLeft size={15} /></Link>
          <Link href="/" className="brand"><span className="brand-mark"><Workflow size={18} /></span><span>Sketch<span>2</span>Flow</span></Link>
          <span className="topbar-divider" />
          {editingName
            ? <input className="workflow-name-input" value={draftName} onChange={(event) => setDraftName(event.target.value)} onBlur={confirmName} onKeyDown={nameKeyDown} autoFocus aria-label="Workflow name" />
            : <button className="workflow-name" onClick={() => setEditingName(true)}>{workflowName}</button>}
          <span className={`save-status is-${saved}`} aria-live="polite"><span />{saved === "saved" ? "Saved" : saved === "dirty" ? "Unsaved changes" : saved === "saving" ? "Saving…" : "Save failed"}</span>
        </div>
        <div className="editor-center-controls">
          <button className="toolbar-button subtle" onClick={undo} disabled={!past.length} title="Undo (Ctrl/Cmd+Z)"><Undo2 size={16} />Undo</button>
          <button className="toolbar-button subtle" onClick={redo} disabled={!future.length} title="Redo (Ctrl/Cmd+Shift+Z)"><Redo2 size={16} />Redo</button>
          <button className="toolbar-button subtle" disabled title="Auto layout is coming soon"><LayoutTemplate size={16} />Auto layout</button>
          <button className="toolbar-button subtle" onClick={() => flowInstance?.fitView({ padding: 0.2, duration: 250 })} title="Fit view (F)"><Maximize size={16} />Fit view</button>
        </div>
        <div className="toolbar-actions">
          <button className="icon-button mobile-only" onClick={() => setMobilePanel((current) => current === "palette" ? undefined : "palette")} aria-label="Toggle node library"><PanelLeft size={16} /></button>
          <input ref={fileInput} className="hidden-file-input" type="file" accept="application/json,.json" onChange={onImport} aria-label="Import workflow JSON" />
          <button className={`toolbar-button ai-toolbar-button ${rightTab === "review" ? "is-active" : ""}`} onClick={openReview} title="AI readiness review" aria-label="Open AI review"><Sparkles size={16} /></button>
          <button className="toolbar-button subtle" onClick={saveNow} title="Save (Ctrl/Cmd+S)"><Save size={16} />Save</button>
          <button className="toolbar-button subtle" onClick={() => fileInput.current?.click()} title="Import JSON"><FileUp size={16} />Import</button>
          <div className="toolbar-menu-wrap">
            <button className="toolbar-button subtle" onClick={() => setExportOpen((current) => !current)} title="Export workflow" aria-expanded={exportOpen}><Download size={16} />Export<ChevronDown size={12} /></button>
            {exportOpen && <>
              <div className="fixed inset-0 z-30" onClick={() => setExportOpen(false)} />
              <div className="toolbar-menu" role="menu">
                <button role="menuitem" onClick={() => { exportWorkflow(); setExportOpen(false); }}><FileJson size={13} />Sketch2Flow JSON</button>
                <button role="menuitem" disabled title="n8n compilation is planned for Version 3">n8n JSON<span className="menu-note">V3</span></button>
                <button role="menuitem" disabled title="Image export is coming soon">PNG snapshot<span className="menu-note">soon</span></button>
              </div>
            </>}
          </div>
          <button className="icon-button" onClick={() => setShortcutsOpen(true)} title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts"><Keyboard size={16} /></button>
          <button className="icon-button" onClick={toggleTheme} title="Toggle theme" aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button className="icon-button" disabled title="Settings are coming soon" aria-label="Settings"><Settings size={16} /></button>
          <button className="icon-button mobile-only" onClick={() => setMobilePanel((current) => current === "inspector" ? undefined : "inspector")} aria-label="Toggle inspector"><SlidersHorizontal size={16} /></button>
          <button className="icon-button help" onClick={() => showNotice("Help center is coming soon.")} title="Help" aria-label="Help"><HelpCircle size={18} /></button>
        </div>
      </header>
      <div className="workspace">
        <NodePalette onAddNode={addNodeAtCenter} onDragStartNode={setDraggingNode} onDragEndNode={() => { setDraggingNode(undefined); setDropActive(false); }} />
        <section className="canvas-panel">
          <div className="canvas-toolbar">
            <div><span className="eyebrow">Canvas</span><h1>{workflowName}</h1></div>
            <div className="canvas-meta">
              <label className="snap-toggle"><input type="checkbox" checked={snapToGrid} onChange={(event) => setSnapToGrid(event.target.checked)} />Snap to grid</label>
              <button className="canvas-action" onClick={() => flowInstance?.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 250 })}>Reset</button>
              <span className="meta-separator" />
              <span>{nodes.length} nodes</span>
              <span className="meta-separator" />
              <span>{edges.length} connections</span>
              {hasCycle && <span className="cycle-warning" title="Cycles may be incompatible with future n8n compilation"><AlertTriangle size={11} />Cycle detected</span>}
            </div>
          </div>
          <div
            className={`flow-wrap ${dropActive ? "is-drop-target" : ""}`}
            ref={reactFlowWrapper}
            onDrop={(event) => { setDropActive(false); setDraggingNode(undefined); onDrop(event); }}
            onDragEnter={(event) => { event.preventDefault(); setDropActive(true); }}
            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropActive(true); }}
            onDragLeave={(event) => { const next = event.relatedTarget as unknown as globalThis.Node | null; if (!next || !event.currentTarget.contains(next)) setDropActive(false); }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onInit={setFlowInstance}
              onNodesChange={(changes) => {
                if (changes.some((change) => change.type === "select")) selectedBatch.current = undefined;
                if (changes.some((change) => (change.type === "position" && change.dragging === false) || change.type === "remove")) pushHistory();
                onNodesChange(changes);
              }}
              onEdgesChange={(changes) => {
                if (changes.some((change) => change.type === "select")) selectedBatch.current = undefined;
                if (changes.some((change) => change.type === "remove")) pushHistory();
                onEdgesChange(changes);
              }}
              onConnect={onConnect}
              onConnectEnd={(_, state) => { if (state.isValid === false && state.toNode) showNotice("Invalid connection."); }}
              onReconnect={onReconnect}
              edgesReconnectable
              isValidConnection={isValidConnection}
              onNodeClick={(_, node) => { selectedBatch.current = undefined; setSelectedId(node.id); setSelectedEdgeId(undefined); }}
              onEdgeClick={(_, edge) => { selectedBatch.current = undefined; setSelectedEdgeId(edge.id); setSelectedId(undefined); }}
              onNodeContextMenu={onNodeContextMenu}
              onPaneContextMenu={onPaneContextMenu}
              onPaneClick={() => { selectedBatch.current = undefined; setSelectedId(undefined); setSelectedEdgeId(undefined); }}
              selectionOnDrag
              selectionKeyCode="Shift"
              panOnDrag={[1]}
              snapToGrid={snapToGrid}
              snapGrid={[16, 16]}
              connectionLineType={ConnectionLineType.Bezier}
              defaultEdgeOptions={{ type: "default", animated: true }}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={22} size={1} color={theme === "dark" ? "#283142" : "#cbd5e1"} />
              <Controls showInteractive={false} />
              <MiniMap nodeColor={(node) => node.data.color === "violet" ? "#9b7cff" : node.data.color === "amber" ? "#e4ad54" : node.data.color === "emerald" ? "#51c9a6" : "#4ebed1"} maskColor={theme === "dark" ? "rgba(12, 16, 25, 0.78)" : "rgba(241, 245, 249, 0.75)"} />
            </ReactFlow>
            {!nodes.length && <div className="canvas-empty-state"><div className="empty-orbit"><Workflow size={20} /></div><strong>Start building your workflow.</strong><p>Drag a component from the sidebar to begin.</p></div>}
            {contextMenu && (
              <div className="canvas-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(event) => event.stopPropagation()}>
                {contextNode ? (
                  <>
                    <button onClick={() => renameFromMenu(contextNode.id)}>Rename</button>
                    <button onClick={() => { setSelectedId(contextNode.id); setContextMenu(undefined); setRightTab("inspector"); setMobilePanel("inspector"); }}>Edit</button>
                    <button onClick={() => duplicateNode(contextNode.id)}>Duplicate</button>
                    <button onClick={() => bringToFront(contextNode.id)}>Bring to Front</button>
                    <button onClick={() => { copySelection([contextNode.id]); setContextMenu(undefined); }}>Copy</button>
                    <button disabled={!clipboard} onClick={pasteNode}>Paste</button>
                    <button className="danger-menu-item" onClick={() => removeNodes([contextNode.id])}>Delete</button>
                  </>
                ) : <button disabled={!clipboard} onClick={pasteNode}>Paste</button>}
                <button className="context-close" onClick={() => setContextMenu(undefined)} aria-label="Close menu"><X size={13} /></button>
              </div>
            )}
            <div className="canvas-hint">{dropActive && draggingNode ? <><FileUp size={14} />Drop {draggingNode.label} to add it</> : <><LayoutTemplate size={14} /> Shift-drag to select multiple nodes</>}</div>
          </div>
        </section>
        <EditorSidebar tab={rightTab} onTabChange={setRightTab} nodes={nodes} edges={edges} hasCycle={hasCycle} workflowName={workflowName} selectedNode={selectedNode} selectedEdge={selectedEdge} focusNameSignal={focusNameSignal} onUpdateNode={updateNode} onUpdateEdge={updateEdge} onDeleteNode={(id) => removeNodes([id])} onDeleteEdge={(id) => removeEdges([id])} onClose={() => { setSelectedId(undefined); setSelectedEdgeId(undefined); setMobilePanel(undefined); }} onFocusNode={focusNode} getWorkflowDocument={documentForSave} onApplyAnswers={applyAnswerUpdates} onNotify={showNotice} />
      </div>

      {mobilePanel && <button className="mobile-scrim" onClick={() => setMobilePanel(undefined)} aria-label="Close panel" />}

      {notice && <div className="toast" role="status" aria-live="polite">{notice}</div>}

      {importError && (
        <div className="import-error" role="alert">{importError}<button onClick={() => setImportError(undefined)} aria-label="Dismiss import error"><X size={13} /></button></div>
      )}

      {shortcutsOpen && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setShortcutsOpen(false)}>
          <div className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" onClick={(event) => event.stopPropagation()}>
            <div className="dialog-heading"><div><span className="eyebrow">Reference</span><h2 id="shortcuts-title">Keyboard shortcuts</h2></div><button className="icon-button" onClick={() => setShortcutsOpen(false)} aria-label="Close shortcuts"><X size={16} /></button></div>
            <dl className="shortcut-list">{shortcuts.map(([keys, label]) => <div key={keys}><dt>{label}</dt><dd><kbd>{keys}</kbd></dd></div>)}</dl>
          </div>
        </div>
      )}

    </main>
  );
}
