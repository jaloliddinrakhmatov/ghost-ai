"use client";

import { Component, ReactNode, useCallback, useEffect, useState } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense, useHistory, useCanUndo, useCanRedo, useMutation } from "@liveblocks/react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  useNodes,
  useEdges,
  ReactFlowProvider,
  ConnectionMode,
  MarkerType,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import type { CanvasNode, CanvasEdge, NodeData } from "@/types/canvas";
import type { CanvasTemplate } from "./starter-templates";
import { ShapePanel, DRAG_TYPE, type ShapeDragPayload } from "./shape-panel";
import { CanvasNodeRenderer } from "./canvas-node";
import { CanvasEdgeRenderer } from "./canvas-edge";
import { CanvasControlBar } from "./canvas-control-bar";
import { PresenceAvatars } from "./presence-avatars";
import { LiveCursors } from "./live-cursors";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useCanvasAutosave, type SaveStatus } from "@/hooks/use-canvas-autosave";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

import "@xyflow/react/dist/style.css";

const nodeTypes = { canvasNode: CanvasNodeRenderer };
const edgeTypes = { canvasEdge: CanvasEdgeRenderer };

const defaultEdgeOptions = {
  type: "canvasEdge",
  markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, color: "var(--color-border-default)" },
  style: { strokeLinecap: "round" as const },
};

class LiveblocksErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : "Connection failed" };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="h-full w-full flex items-center justify-center text-text-muted text-sm">
          {this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-bg-elevated border border-border-default text-text-muted pointer-events-none select-none">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving…
        </>
      )}
      {status === "saved" && (
        <>
          <CheckCircle className="h-3 w-3 text-green-400" />
          Saved
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-red-400" />
          Save failed
        </>
      )}
    </div>
  );
}

