"use client";

import { useEffect, useState } from "react";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import { AISidebar } from "@/components/editor/ai-sidebar";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import { useProjectActions } from "@/hooks/use-project-actions";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import type { ProjectData } from "@/lib/projects";

interface WorkspaceClientProps {
  projectId: string;
  projectName: string;
  owned: ProjectData[];
  shared: ProjectData[];
  userInitial: string;
  isOwner: boolean;
}

export function WorkspaceClient({
  projectId,
  projectName,
  owned,
  shared,
  userInitial,
  isOwner,
}: WorkspaceClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    function onSaveStatus(e: Event) {
      setSaveStatus((e as CustomEvent<SaveStatus>).detail);
    }
    document.addEventListener("canvas:save-status", onSaveStatus);
    return () => document.removeEventListener("canvas:save-status", onSaveStatus);
  }, []);

  function handleImportTemplate(template: CanvasTemplate) {
    document.dispatchEvent(new CustomEvent("canvas:load-template", { detail: template }));
  }
  const actions = useProjectActions();

  return (
    <div className="h-screen bg-bg-base overflow-hidden">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((v) => !v)}
        projectName={projectName}
        onShare={() => setShareOpen(true)}
        isAiOpen={aiOpen}
        onAiToggle={() => setAiOpen((v) => !v)}
        onTemplates={() => setTemplatesOpen(true)}
        saveStatus={saveStatus}
        onSave={() => document.dispatchEvent(new CustomEvent("canvas:manual-save"))}
        showUserButton={false}
      />

      {/* Body: canvas fills full space below navbar, sidebars float over it */}
      <div className="absolute inset-0 top-14 overflow-hidden">
        {/* Canvas fills the entire area edge-to-edge */}
        <main className="absolute inset-0 bg-bg-base">
          <CanvasWrapper roomId={projectId} />
        </main>

        {/* Left sidebar — floats over canvas, fully off-screen when closed */}
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          owned={owned}
          shared={shared}
          activeProjectId={projectId}
          userInitial={userInitial}
          onCreateProject={actions.openCreate}
          onRenameProject={actions.openRename}
          onDeleteProject={actions.openDelete}
        />

        {/* AI sidebar — floating panel, right side */}
        <AISidebar isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      </div>

      <StarterTemplatesModal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onImport={handleImportTemplate}
      />

      {shareOpen && (
        <ShareDialog
          onClose={() => setShareOpen(false)}
          projectId={projectId}
          isOwner={isOwner}
        />
      )}

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
