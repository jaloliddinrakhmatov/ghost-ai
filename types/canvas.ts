import type { Node, Edge } from "@xyflow/react";

export interface NodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  shape?: "rectangle" | "circle" | "diamond" | "pill" | "cylinder" | "hexagon";
}

export type CanvasNode = Node<NodeData, "canvasNode">;
export type CanvasEdge = Edge<Record<string, unknown>, "canvasEdge">;
