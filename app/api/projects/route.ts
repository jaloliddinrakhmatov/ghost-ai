import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let name = "Untitled Project";
  let id: string | undefined;
  try {
    const body = await req.json();
    if (typeof body.name === "string" && body.name.trim()) name = body.name.trim();
    if (typeof body.id === "string" && body.id.trim()) id = body.id.trim();
  } catch {
    // no body — use defaults
  }

  const project = await prisma.project.create({
    data: { ...(id ? { id } : {}), ownerId: userId, name },
  });

  return NextResponse.json(project, { status: 201 });
}
