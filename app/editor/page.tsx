"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";
import { Button } from "@/components/ui/button";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dialogs = useProjectDialogs();

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((v) => !v)}
      />

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={dialogs.projects}
        onCreateProject={dialogs.openCreate}
        onRenameProject={dialogs.openRename}
        onDeleteProject={dialogs.openDelete}
      />

      <main className="flex-1 mt-12 flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-semibold text-text-primary text-center">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-text-muted text-center max-w-sm">
          Start a new architecture workspace, or choose a project from the sidebar.
        </p>
        <Button
          onClick={dialogs.openCreate}
          className="mt-2 bg-accent-primary text-bg-base hover:bg-accent-primary/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </main>

      <CreateProjectDialog
        dialog={dialogs.dialog}
        formName={dialogs.formName}
        setFormName={dialogs.setFormName}
        loading={dialogs.loading}
        close={dialogs.close}
        submitCreate={dialogs.submitCreate}
      />
      <RenameProjectDialog
        dialog={dialogs.dialog}
        formName={dialogs.formName}
        setFormName={dialogs.setFormName}
        loading={dialogs.loading}
        close={dialogs.close}
        submitRename={dialogs.submitRename}
      />
      <DeleteProjectDialog
        dialog={dialogs.dialog}
        loading={dialogs.loading}
        close={dialogs.close}
        submitDelete={dialogs.submitDelete}
      />
    </div>
  );
}
