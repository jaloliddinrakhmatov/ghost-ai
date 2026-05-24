"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
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
        <div
          className={`absolute top-3 right-3 bottom-3 z-30 w-[300px] transition-transform duration-200 ease-in-out ${
            aiOpen ? "translate-x-0" : "translate-x-[calc(100%+12px)]"
          }`}
        >
          <aside className="flex flex-col h-full bg-bg-surface/95 backdrop-blur-sm border border-white/6 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between px-5 py-5 shrink-0">
              <div>
                <p className="text-sm font-semibold text-text-primary">AI Copilot</p>
                <p className="text-xs text-text-muted mt-0.5">Placeholder panel</p>
              </div>
              <Sparkles className="h-4 w-4 text-accent-ai mt-0.5 shrink-0" />
            </div>

            <div className="flex-1 px-3 pb-3 overflow-y-auto space-y-2">
              <div className="rounded-xl bg-bg-elevated/60 border border-white/5 p-4 flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-ai/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-accent-ai-text" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">Chat surface pending</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    The toggle is wired. Messaging and generation are intentionally out of scope here.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3 shrink-0">
              <div className="rounded-xl bg-bg-elevated/60 border border-white/5 p-4">
                <p className="text-xs tracking-[0.15em] uppercase text-text-faint font-medium mb-2">
                  Future Hooks
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  Prompt composer, run status, and architecture guidance will attach to this sidebar.
                </p>
              </div>
            </div>
          </aside>
        </div>
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
