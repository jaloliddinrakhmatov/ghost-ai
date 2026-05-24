"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode, NodeData } from "@/types/canvas";

function CanvasNodeComponent({ data, selected }: NodeProps<CanvasNode>) {
  return (
    <div
      className="relative flex items-center justify-center w-full h-full rounded border text-sm text-text-default select-none"
      style={{
        borderColor: selected ? "var(--color-accent-primary)" : "var(--color-border-default)",
        backgroundColor: data.color ?? "var(--color-bg-elevated)",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <span className="px-2 text-center break-words">{data.label || data.shape}</span>
    </div>
  );
}

export const CanvasNodeRenderer = memo(CanvasNodeComponent);
