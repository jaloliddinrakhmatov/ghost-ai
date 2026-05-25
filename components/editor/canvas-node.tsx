"use client";

import { memo, useState, useRef, useCallback } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { CanvasNode, NodeData } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

type Shape = NonNullable<NodeData["shape"]>;

const BORDER_DEFAULT = "var(--color-border-default)";
const BORDER_SELECTED = "var(--color-accent-primary)";
const BG = "var(--color-bg-elevated)";

const MIN_WIDTH = 80;
const MIN_HEIGHT = 40;

function borderColor(selected: boolean) {
  return selected ? BORDER_SELECTED : BORDER_DEFAULT;
}

function DiamondSvg({ w, h, selected, fill }: { w: number; h: number; selected: boolean; fill: string }) {
  const pts = `${w / 2},2 ${w - 2},${h / 2} ${w / 2},${h - 2} 2,${h / 2}`;
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }} overflow="visible">
      <polygon
        points={pts}
        fill={fill}
        stroke={borderColor(selected)}
        strokeWidth={1.5}
      />
    </svg>
  );
}

function HexagonSvg({ w, h, selected, fill }: { w: number; h: number; selected: boolean; fill: string }) {
  const cx = w / 2;
  const cy = h / 2;
  const rx = cx - 2;
  const ry = cy - 2;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }} overflow="visible">
      <polygon
        points={pts}
        fill={fill}
        stroke={borderColor(selected)}
        strokeWidth={1.5}
      />
    </svg>
  );
}

function CylinderSvg({ w, h, selected, fill }: { w: number; h: number; selected: boolean; fill: string }) {
  const ry = Math.max(6, h * 0.12);
  const stroke = borderColor(selected);
  return (
    <svg width={w} height={h} style={{ position: "absolute", inset: 0 }} overflow="visible">
      <rect x={2} y={ry} width={w - 4} height={h - ry * 2} fill={fill} stroke="none" />
      <line x1={2} y1={ry} x2={2} y2={h - ry} stroke={stroke} strokeWidth={1.5} />
      <line x1={w - 2} y1={ry} x2={w - 2} y2={h - ry} stroke={stroke} strokeWidth={1.5} />
      <ellipse cx={w / 2} cy={h - ry} rx={(w - 4) / 2} ry={ry} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <ellipse cx={w / 2} cy={ry} rx={(w - 4) / 2} ry={ry} fill={fill} stroke={stroke} strokeWidth={1.5} />
    </svg>
  );
}

function cssRadiusForShape(shape: Shape): string {
  if (shape === "pill") return "9999px";
  if (shape === "circle") return "50%";
  return "4px";
}

const handleStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  background: "#fff",
  border: "1.5px solid #444",
  borderRadius: "50%",
  opacity: 0,
  transition: "opacity 0.15s",
};

const HANDLES = (
  <>
    <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
    <Handle type="target" position={Position.Top} id="top-t" style={handleStyle} />
    <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
    <Handle type="target" position={Position.Right} id="right-t" style={handleStyle} />
    <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
    <Handle type="target" position={Position.Bottom} id="bottom-t" style={handleStyle} />
    <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
    <Handle type="target" position={Position.Left} id="left-t" style={handleStyle} />
  </>
);

interface LabelEditorProps {
  label: string;
  shape: Shape;
  onCommit: (value: string) => void;
}

function LabelOverlay({ label, shape, onCommit }: LabelEditorProps) {
  const [value, setValue] = useState(label);
  const ref = useRef<HTMLTextAreaElement>(null);

  const commit = useCallback(() => {
    onCommit(value);
  }, [value, onCommit]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onCommit(label);
      }
      // stop ReactFlow from handling keys while editing
      e.stopPropagation();
    },
    [label, onCommit]
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <textarea
        ref={ref}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder={shape}
        className="w-full resize-none bg-transparent text-sm text-text-primary text-center outline-none border-none px-2 py-0"
        style={{ fontFamily: "inherit", overflow: "hidden" }}
      />
    </div>
  );
}

interface ColorToolbarProps {
  nodeId: string;
  activeColor?: string;
}

