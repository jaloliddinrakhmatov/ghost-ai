"use client";

import { useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFlowInstance = { zoomIn: (opts?: any) => void; zoomOut: (opts?: any) => void } | null;

interface Options {
  instance: AnyFlowInstance;
  undo: () => void;
  redo: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({ instance, undo, redo }: Options) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;

      const meta = e.metaKey || e.ctrlKey;

      if (!meta && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        instance?.zoomIn({ duration: 200 });
        return;
      }
      if (!meta && e.key === "-") {
        e.preventDefault();
        instance?.zoomOut({ duration: 200 });
        return;
      }
      if (meta && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
        return;
      }
      if (meta && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [instance, undo, redo]);
}
