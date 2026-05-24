import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#7C6AFA", // violet
  "#22D3EE", // cyan
  "#34D399", // emerald
  "#FB923C", // orange
  "#F472B6", // pink
  "#A78BFA", // purple
  "#FACC15", // yellow
  "#60A5FA", // blue
];

export function cursorColorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

declare global {
  // eslint-disable-next-line no-var
  var _liveblocks: Liveblocks | undefined;
}

export function getLiveblocks(): Liveblocks {
  if (globalThis._liveblocks) return globalThis._liveblocks;
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  globalThis._liveblocks = new Liveblocks({ secret });
  return globalThis._liveblocks;
}