function NodeColorToolbar({ nodeId, activeColor }: ColorToolbarProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent, bg: string, text: string) => {
      e.stopPropagation();
      document.dispatchEvent(
        new CustomEvent("node:color-update", { detail: { id: nodeId, color: bg, textColor: text } })
      );
    },
    [nodeId]
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 4,
        padding: "4px 8px",
        borderRadius: 9999,
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-default)",
        zIndex: 10,
        pointerEvents: "all",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {NODE_COLORS.map(({ bg, text }) => {
        const isActive = activeColor === bg;
        const isHovered = hovered === bg;
        return (
          <button
            key={bg}
            title={bg}
            onMouseEnter={() => setHovered(bg)}
            onMouseLeave={() => setHovered(null)}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => handleClick(e, bg, text)}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: bg,
              border: isActive
                ? `2px solid ${text}`
                : "2px solid transparent",
              boxShadow: isHovered
                ? `0 0 6px 2px ${text}55`
                : "none",
              cursor: "pointer",
              transition: "box-shadow 0.15s, border-color 0.15s",
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

function CanvasNodeComponent({ id, data, selected, width, height }: NodeProps<CanvasNode>) {
  const shape = data.shape ?? "rectangle";
  const w = width ?? 160;
  const h = height ?? 80;
  const isSvgShape = shape === "diamond" || shape === "hexagon" || shape === "cylinder";
  const [editing, setEditing] = useState(false);
  const nodeBg = data.color ?? BG;
  const nodeText = data.textColor ?? "var(--color-text-primary)";

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  }, []);

  const handleCommit = useCallback(
    (newLabel: string) => {
      setEditing(false);
      // dispatch a custom event canvas-wrapper listens to for label updates
      const event = new CustomEvent("node:label-update", {
        detail: { id, label: newLabel },
        bubbles: true,
      });
      document.dispatchEvent(event);
    },
    [id]
  );

  const labelEl = editing ? (
    <LabelOverlay label={data.label} shape={shape} onCommit={handleCommit} />
  ) : (
    <span
      className="absolute inset-0 flex items-center justify-center text-sm px-2 text-center wrap-break-word pointer-events-none select-none"
      style={{ zIndex: 1, color: nodeText }}
    >
      {data.label || <span style={{ color: "var(--color-text-faint)" }}>{shape}</span>}
    </span>
  );

  if (isSvgShape) {
    return (
      <div
        style={{ position: "relative", width: w, height: h }}
        onDoubleClick={handleDoubleClick}
      >
        <NodeResizer
          isVisible={!!selected}
          minWidth={MIN_WIDTH}
          minHeight={MIN_HEIGHT}
          lineStyle={{ borderColor: BORDER_SELECTED, opacity: 0.5 }}
          handleStyle={{ borderColor: BORDER_SELECTED, background: "var(--color-bg-elevated)", width: 8, height: 8 }}
        />
        {HANDLES}
        {shape === "diamond" && <DiamondSvg w={w} h={h} selected={!!selected} fill={nodeBg} />}
        {shape === "hexagon" && <HexagonSvg w={w} h={h} selected={!!selected} fill={nodeBg} />}
        {shape === "cylinder" && <CylinderSvg w={w} h={h} selected={!!selected} fill={nodeBg} />}
        {labelEl}
        {selected && <NodeColorToolbar nodeId={id} activeColor={data.color} />}
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center justify-center w-full h-full text-sm border"
      style={{
        borderRadius: cssRadiusForShape(shape),
        borderColor: selected ? BORDER_SELECTED : BORDER_DEFAULT,
        backgroundColor: nodeBg,
      }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        isVisible={!!selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        lineStyle={{ borderColor: BORDER_SELECTED, opacity: 0.5 }}
        handleStyle={{ borderColor: BORDER_SELECTED, background: "var(--color-bg-elevated)", width: 8, height: 8 }}
      />
      {HANDLES}
      {labelEl}
      {selected && <NodeColorToolbar nodeId={id} activeColor={data.color} />}
    </div>
  );
}

export const CanvasNodeRenderer = memo(CanvasNodeComponent);
