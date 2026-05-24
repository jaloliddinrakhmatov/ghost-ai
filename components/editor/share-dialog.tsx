"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Link2, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Person {
  email: string;
  name: string | null;
  imageUrl: string | null;
  role: "owner" | "collaborator";
}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  isOwner: boolean;
}

function Avatar({ person }: { person: Person }) {
  if (person.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={person.imageUrl}
        alt={person.name ?? person.email}
        className="w-10 h-10 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
      <span className="text-sm font-semibold text-accent-primary">
        {(person.name ?? person.email)[0].toUpperCase()}
      </span>
    </div>
  );
}

export function ShareDialog({ open, onClose, projectId, isOwner }: ShareDialogProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (res.ok) setPeople(await res.json());
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) {
      fetchPeople();
      setInviteEmail("");
      setInviteError(null);
    }
  }, [open, fetchPeople]);

  async function handleInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setInviteError("Enter a valid email address.");
      return;
    }
    setInviting(true);
    setInviteError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setInviteError(data.error ?? "Failed to invite collaborator.");
        return;
      }
      const added: Person = await res.json();
      setPeople((prev) => {
        const exists = prev.some((p) => p.email === added.email);
        return exists ? prev : [...prev, added];
      });
      setInviteEmail("");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(email: string) {
    setRemovingEmail(email);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/collaborators/${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );
      if (!res.ok) return;
      setPeople((prev) => prev.filter((p) => p.email !== email));
    } finally {
      setRemovingEmail(null);
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/editor/${projectId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl bg-[#12121a] border border-white/8 p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5">
          <DialogTitle className="text-[17px] font-semibold text-text-primary leading-snug">
            Share project
          </DialogTitle>
          <DialogDescription className="text-sm text-text-muted mt-1 leading-relaxed">
            Invite collaborators, copy the workspace link, and manage access.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-7 space-y-3">
          {/* Workspace link card */}
          <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/4 px-4 py-3.5 gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-text-primary">Workspace link</p>
              <p className="text-[12px] text-text-muted mt-0.5 leading-relaxed">
                Share a direct link with teammates after you grant them access.
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={handleCopyLink}
              className="h-8 shrink-0 px-3 gap-1.5 text-[12px] font-medium rounded-lg border border-white/10 bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/6"
            >
              <Link2 className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>

          {/* Invite row — owner only, single bordered card */}
          {isOwner && (
            <div className="space-y-1.5">
              <div className="flex items-center rounded-xl border border-white/8 bg-white/4 overflow-hidden">
                <div className="flex items-center flex-1 px-3 gap-2.5 min-w-0">
                  <Mail className="h-4 w-4 text-text-faint shrink-0" />
                  <input
                    type="email"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setInviteError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !inviting && handleInvite()}
                    disabled={inviting}
                    className="flex-1 h-12 bg-transparent text-sm text-text-primary placeholder:text-text-faint outline-none min-w-0"
                  />
                </div>
                <div className="pr-2 shrink-0">
                  <Button
                    onClick={handleInvite}
                    disabled={inviting || !inviteEmail.trim()}
                    className="h-8 px-4 rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 text-sm font-medium disabled:opacity-40"
                  >
                    {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                  </Button>
                </div>
              </div>
              {inviteError && (
                <p className="text-xs text-red-400 pl-1">{inviteError}</p>
              )}
            </div>
          )}

          {/* People with access */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-[13px] font-semibold text-text-primary">People with access</p>
              {!loading && (
                <span className="text-[12px] text-text-faint">
                  {people.length} total
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-4 px-0.5">
                <Loader2 className="h-4 w-4 animate-spin text-text-faint" />
                <span className="text-sm text-text-muted">Loading…</span>
              </div>
            ) : (
              <ul className="space-y-1.5 max-h-52 overflow-y-auto">
                {people.map((p) => (
                  <li
                    key={p.email}
                    className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/4 px-3.5 py-3"
                  >
                    <Avatar person={p} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {p.name && (
                          <span className="text-[13px] font-semibold text-text-primary truncate">
                            {p.name}
                          </span>
                        )}
                        {p.role === "owner" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-accent-primary/20 text-accent-primary">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-text-muted mt-0.5 truncate">{p.email}</p>
                    </div>
                    {isOwner && p.role === "collaborator" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(p.email)}
                        disabled={removingEmail === p.email}
                        className="h-7 w-7 shrink-0 text-text-faint hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                        aria-label={`Remove ${p.email}`}
                      >
                        {removingEmail === p.email ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
