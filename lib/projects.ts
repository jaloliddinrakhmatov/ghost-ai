import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export interface ProjectData {
  id: string;
  name: string;
  owned: boolean;
}

export async function getProjectsForUser(): Promise<{
  owned: ProjectData[];
  shared: ProjectData[];
}> {
  const { userId } = await auth();
  if (!userId) return { owned: [], shared: [] };

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const [ownedRaw, sharedRaw] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    }),
    email
      ? prisma.project.findMany({
          where: {
            collaborators: { some: { email } },
            NOT: { ownerId: userId },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return {
    owned: ownedRaw.map((p) => ({ id: p.id, name: p.name, owned: true })),
    shared: sharedRaw.map((p) => ({ id: p.id, name: p.name, owned: false })),
  };
}
