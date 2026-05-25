"use client";

import { useOthers, useSelf } from "@liveblocks/react";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

const AVATAR_SIZE = 32;
const MAX_SHOWN = 5;

function CollaboratorAvatar({
  name,
  avatar,
  color,
}: {
  name: string;
  avatar: string;
  color: string;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      title={name}
      style={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        outline: `2px solid ${color}`,
        outlineOffset: 1,
      }}
      className="rounded-full overflow-hidden shrink-0 bg-bg-elevated flex items-center justify-center"
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-[11px] font-semibold text-text-primary">{initials}</span>
      )}
    </div>
  );
}

export function PresenceAvatars() {
  const { user } = useUser();
  const others = useOthers();
  const self = useSelf();

  const currentUserId = self?.id ?? user?.id ?? null;

  const collaborators = others.filter(
    (o) => o.id !== currentUserId
  );

  const shown = collaborators.slice(0, MAX_SHOWN);
  const overflow = collaborators.length - MAX_SHOWN;

  return (
    <div className="flex items-center gap-2 pointer-events-none select-none">
      {shown.length > 0 && (
        <div className="flex items-center">
          {shown.map((o, i) => (
            <div
              key={o.connectionId}
              style={{ marginLeft: i === 0 ? 0 : -10, zIndex: shown.length - i }}
              className="relative"
            >
              <CollaboratorAvatar
                name={o.info?.name ?? "Unknown"}
                avatar={o.info?.avatar ?? ""}
                color={o.info?.color ?? "#888"}
              />
            </div>
          ))}
          {overflow > 0 && (
            <div
              style={{ marginLeft: -10, zIndex: 0 }}
              className="relative w-8 h-8 rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center"
            >
              <span className="text-[10px] font-semibold text-text-muted">+{overflow}</span>
            </div>
          )}
        </div>
      )}

      {shown.length > 0 && (
        <div className="w-px h-5 bg-white/10 shrink-0" />
      )}

      <div
        className="pointer-events-auto"
        style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: `w-[${AVATAR_SIZE}px] h-[${AVATAR_SIZE}px]`,
            },
          }}
        />
      </div>
    </div>
  );
}
