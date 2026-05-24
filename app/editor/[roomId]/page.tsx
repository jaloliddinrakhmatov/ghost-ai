import { redirect } from "next/navigation";
import { getProjectWithAccess, getClerkIdentity } from "@/lib/project-access";
import { getProjectsForUser } from "@/lib/projects";
import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceClient } from "@/components/editor/workspace-client";

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const { roomId } = await params;
  const { project, hasAccess, unauthenticated } = await getProjectWithAccess(roomId);

  if (unauthenticated) redirect("/sign-in");
  if (!project || !hasAccess) return <AccessDenied />;

  const [{ owned, shared }, identity] = await Promise.all([
    getProjectsForUser(),
    getClerkIdentity(),
  ]);

  const userInitial = (identity?.email?.[0] ?? "?").toUpperCase();
  const isOwner = project.ownerId === identity?.userId;

  return (
    <WorkspaceClient
      projectId={project.id}
      projectName={project.name}
      owned={owned}
      shared={shared}
      userInitial={userInitial}
      isOwner={isOwner}
    />
  );
}
