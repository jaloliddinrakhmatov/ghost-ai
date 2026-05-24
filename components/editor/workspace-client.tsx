"use client";

import { useState } from "react";
import { Compass, Bot, Sparkles } from "lucide-react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";
import { ShareDialog } from "@/components/editor/share-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
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
  const actions = useProjectActions();

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((v) => !v)}
        projectName={projectName}
        onShare={() => setShareOpen(true)}
        isAiOpen={aiOpen}
        onAiToggle={() => setAiOpen((v) => !v)}
      />

      {/* Body: sidebar + canvas + AI panel */}
      <div className="flex flex-1 mt-14 overflow-hidden">
        <ProjectSidebar
          inline
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

        {/* Canvas placeholder — fills remaining space */}
        <main className="flex-1 p-3 overflow-hidden bg-bg-base">
          <div
            className="h-full w-full rounded-2xl border border-border-default/40 flex items-center justify-center"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, #16161f 0%, #0a0a0d 70%)",
            }}
          >
            <div className="flex flex-col items-center gap-6 text-center max-w-lg px-8">
              <div className="w-14 h-14 rounded-full border border-accent-primary/30 bg-accent-primary/10 flex items-center justify-center">
                <Compass className="h-6 w-6 text-accent-primary" />
              </div>
              <div className="space-y-3">
                <p className="text-xs tracking-[0.2em] uppercase text-text-faint font-medium">
                  Workspace Shell
                </p>
                <h2 className="text-2xl font-semibold text-text-primary leading-snug">
                  Canvas and collaboration tooling land here next.
                </h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  This room is ready for the shared architecture canvas, durable AI
                  workflows, and real-time presence. For now, the shell is wired
                  with project context and navigation only.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* AI sidebar */}
        {aiOpen && (
          <aside className="w-80 shrink-0 flex flex-col bg-bg-surface border-l border-border-default">
            <div className="flex items-start justify-between px-4 py-4 border-b border-border-default shrink-0">
              <div>
                <p className="text-sm font-semibold text-text-primary">AI Copilot</p>
                <p className="text-xs text-text-muted mt-0.5">Placeholder panel</p>
              </div>
              <Sparkles className="h-4 w-4 text-accent-ai mt-0.5 shrink-0" />
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
              <div className="rounded-xl bg-bg-elevated border border-border-default p-3 flex gap-3">
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

            <div className="p-3 border-t border-border-default shrink-0">
              <div className="rounded-xl bg-bg-elevated border border-border-default p-3">
                <p className="text-xs tracking-[0.15em] uppercase text-text-faint font-medium mb-1.5">
                  Future Hooks
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  Prompt composer, run status, and architecture guidance will attach to this sidebar.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        projectId={projectId}
        isOwner={isOwner}
      />

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
