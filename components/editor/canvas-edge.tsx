"use client";

import { memo, useState, useRef, useCallback } from "react";
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  BaseEdge,
} from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";
import type { CanvasEdge } from "@/types/canvas";

function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps<CanvasEdge>) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data?.label ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const dispatchLabelUpdate = useCallback(
    (label: string) => {
      document.dispatchEvent(
        new CustomEvent("edge:label-update", { detail: { id, label } })
      );
    },
    [id]
  );

  const commit = useCallback(() => {
    setEditing(false);
    dispatchLabelUpdate(draft);
  }, [draft, dispatchLabelUpdate]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setDraft(data?.label ?? "");
      setEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [data?.label]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter" || e.key === "Escape") {
        if (e.key === "Escape") setDraft(data?.label ?? "");
        commit();
      }
    },
    [commit, data?.label]
  );

  const savedLabel = data?.label;

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          onDoubleClick={handleDoubleClick}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="nodrag nopan"
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
              }}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              placeholder="Label…"
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                borderRadius: 4,
                color: "var(--color-text-default)",
                fontSize: 11,
                padding: "2px 6px",
                outline: "none",
                minWidth: 40,
                width: Math.max(40, draft.length * 7 + 16),
              }}
            />
          ) : savedLabel ? (
            <span
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                borderRadius: 9999,
                color: "var(--color-text-default)",
                fontSize: 11,
                padding: "2px 8px",
                whiteSpace: "nowrap",
                cursor: "default",
              }}
            >
              {savedLabel}
            </span>
          ) : (selected || editing) ? (
            <span
              style={{
                color: "var(--color-text-faint)",
                fontSize: 11,
                padding: "2px 4px",
                cursor: "default",
              }}
            >
              + label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const CanvasEdgeRenderer = memo(CanvasEdgeComponent);
