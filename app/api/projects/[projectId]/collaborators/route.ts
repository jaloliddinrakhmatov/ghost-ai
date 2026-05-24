import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

export interface EnrichedPerson {
  email: string;
  name: string | null;
  imageUrl: string | null;
  role: "owner" | "collaborator";
}

async function enrichEmails(emails: string[]): Promise<{ email: string; name: string | null; imageUrl: string | null }[]> {
  if (emails.length === 0) return [];
  const client = await clerkClient();
  const results = await Promise.allSettled(
    emails.map((email) =>
      client.users.getUserList({ emailAddress: [email] }).then((res) => res.data[0] ?? null)
    )
  );
  return emails.map((email, i) => {
    const result = results[i];
    const user = result.status === "fulfilled" ? result.value : null;
    return {
      email,
      name: user ? (user.fullName ?? user.username ?? null) : null,
      imageUrl: user?.imageUrl ?? null,
    };
  });
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (project.ownerId !== userId) {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (!email) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const isCollaborator = await prisma.projectCollaborator.findUnique({
      where: { projectId_email: { projectId, email } },
    });
    if (!isCollaborator) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch owner from Clerk by userId
  const client = await clerkClient();
  const ownerClerk = await client.users.getUser(project.ownerId).catch(() => null);
  const ownerEmail =
    ownerClerk?.primaryEmailAddress?.emailAddress ??
    ownerClerk?.emailAddresses?.[0]?.emailAddress ??
    "deleted-user@unknown.local";

  const ownerPerson: EnrichedPerson = {
    email: ownerEmail,
    name: ownerClerk ? (ownerClerk.fullName ?? ownerClerk.username ?? null) : null,
    imageUrl: ownerClerk?.imageUrl ?? null,
    role: "owner",
  };

  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  const enrichedCollabs = await enrichEmails(rows.map((r) => r.email));
  const collabPersons: EnrichedPerson[] = enrichedCollabs.map((c) => ({
    ...c,
    role: "collaborator",
  }));

  return NextResponse.json([ownerPerson, ...collabPersons]);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { email?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" && body.email.trim().toLowerCase()
      ? body.email.trim().toLowerCase()
      : null;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  await prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId, email } },
    create: { projectId, email },
    update: {},
  });

  const [enriched] = await enrichEmails([email]);
  const person: EnrichedPerson = { ...enriched, role: "collaborator" };
  return NextResponse.json(person, { status: 201 });
}
