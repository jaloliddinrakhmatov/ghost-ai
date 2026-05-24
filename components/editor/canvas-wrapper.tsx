"use client";

import { Component, ReactNode, useCallback } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import type { CanvasNode, CanvasEdge, NodeData } from "@/types/canvas";
import { ShapePanel, DRAG_TYPE, type ShapeDragPayload } from "./shape-panel";
import { CanvasNodeRenderer } from "./canvas-node";

import "@xyflow/react/dist/style.css";

const nodeTypes = { canvasNode: CanvasNodeRenderer };

let nodeCounter = 0;

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
  const { screenToFlowPosition, setNodes } = useReactFlow<CanvasNode, CanvasEdge>();

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
      const id = `${payload.shape}-${Date.now()}-${++nodeCounter}`;

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
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        fitView
        className="h-full w-full"
        style={{ background: "transparent" }}
        proOptions={{ hideAttribution: false }}
      >
        <MiniMap
          className="!bg-bg-elevated !border-border-default"
          maskColor="rgba(0,0,0,0.4)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#ffffff30" />
      </ReactFlow>
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
