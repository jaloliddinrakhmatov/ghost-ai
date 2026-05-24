"use client";

import { Component, ReactNode, useCallback, useEffect } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense, useHistory, useCanUndo, useCanRedo } from "@liveblocks/react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
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
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

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

// Rendered inside ReactFlowProvider — can safely call useReactFlow
function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({ suspense: true });
  const instance = useReactFlow<CanvasNode, CanvasEdge>();
  const { screenToFlowPosition, setNodes, setEdges } = instance;
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({ instance, undo: history.undo, redo: history.redo });

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

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = `${payload.shape}-${crypto.randomUUID()}`;

      const newNode: CanvasNode = {
        id,
        type: "canvasNode",
        position: {
          x: position.x - payload.defaultWidth / 2,
          y: position.y - payload.defaultHeight / 2,
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
    <div className="relative h-full w-full bg-bg-base">
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
        fitView
        className="h-full w-full"
        style={{ background: "transparent" }}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ffffff30" />
      </ReactFlow>
      <CanvasControlBar
        instance={instance}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={history.undo}
        onRedo={history.redo}
      />
      <ShapePanel />
    </div>
  );
}

function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}

export function CanvasWrapper({ roomId }: { roomId: string }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <LiveblocksErrorBoundary>
          <ClientSideSuspense
            fallback={
              <div className="h-full w-full flex items-center justify-center text-text-muted text-sm">
                Connecting…
              </div>
            }
          >
            <Canvas />
          </ClientSideSuspense>
        </LiveblocksErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
