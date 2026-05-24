"use client";

import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Project } from "@/hooks/use-project-dialogs";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onCreateProject: () => void;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

function ProjectItem({
  project,
  onRename,
  onDelete,
}: {
  project: Project;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-bg-elevated cursor-pointer">
      <span className="text-sm text-text-primary truncate">{project.name}</span>
      {project.owned && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onRename(); }}
            aria-label="Rename project"
            className="h-6 w-6 text-text-muted hover:text-text-primary hover:bg-bg-subtle"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label="Delete project"
            className="h-6 w-6 text-text-muted hover:text-state-error hover:bg-bg-subtle"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const owned = projects.filter((p) => p.owned);
  const shared = projects.filter((p) => !p.owned);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col bg-bg-surface border-r border-border-default transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-base font-semibold text-text-primary">Projects</span>
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
          <TabsList className="mx-3 h-10 w-auto bg-bg-elevated">
            <TabsTrigger value="mine" className="flex-1 text-sm">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1 text-sm">
              Shared
            </TabsTrigger>
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
                      onRename={() => onRenameProject(p)}
                      onDelete={() => onDeleteProject(p)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-border-default">
          <Button
            onClick={onCreateProject}
            className="w-full bg-accent-primary text-bg-base hover:bg-accent-primary/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
