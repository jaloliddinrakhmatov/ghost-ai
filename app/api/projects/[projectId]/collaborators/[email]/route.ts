import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ projectId: string; email: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, email } = await params;
  let decodedEmail: string;
  try {
    decodedEmail = decodeURIComponent(email).toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid email path parameter" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.projectCollaborator.deleteMany({
    where: { projectId, email: decodedEmail },
  });

  return new NextResponse(null, { status: 204 });
}