// Rendered inside ReactFlowProvider — can safely call useReactFlow
function CanvasInner({ projectId }: { projectId: string }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });
  const instance = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition, setNodes, setEdges } = instance;
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const { status: saveStatus, save } = useCanvasAutosave(projectId, nodes, edges);

  // Broadcast save status to WorkspaceClient via custom event
  useEffect(() => {
    document.dispatchEvent(new CustomEvent("canvas:save-status", { detail: saveStatus }));
  }, [saveStatus]);

  // Listen for manual save requests from the navbar button
  useEffect(() => {
    function onManualSave() { save(); }
    document.addEventListener("canvas:manual-save", onManualSave);
    return () => document.removeEventListener("canvas:manual-save", onManualSave);
  }, [save]);

  const updateCursor = useMutation(
    ({ setMyPresence }, clientX: number, clientY: number) => {
      const pos = screenToFlowPosition({ x: clientX, y: clientY });
      setMyPresence({ cursor: pos });
    },
    [screenToFlowPosition]
  );

  const clearCursor = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  useKeyboardShortcuts({ instance, undo: history.undo, redo: history.redo });

  // Delete selected nodes and edges via Liveblocks state
  const allNodes = useNodes<CanvasNode>();
  const allEdges = useEdges<CanvasEdge>();
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) return;
      const selectedNodes = allNodes.filter((n) => n.selected);
      const selectedEdges = allEdges.filter((ed) => ed.selected);
      if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
      onDelete({ nodes: selectedNodes, edges: selectedEdges });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [allNodes, allEdges, onDelete]);

  // Load saved canvas if room is empty on first render
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) return;
    fetch(`/api/projects/${projectId}/canvas`)
      .then((r) => r.json())
      .then(({ canvas }) => {
        if (!canvas) return;
        if (canvas.nodes?.length > 0 || canvas.edges?.length > 0) {
          setNodes(canvas.nodes ?? []);
          setEdges(canvas.edges ?? []);
          requestAnimationFrame(() => instance.fitView({ duration: 300 }));
        }
      })
      .catch(() => {});
    // only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onLabelUpdate(e: Event) {
      const { id, label } = (e as CustomEvent<{ id: string; label: string }>).detail;
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n))
      );
    }
    function onColorUpdate(e: Event) {
      const { id, color, textColor } = (e as CustomEvent<{ id: string; color: string; textColor: string }>).detail;
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, color, textColor } } : n))
      );
    }
    function onEdgeLabelUpdate(e: Event) {
      const { id, label } = (e as CustomEvent<{ id: string; label: string }>).detail;
      setEdges((eds) =>
        eds.map((edge) => (edge.id === id ? { ...edge, data: { ...edge.data, label } } : edge))
      );
    }
    function onLoadTemplate(e: Event) {
      const { nodes: tNodes, edges: tEdges } = (e as CustomEvent<CanvasTemplate>).detail;
      setNodes(tNodes);
      setEdges(tEdges);
      requestAnimationFrame(() => instance.fitView({ duration: 300 }));
    }
    document.addEventListener("node:label-update", onLabelUpdate);
    document.addEventListener("node:color-update", onColorUpdate);
    document.addEventListener("edge:label-update", onEdgeLabelUpdate);
    document.addEventListener("canvas:load-template", onLoadTemplate);
    return () => {
      document.removeEventListener("node:label-update", onLabelUpdate);
      document.removeEventListener("node:color-update", onColorUpdate);
      document.removeEventListener("edge:label-update", onEdgeLabelUpdate);
      document.removeEventListener("canvas:load-template", onLoadTemplate);
    };
  }, [setNodes, setEdges]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(DRAG_TYPE)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DRAG_TYPE);
      if (!raw) return;

      let payload: ShapeDragPayload;
      try {
        payload = JSON.parse(raw);
      } catch {
        return;
      }

      // screenToFlowPosition converts viewport coords to flow coords, accounting
      // for the container rect, pan offset, and zoom scale. We use the raw
      // cursor position so the node center lands exactly at the cursor on drop.
      // offsetX/offsetY (where the user grabbed inside the button) are stored
      // in the payload for reference but cursor position is already exact here.
      const cursorFlow = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = `${payload.shape}-${crypto.randomUUID()}`;

      const newNode: CanvasNode = {
        id,
        type: "canvasNode",
        position: {
          x: cursorFlow.x - payload.defaultWidth / 2,
          y: cursorFlow.y - payload.defaultHeight / 2,
        },
        style: { width: payload.defaultWidth, height: payload.defaultHeight },
        data: {
          label: "",
          shape: payload.shape,
          color: undefined,
        } satisfies NodeData,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div
      className="relative h-full w-full bg-bg-base"
      onMouseLeave={() => clearCursor()}
    >
      <ReactFlow<CanvasNode, CanvasEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseMove={(e) => {
          updateCursor(e.clientX, e.clientY);
        }}
        className="h-full w-full"
        style={{ background: "transparent" }}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ffffff30" />
      </ReactFlow>

      {/* Live cursors — overlay inside canvas bounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <LiveCursors />
      </div>

      {/* Presence avatars — top-right of canvas */}
      <div className="absolute top-3 right-3 z-40 pointer-events-auto">
        <PresenceAvatars />
      </div>

      <CanvasControlBar
        instance={instance}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={history.undo}
        onRedo={history.redo}
      />
      <ShapePanel />
      <SaveStatusIndicator status={saveStatus} />
    </div>
  );
}

function Canvas({ projectId }: { projectId: string }) {
  return (
    <ReactFlowProvider>
      <CanvasInner projectId={projectId} />
    </ReactFlowProvider>
  );
}

export function CanvasWrapper({ roomId }: { roomId: string }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, thinking: false }}
      >
        <LiveblocksErrorBoundary>
          <ClientSideSuspense
            fallback={
              <div className="h-full w-full flex items-center justify-center text-text-muted text-sm">
                Connecting…
              </div>
            }
          >
            <Canvas projectId={roomId} />
          </ClientSideSuspense>
        </LiveblocksErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
