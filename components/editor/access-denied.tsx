import Link from "next/link";
import { Lock } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-bg-base">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-bg-elevated border border-border-default">
        <Lock className="h-6 w-6 text-text-muted" />
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-base font-semibold text-text-primary">
          Access denied
        </h1>
        <p className="text-sm text-text-muted max-w-xs">
          This project doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>
      </div>
      <Link
        href="/editor"
        className="text-sm text-text-muted hover:text-text-primary px-3 py-1.5 rounded-xl hover:bg-bg-elevated transition-colors"
      >
        Go to your projects
      </Link>
    </div>
  );
}
