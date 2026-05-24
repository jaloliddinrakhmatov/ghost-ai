"use client";

import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { useProjectDialogs } from "@/hooks/use-project-dialogs";

type DialogsProps = ReturnType<typeof useProjectDialogs>;

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateProjectDialog({
  dialog,
  formName,
  setFormName,
  loading,
  close,
  submitCreate,
}: Pick<DialogsProps, "dialog" | "formName" | "setFormName" | "loading" | "close" | "submitCreate">) {
  const open = dialog.type === "create";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="bg-bg-elevated border-border-default rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary">New project</DialogTitle>
          <DialogDescription className="text-text-muted">
            Give your architecture workspace a name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Input
            placeholder="Project name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && submitCreate()}
            autoFocus
            className="bg-bg-subtle border-border-default text-text-primary placeholder:text-text-faint"
          />
          {formName.trim() && (
            <p className="text-xs text-text-muted">
              Slug:{" "}
              <span className="text-text-secondary font-mono">
                {toSlug(formName)}
              </span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={close}
            className="text-text-muted hover:text-text-primary"
          >
            Cancel
          </Button>
          <Button
            onClick={submitCreate}
            disabled={!formName.trim() || loading}
            className="bg-accent-primary text-bg-base hover:bg-accent-primary/90"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RenameProjectDialog({
  dialog,
  formName,
  setFormName,
  loading,
  close,
  submitRename,
}: Pick<DialogsProps, "dialog" | "formName" | "setFormName" | "loading" | "close" | "submitRename">) {
  const open = dialog.type === "rename";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="bg-bg-elevated border-border-default rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Rename project</DialogTitle>
          <DialogDescription className="text-text-muted">
            Currently named{" "}
            <span className="text-text-secondary">
              {dialog.type === "rename" ? dialog.project.name : ""}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Input
            ref={inputRef}
            placeholder="New name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && submitRename()}
            className="bg-bg-subtle border-border-default text-text-primary placeholder:text-text-faint"
          />
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={close}
            className="text-text-muted hover:text-text-primary"
          >
            Cancel
          </Button>
          <Button
            onClick={submitRename}
            disabled={!formName.trim() || loading}
            className="bg-accent-primary text-bg-base hover:bg-accent-primary/90"
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteProjectDialog({
  dialog,
  loading,
  close,
  submitDelete,
}: Pick<DialogsProps, "dialog" | "loading" | "close" | "submitDelete">) {
  const open = dialog.type === "delete";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="bg-bg-elevated border-border-default rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Delete project</DialogTitle>
          <DialogDescription className="text-text-muted">
            Delete{" "}
            <span className="text-text-secondary">
              {dialog.type === "delete" ? dialog.project.name : ""}
            </span>
            ? This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={close}
            className="text-text-muted hover:text-text-primary"
          >
            Cancel
          </Button>
          <Button
            onClick={submitDelete}
            disabled={loading}
            className="bg-state-error text-white hover:bg-state-error/90"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
