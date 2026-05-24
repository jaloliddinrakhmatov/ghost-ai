"use client";

import { LayoutTemplate, PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  projectName?: string;
  onShare?: () => void;
  isAiOpen?: boolean;
  onAiToggle?: () => void;
  onTemplates?: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectName,
  onShare,
  isAiOpen,
  onAiToggle,
  onTemplates,
}: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center bg-bg-surface border-b border-border-default px-3 gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onSidebarToggle}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        className="h-8 w-8 flex-shrink-0 text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
      >
        {isSidebarOpen ? (
          <PanelLeftClose className="h-5 w-5" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" />
        )}
      </Button>

      {projectName ? (
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-sm font-semibold text-text-primary leading-tight truncate">
            {projectName}
          </span>
          <span className="text-xs text-text-muted leading-tight">Workspace</span>
        </div>
      ) : null}

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {onTemplates && (
          <Button
            variant="ghost"
            onClick={onTemplates}
            className="h-8 gap-1.5 px-3 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
        )}
        {onShare && (
          <Button
            variant="ghost"
            onClick={onShare}
            className="h-8 gap-1.5 px-3 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
        {onAiToggle && (
          <Button
            variant="ghost"
            onClick={onAiToggle}
            className={`h-8 gap-1.5 px-3 text-sm hover:bg-bg-elevated ${
              isAiOpen
                ? "text-accent-ai-text bg-accent-ai/10 hover:bg-accent-ai/15"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AI
          </Button>
        )}
        <div className="ml-1">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
