import { Cpu, Share2, FileText } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col bg-bg-surface border-r border-border-default">
      <div className="flex-1 flex flex-col justify-between px-14 py-12">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-accent-primary flex items-center justify-center flex-shrink-0" />
            <span className="text-base font-semibold text-text-primary tracking-tight font-sans">
              Ghost AI
            </span>
          </div>

          <div className="mt-20">
            <h1 className="text-[2.6rem] font-bold text-text-primary leading-[1.15] tracking-tight font-sans">
              Design systems at the<br />speed of thought.
            </h1>
            <p className="mt-5 text-text-secondary text-base leading-relaxed font-sans max-w-sm">
              Describe your architecture in plain English. Ghost AI maps it to a shared
              canvas your whole team can refine in real time.
            </p>
          </div>

          <ul className="mt-12 space-y-7">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <div className="mt-0.5 h-8 w-8 rounded-lg bg-accent-primary-dim border border-accent-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-accent-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary font-sans">{title}</p>
                  <p className="mt-0.5 text-sm text-text-muted font-sans leading-relaxed">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-text-faint font-sans">
          © 2026 Ghost AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
