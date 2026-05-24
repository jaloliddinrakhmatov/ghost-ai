"use client";

import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={`fixed top-12 left-0 bottom-0 z-40 w-72 flex flex-col bg-bg-surface border-r border-border-default transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <span className="text-sm font-medium text-text-primary">Projects</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 text-text-muted hover:text-text-primary hover:bg-bg-elevated"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="mine" className="flex flex-col flex-1 min-h-0">
        <TabsList className="mx-4 mt-3 bg-bg-elevated">
          <TabsTrigger value="mine" className="flex-1 text-xs">
            My Projects
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex-1 text-xs">
            Shared
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col items-center justify-center h-48 px-4">
              <p className="text-sm text-text-muted text-center">
                No projects yet
              </p>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="shared" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col items-center justify-center h-48 px-4">
              <p className="text-sm text-text-muted text-center">
                No shared projects
              </p>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-border-default">
        <Button className="w-full bg-accent-primary text-bg-base hover:bg-accent-primary/90 gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
