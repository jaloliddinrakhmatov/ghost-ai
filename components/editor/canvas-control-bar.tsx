"use client";

import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFlowInstance = { zoomIn: (opts?: any) => void; zoomOut: (opts?: any) => void; fitView: (opts?: any) => void } | null;

interface Props {
  instance: AnyFlowInstance;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

interface BarButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function BarButton({ onClick, disabled, title, children }: BarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center justify-center w-8 h-8 rounded-md transition-colors
        text-text-secondary hover:text-text-primary hover:bg-bg-elevated
        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text-secondary"
    >
      {children}
    </button>
  );
}

export function CanvasControlBar({ instance, canUndo, canRedo, onUndo, onRedo }: Props) {
  return (
    <div
      className="absolute bottom-16 left-4 z-10 flex items-center gap-0.5 px-1.5 py-1.5
        bg-bg-surface border border-border-default rounded-full shadow-lg"
    >
      <BarButton
        onClick={() => instance?.zoomOut({ duration: 200 })}
        title="Zoom out (−)"
      >
        <ZoomOut size={16} />
      </BarButton>
      <BarButton
        onClick={() => instance?.fitView({ duration: 300, padding: 0.1 })}
        title="Fit view"
      >
        <Maximize2 size={15} />
      </BarButton>
      <BarButton
        onClick={() => instance?.zoomIn({ duration: 200 })}
        title="Zoom in (+)"
      >
        <ZoomIn size={16} />
      </BarButton>

      <div className="w-px h-5 bg-border-default mx-1" />

      <BarButton onClick={onUndo} disabled={!canUndo} title="Undo (⌘Z)">
        <Undo2 size={16} />
      </BarButton>
      <BarButton onClick={onRedo} disabled={!canRedo} title="Redo (⌘⇧Z)">
        <Redo2 size={16} />
      </BarButton>
    </div>
  );
}
