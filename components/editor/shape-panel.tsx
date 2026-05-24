"use client";

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

export function ShapePanel() {
  function handleDragStart(e: React.DragEvent, config: ShapeConfig) {
    const payload: ShapeDragPayload = {
      shape: config.shape,
      defaultWidth: config.defaultWidth,
      defaultHeight: config.defaultHeight,
    };
    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-2 rounded-full bg-bg-elevated border border-border-default shadow-lg">
      {SHAPES.map((config) => (
        <button
          key={config.shape}
          draggable
          onDragStart={(e) => handleDragStart(e, config)}
          onMouseDown={(e) => e.stopPropagation()}
          title={config.label}
          aria-label={`Drag ${config.label} shape`}
          className="flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:text-text-default hover:bg-bg-subtle transition-colors cursor-grab active:cursor-grabbing"
        >
          {config.icon}
        </button>
      ))}
    </div>
  );
}
