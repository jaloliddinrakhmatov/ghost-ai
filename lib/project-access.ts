import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getClerkIdentity() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  return {
    userId,
    email: user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? null,
  };
}

export async function getProjectWithAccess(projectId: string) {
  const identity = await getClerkIdentity();
  if (!identity) return { project: null, hasAccess: false, unauthenticated: true };

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { project: null, hasAccess: false, unauthenticated: false };

  const isOwner = project.ownerId === identity.userId;
  const isCollaborator =
    identity.email
      ? !!(await prisma.projectCollaborator.findUnique({
          where: { projectId_email: { projectId: project.id, email: identity.email } },
        }))
      : false;

  return {
    project,
    hasAccess: isOwner || isCollaborator,
    unauthenticated: false,
  };
}
