"use client";

import { useOthers } from "@liveblocks/react";
import { useViewport } from "@xyflow/react";

export function LiveCursors() {
  const others = useOthers();
  const { x: vpX, y: vpY, zoom } = useViewport();

  return (
    <>
      {others.map((other) => {
        const cursor = other.presence.cursor;
        if (!cursor) return null;
        const color = other.info?.color ?? "#888888";
        const name = other.info?.name ?? "Unknown";

        // Convert flow coordinates to viewport-relative pixels
        const screenX = cursor.x * zoom + vpX;
        const screenY = cursor.y * zoom + vpY;

        return (
          <div
            key={other.connectionId}
            className="absolute pointer-events-none z-50"
            style={{ left: screenX, top: screenY, transform: "translate(0, 0)" }}
          >
            <svg
              width="18"
              height="22"
              viewBox="0 0 18 22"
              fill="none"
              style={{ display: "block" }}
            >
              <path d="M0 0L18 14H9L5 22L0 0Z" fill={color} />
            </svg>
            <div
              className="mt-1 px-2 py-0.5 rounded text-[11px] font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </>
  );
}
