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
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
        active
          ? "bg-accent-primary/10 border-accent-primary/30 shadow-[0_0_0_1px_rgba(0,200,212,0.15)]"
          : "border-transparent hover:bg-white/4 hover:border-white/5"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
          active ? "bg-accent-primary" : "bg-text-faint"
        }`}
      />
      <span
        className={`text-sm truncate flex-1 ${
          active ? "text-text-primary font-medium" : "text-text-secondary"
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
            className="h-6 w-6 text-text-muted hover:text-text-primary hover:bg-white/5"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label="Delete project"
            className="h-6 w-6 text-text-muted hover:text-state-error hover:bg-white/5"
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
}: Omit<ProjectSidebarProps, "isOpen">) {
  const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-between px-5 py-5 shrink-0">
        <span className="text-sm font-semibold text-text-primary">Projects</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close sidebar"
          className="h-7 w-7 text-text-muted hover:text-text-primary hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="mine" className="flex flex-col flex-1 min-h-0">
        <TabsList className="mx-4 h-9 w-auto bg-white/5 border border-white/5 shrink-0">
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
              <div className="px-3 py-3 space-y-1">
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
              <div className="px-3 py-3 space-y-1">
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

      <div className="px-4 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
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
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const contentProps = {
    owned, shared, activeProjectId, userInitial,
    onClose, onCreateProject, onRenameProject, onDeleteProject,
  };

  return (
    <div
      aria-hidden={!isOpen}
      className={`absolute top-3 left-3 bottom-3 z-30 w-64 transition-transform duration-200 ease-in-out ${
        isOpen
          ? "translate-x-0 visible"
          : "-translate-x-[calc(100%+12px)] invisible pointer-events-none"
      }`}
    >
      <aside className="flex flex-col h-full bg-bg-surface/95 backdrop-blur-sm border border-white/6 rounded-2xl shadow-2xl overflow-hidden">
        <SidebarContent {...contentProps} />
      </aside>
    </div>
  );
}
