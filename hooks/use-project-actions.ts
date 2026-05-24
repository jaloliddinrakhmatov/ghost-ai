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
  const activeProjectId = params?.projectId as string | undefined;

  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const [formName, setFormName] = useState("");
  const [roomSuffix, setRoomSuffix] = useState("");
  const [loading, setLoading] = useState(false);

  const roomIdPreview =
    formName.trim() ? `${toSlug(formName)}-${roomSuffix}` : "";

  function openCreate() {
    setFormName("");
    setRoomSuffix(shortSuffix());
    setDialog({ type: "create" });
  }

  function openRename(project: ProjectData) {
    setFormName(project.name);
    setDialog({ type: "rename", project });
  }

  function openDelete(project: ProjectData) {
    setDialog({ type: "delete", project });
  }

  function close() {
    setDialog({ type: "none" });
    setFormName("");
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
      if (!res.ok) throw new Error("Failed to create project");
      close();
      router.push(`/editor/${roomId}`);
    } finally {
      setLoading(false);
    }
  }

  async function submitRename() {
    if (dialog.type !== "rename" || !formName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to rename project");
      close();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function submitDelete() {
    if (dialog.type !== "delete") return;
    setLoading(true);
    const projectId = dialog.project.id;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      close();
      if (activeProjectId === projectId) {
        router.push("/editor");
      } else {
        router.refresh();
      }
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
    openCreate,
    openRename,
    openDelete,
    close,
    submitCreate,
    submitRename,
    submitDelete,
  };
}
