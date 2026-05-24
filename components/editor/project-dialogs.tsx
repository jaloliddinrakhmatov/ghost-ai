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
import type { useProjectActions } from "@/hooks/use-project-actions";

type ActionsProps = ReturnType<typeof useProjectActions>;

export function CreateProjectDialog({
  dialog,
  formName,
  setFormName,
  roomIdPreview,
  loading,
  close,
  submitCreate,
}: Pick<ActionsProps, "dialog" | "formName" | "setFormName" | "roomIdPreview" | "loading" | "close" | "submitCreate">) {
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
          {roomIdPreview && (
            <p className="text-xs text-text-muted">
              Room ID:{" "}
              <span className="text-text-secondary font-mono">{roomIdPreview}</span>
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
  renameError,
  close,
  submitRename,
}: Pick<
  ActionsProps,
  "dialog" | "formName" | "setFormName" | "loading" | "renameError" | "close" | "submitRename"
>) {
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

        <div className="space-y-2 py-2">
          <Input
            ref={inputRef}
            placeholder="New name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && submitRename()}
            className="bg-bg-subtle border-border-default text-text-primary placeholder:text-text-faint"
          />
          {renameError && (
            <p className="text-sm text-state-error">{renameError}</p>
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
  deleteError,
  close,
  submitDelete,
}: Pick<ActionsProps, "dialog" | "loading" | "deleteError" | "close" | "submitDelete">) {
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

        {deleteError && (
          <p className="text-sm text-state-error">{deleteError}</p>
        )}

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
