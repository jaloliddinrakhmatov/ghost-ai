import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getProjectWithAccess } from "@/lib/project-access";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { project, hasAccess, unauthenticated } = await getProjectWithAccess(projectId);

  if (unauthenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!project || !hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let canvasJson: unknown;
  try {
    canvasJson = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const blob = await put(
    `canvas/${projectId}.json`,
    JSON.stringify(canvasJson),
    { access: "private", contentType: "application/json", allowOverwrite: true }
  );

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { project, hasAccess, unauthenticated } = await getProjectWithAccess(projectId);

  if (unauthenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!project || !hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!project.canvasJsonPath) {
    return NextResponse.json({ canvas: null });
  }

  try {
    // Private blobs require Bearer token auth to read server-side
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const res = await fetch(project.canvasJsonPath, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return NextResponse.json({ canvas: null });
    const canvas = await res.json();
    return NextResponse.json({ canvas });
  } catch {
    return NextResponse.json({ canvas: null });
  }
}
