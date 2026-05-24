"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { NodeData } from "@/types/canvas";

type Shape = NonNullable<NodeData["shape"]>;

interface ShapeConfig {
  shape: Shape;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  icon: React.ReactNode;
}

const SHAPES: ShapeConfig[] = [
  {
    shape: "rectangle",
    label: "Rectangle",
    defaultWidth: 160,
    defaultHeight: 80,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    shape: "diamond",
    label: "Diamond",
    defaultWidth: 130,
    defaultHeight: 130,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L18 10L10 18L2 10Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    shape: "circle",
    label: "Circle",
    defaultWidth: 100,
    defaultHeight: 100,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    shape: "pill",
    label: "Pill",
    defaultWidth: 150,
    defaultHeight: 70,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="6" width="16" height="8" rx="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    shape: "cylinder",
    label: "Cylinder",
    defaultWidth: 100,
    defaultHeight: 120,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <ellipse cx="10" cy="5" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="3" y1="5" x2="3" y2="15" stroke="currentColor" strokeWidth="1.5" />
        <line x1="17" y1="5" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="10" cy="15" rx="7" ry="2.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    shape: "hexagon",
    label: "Hexagon",
    defaultWidth: 110,
    defaultHeight: 110,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2L17.5 6V14L10 18L2.5 14V6Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

export interface ShapeDragPayload {
  shape: Shape;
  defaultWidth: number;
  defaultHeight: number;
}

export const DRAG_TYPE = "application/ghost-shape";

// Scale preview down to avoid being too large
const PREVIEW_SCALE = 0.5;

function ShapePreview({
  shape,
  width,
  height,
}: {
  shape: Shape;
  width: number;
  height: number;
}) {
  const w = width * PREVIEW_SCALE;
  const h = height * PREVIEW_SCALE;
  const stroke = "var(--color-accent-primary)";
  const fill = "var(--color-bg-elevated)";

  if (shape === "diamond") {
    const pts = `${w / 2},2 ${w - 2},${h / 2} ${w / 2},${h - 2} 2,${h / 2}`;
    return (
      <svg width={w} height={h} fill="none">
        <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1.5} />
      </svg>
    );
  }

  if (shape === "hexagon") {
    const cx = w / 2, cy = h / 2;
    const rx = cx - 2, ry = cy - 2;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return `${cx + rx * Math.cos(a)},${cy + ry * Math.sin(a)}`;
    }).join(" ");
    return (
      <svg width={w} height={h} fill="none">
        <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={1.5} />
      </svg>
    );
  }

  if (shape === "cylinder") {
    const ry = Math.max(4, h * 0.12);
    return (
      <svg width={w} height={h} fill="none">
        <rect x={2} y={ry} width={w - 4} height={h - ry * 2} fill={fill} stroke="none" />
        <line x1={2} y1={ry} x2={2} y2={h - ry} stroke={stroke} strokeWidth={1.5} />
        <line x1={w - 2} y1={ry} x2={w - 2} y2={h - ry} stroke={stroke} strokeWidth={1.5} />
        <ellipse cx={w / 2} cy={h - ry} rx={(w - 4) / 2} ry={ry} fill={fill} stroke={stroke} strokeWidth={1.5} />
        <ellipse cx={w / 2} cy={ry} rx={(w - 4) / 2} ry={ry} fill={fill} stroke={stroke} strokeWidth={1.5} />
      </svg>
    );
  }

  // CSS shapes: rectangle, pill, circle
  const radius = shape === "circle" || shape === "pill" ? "9999px" : "3px";
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        border: `1.5px solid ${stroke}`,
        backgroundColor: fill,
      }}
    />
  );
}

interface DragState {
  shape: Shape;
  defaultWidth: number;
  defaultHeight: number;
  x: number;
  y: number;
}

// 1×1 transparent GIF used to suppress the browser's default drag image
const TRANSPARENT_IMG =
  typeof Image !== "undefined"
    ? (() => {
        const img = new Image();
        img.src =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        return img;
      })()
    : null;

export function ShapePanel() {
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  function handleDragStart(e: React.DragEvent, config: ShapeConfig) {
    const payload: ShapeDragPayload = {
      shape: config.shape,
      defaultWidth: config.defaultWidth,
      defaultHeight: config.defaultHeight,
    };
    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";

    if (TRANSPARENT_IMG) {
      e.dataTransfer.setDragImage(TRANSPARENT_IMG, 0, 0);
    }

    setDrag({
      shape: config.shape,
      defaultWidth: config.defaultWidth,
      defaultHeight: config.defaultHeight,
      x: e.clientX,
      y: e.clientY,
    });
  }

  function handleDrag(e: React.DragEvent) {
    // clientX/Y are 0 when cursor leaves the viewport
    if (e.clientX === 0 && e.clientY === 0) return;
    setDrag((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev));
  }

  function handleDragEnd() {
    setDrag(null);
  }

  return (
    <>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-2 rounded-full bg-bg-elevated border border-border-default shadow-lg">
        {SHAPES.map((config) => (
          <button
            key={config.shape}
            draggable
            onDragStart={(e) => handleDragStart(e, config)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onMouseDown={(e) => e.stopPropagation()}
            title={config.label}
            aria-label={`Drag ${config.label} shape`}
            className="flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:text-text-default hover:bg-bg-subtle transition-colors cursor-grab active:cursor-grabbing"
          >
            {config.icon}
          </button>
        ))}
      </div>

      {drag &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: drag.x,
              top: drag.y,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              opacity: 0.7,
              zIndex: 9999,
            }}
          >
            <ShapePreview
              shape={drag.shape}
              width={drag.defaultWidth}
              height={drag.defaultHeight}
            />
          </div>,
          document.body
        )}
    </>
  );
}
