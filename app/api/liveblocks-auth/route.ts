import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getLiveblocks, cursorColorForUser } from "@/lib/liveblocks";
import { getProjectWithAccess } from "@/lib/project-access";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let roomId: string | undefined;
  try {
    const body = await req.json();
    if (typeof body?.room === "string") roomId = body.room;
  } catch {
    // no body
  }

  if (!roomId) {
    return NextResponse.json({ error: "room is required" }, { status: 400 });
  }

  const { hasAccess, unauthenticated } = await getProjectWithAccess(roomId);
  if (unauthenticated || !hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ensure the room exists, create only if needed
  const lb = getLiveblocks();

  try {
    await lb.getRoom(roomId);
  } catch (error: unknown) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: number }).status
        : undefined;
    if (status === 404) {
      await lb.createRoom(roomId, { defaultAccesses: [] });
    } else {
      throw error;
    }
  }

  const name =
    user.fullName ??
    user.username ??
    user.primaryEmailAddress?.emailAddress ??
    "Anonymous";
  const avatar = user.imageUrl ?? "";
  const color = cursorColorForUser(user.id);

  const session = lb.prepareSession(user.id, {
    userInfo: { name, avatar, color },
  });

  session.allow(roomId, session.FULL_ACCESS);

  const { body, status } = await session.authorize();
  return new NextResponse(body, { status });
}
