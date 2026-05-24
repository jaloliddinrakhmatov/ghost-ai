"use client";

import { useRouter } from "next/navigation";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProjectData } from "@/lib/projects";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  owned: ProjectData[];
  shared: ProjectData[];
  activeProjectId?: string;
  userInitial?: string;
  inline?: boolean;
  onCreateProject: () => void;
  onRenameProject: (project: ProjectData) => void;
  onDeleteProject: (project: ProjectData) => void;
}

function ProjectItem({
  project,
  active,
  onOpen,
  onRename,
  onDelete,
}: {
  project: ProjectData;
  active?: boolean;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
        active ? "bg-bg-elevated" : "hover:bg-bg-elevated"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
          active ? "bg-state-success" : "bg-transparent"
        }`}
      />
      <span
        className={`text-sm truncate flex-1 ${
          active ? "text-text-primary font-medium" : "text-text-primary"
        }`}
      >
        {project.name}
      </span>
      {project.owned && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onRename(); }}
            aria-label="Rename project"
            className="h-6 w-6 text-text-muted hover:text-text-primary hover:bg-bg-subtle"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label="Delete project"
            className="h-6 w-6 text-text-muted hover:text-state-error hover:bg-bg-subtle"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  owned,
  shared,
  activeProjectId,
  userInitial,
  onClose,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: Omit<ProjectSidebarProps, "isOpen" | "inline">) {
  const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <span className="text-sm font-semibold text-text-primary">Projects</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close sidebar"
          className="h-7 w-7 text-text-muted hover:text-text-primary hover:bg-bg-elevated"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="mine" className="flex flex-col flex-1 min-h-0">
        <TabsList className="mx-3 h-9 w-auto bg-bg-elevated shrink-0">
          <TabsTrigger value="mine" className="flex-1 text-xs">My Projects</TabsTrigger>
          <TabsTrigger value="shared" className="flex-1 text-xs">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            {owned.length === 0 ? (
              <div className="flex items-center justify-center h-48 px-4">
                <p className="text-sm text-text-muted text-center">No projects yet</p>
              </div>
            ) : (
              <div className="px-2 py-2 space-y-0.5">
                {owned.map((p) => (
                  <ProjectItem
                    key={p.id}
                    project={p}
                    active={p.id === activeProjectId}
                    onOpen={() => router.push(`/editor/${p.id}`)}
                    onRename={() => onRenameProject(p)}
                    onDelete={() => onDeleteProject(p)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="shared" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            {shared.length === 0 ? (
              <div className="flex items-center justify-center h-48 px-4">
                <p className="text-sm text-text-muted text-center">No shared projects</p>
              </div>
            ) : (
              <div className="px-2 py-2 space-y-0.5">
                {shared.map((p) => (
                  <ProjectItem
                    key={p.id}
                    project={p}
                    active={p.id === activeProjectId}
                    onOpen={() => router.push(`/editor/${p.id}`)}
                    onRename={() => onRenameProject(p)}
                    onDelete={() => onDeleteProject(p)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="px-3 py-3 border-t border-border-default flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-text-secondary">{userInitial ?? "?"}</span>
        </div>
        <Button
          onClick={onCreateProject}
          className="flex-1 h-8 text-sm gap-1.5 bg-accent-primary text-bg-base hover:bg-accent-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          New Project
        </Button>
      </div>
    </>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  owned,
  shared,
  activeProjectId,
  userInitial,
  inline = false,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const contentProps = {
    owned, shared, activeProjectId, userInitial,
    onClose, onCreateProject, onRenameProject, onDeleteProject,
  };

  if (inline) {
    if (!isOpen) return null;
    return (
      <aside className="w-72 shrink-0 flex flex-col bg-bg-surface border-r border-border-default h-full overflow-hidden">
        <SidebarContent {...contentProps} />
      </aside>
    );
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col bg-bg-surface border-r border-border-default transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent {...contentProps} />
      </aside>
    </>
  );
}
