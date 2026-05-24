"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { ProjectData } from "@/lib/projects";

export type { ProjectData };

type DialogState =
  | { type: "none" }
  | { type: "create" }
  | { type: "rename"; project: ProjectData }
  | { type: "delete"; project: ProjectData };

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function shortSuffix() {
  return Math.random().toString(36).slice(2, 7);
}

export function useProjectActions() {
  const router = useRouter();
  const params = useParams();
  const activeProjectId = params?.roomId as string | undefined;

  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const [formName, setFormName] = useState("");
  const [roomSuffix, setRoomSuffix] = useState("");
  const [loading, setLoading] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const baseSlug = toSlug(formName);
  const roomIdPreview = baseSlug ? `${baseSlug}-${roomSuffix}` : "";

  function openCreate() {
    setFormName("");
    setRoomSuffix(shortSuffix());
    setDialog({ type: "create" });
  }

  function openRename(project: ProjectData) {
    setRenameError(null);
    setFormName(project.name);
    setDialog({ type: "rename", project });
  }

  function openDelete(project: ProjectData) {
    setDeleteError(null);
    setDialog({ type: "delete", project });
  }

  function close() {
    setDialog({ type: "none" });
    setFormName("");
    setRenameError(null);
    setDeleteError(null);
  }

  async function submitCreate() {
    if (!formName.trim()) return;
    setLoading(true);
    const roomId = roomIdPreview || `project-${shortSuffix()}`;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), id: roomId }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to create project" }));
        // Store error in state or show toast notification
        throw new Error(error.error || "Failed to create project");
      }
      close();
      router.push(`/editor/${roomId}`);
    } catch (error) {
      // TODO: Display error to user via state or toast
      console.error("Create failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function submitRename() {
    if (dialog.type !== "rename" || !formName.trim()) return;
    setLoading(true);
    setRenameError(null);
    try {
      const res = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Failed to rename project" }));
        throw new Error(
          typeof body.error === "string" ? body.error : "Failed to rename project"
        );
      }
      close();
      router.refresh();
    } catch (error) {
      console.error("Rename failed:", error);
      setRenameError(
        error instanceof Error ? error.message : "Failed to rename project"
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitDelete() {
    if (dialog.type !== "delete") return;
    setLoading(true);
    setDeleteError(null);
    const projectId = dialog.project.id;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Failed to delete project" }));
        throw new Error(
          typeof body.error === "string" ? body.error : "Failed to delete project"
        );
      }
      close();
      if (activeProjectId === projectId) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete project"
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    dialog,
    formName,
    setFormName,
    roomIdPreview,
    loading,
    renameError,
    deleteError,
    openCreate,
    openRename,
    openDelete,
    close,
    submitCreate,
    submitRename,
    submitDelete,
  };
}
