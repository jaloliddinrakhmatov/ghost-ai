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
import { useProjectActions } from "@/hooks/use-project-actions";
import type { ProjectData } from "@/lib/projects";

interface Props {
  owned: ProjectData[];
  shared: ProjectData[];
  userInitial: string;
}

export function EditorHomeClient({ owned, shared, userInitial }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const actions = useProjectActions();

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((v) => !v)}
      />

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        owned={owned}
        shared={shared}
        userInitial={userInitial}
        onCreateProject={actions.openCreate}
        onRenameProject={actions.openRename}
        onDeleteProject={actions.openDelete}
      />

      <main className="flex-1 mt-14 flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-semibold text-text-primary text-center">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-text-muted text-center max-w-sm">
          Start a new architecture workspace, or choose a project from the sidebar.
        </p>
        <Button
          onClick={actions.openCreate}
          className="mt-2 bg-accent-primary text-bg-base hover:bg-accent-primary/90 gap-2"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </main>

      <CreateProjectDialog
        dialog={actions.dialog}
        formName={actions.formName}
        setFormName={actions.setFormName}
        roomIdPreview={actions.roomIdPreview}
        loading={actions.loading}
        close={actions.close}
        submitCreate={actions.submitCreate}
      />
      <RenameProjectDialog
        dialog={actions.dialog}
        formName={actions.formName}
        setFormName={actions.setFormName}
        loading={actions.loading}
        renameError={actions.renameError}
        close={actions.close}
        submitRename={actions.submitRename}
      />
      <DeleteProjectDialog
        dialog={actions.dialog}
        loading={actions.loading}
        deleteError={actions.deleteError}
        close={actions.close}
        submitDelete={actions.submitDelete}
      />
    </div>
  );
}
