"use client";

import { useState } from "react";

export interface Project {
  id: string;
  name: string;
  owned: boolean;
}

type DialogState =
  | { type: "none" }
  | { type: "create" }
  | { type: "rename"; project: Project }
  | { type: "delete"; project: Project };

const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "E-commerce Platform", owned: true },
  { id: "2", name: "Auth Service", owned: true },
  { id: "3", name: "Shared Microservices", owned: false },
];

export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const [formName, setFormName] = useState("");
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setFormName("");
    setDialog({ type: "create" });
  }

  function openRename(project: Project) {
    setFormName(project.name);
    setDialog({ type: "rename", project });
  }

  function openDelete(project: Project) {
    setDialog({ type: "delete", project });
  }

  function close() {
    setDialog({ type: "none" });
    setFormName("");
  }

  function submitCreate() {
    if (!formName.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setProjects((prev) => [
        ...prev,
        { id: Date.now().toString(), name: formName.trim(), owned: true },
      ]);
      setLoading(false);
      close();
    }, 300);
  }

  function submitRename() {
    if (dialog.type !== "rename" || !formName.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === dialog.project.id ? { ...p, name: formName.trim() } : p
        )
      );
      setLoading(false);
      close();
    }, 300);
  }

  function submitDelete() {
    if (dialog.type !== "delete") return;
    setLoading(true);
    setTimeout(() => {
      setProjects((prev) => prev.filter((p) => p.id !== dialog.project.id));
      setLoading(false);
      close();
    }, 300);
  }

  return {
    projects,
    dialog,
    formName,
    setFormName,
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
