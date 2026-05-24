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

  const idPattern = /^[a-z0-9-_]{3,64}$/;
  let name = "Untitled Project";
  let id: string | undefined;
  try {
    const body = await req.json();
    if (typeof body.name === "string" && body.name.trim()) name = body.name.trim();
    if (typeof body.id === "string" && body.id.trim()) {
      const candidate = body.id.trim().toLowerCase();
      if (!idPattern.test(candidate))
        return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
      id = candidate;
    }
  } catch {
    // no body — use defaults
  }

  const project = await prisma.project.create({
    data: { ...(id ? { id } : {}), ownerId: userId, name },
  });

  return NextResponse.json(project, { status: 201 });
}
