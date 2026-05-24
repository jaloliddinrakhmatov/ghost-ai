import { getProjectsForUser } from "@/lib/projects";
import { EditorHomeClient } from "@/components/editor/editor-home-client";

export default async function EditorPage() {
  const { owned, shared } = await getProjectsForUser();
  return <EditorHomeClient owned={owned} shared={shared} />;
}
