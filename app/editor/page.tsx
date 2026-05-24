import { getProjectsForUser } from "@/lib/projects";
import { getClerkIdentity } from "@/lib/project-access";
import { EditorHomeClient } from "@/components/editor/editor-home-client";

export default async function EditorPage() {
  const [{ owned, shared }, identity] = await Promise.all([
    getProjectsForUser(),
    getClerkIdentity(),
  ]);
  const userInitial = (identity?.email?.[0] ?? "?").toUpperCase();
  return <EditorHomeClient owned={owned} shared={shared} userInitial={userInitial} />;
}
