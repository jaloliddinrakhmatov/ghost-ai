"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download } from "lucide-react";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates";

// ── Diagram preview ────────────────────────────────────────────────────────────

const PREVIEW_W = 480;
const PREVIEW_H = 260;
const PREVIEW_PAD = 20;

function TemplateDiagramPreview({ template }: { template: CanvasTemplate }) {
  const { nodes, edges } = template;

  if (nodes.length === 0) return null;

  // Compute bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    const w = (n.style?.width as number) ?? 140;
    const h = (n.style?.height as number) ?? 44;
    if (n.position.x < minX) minX = n.position.x;
    if (n.position.y < minY) minY = n.position.y;
    if (n.position.x + w > maxX) maxX = n.position.x + w;
    if (n.position.y + h > maxY) maxY = n.position.y + h;
  }

  const boundsW = maxX - minX || 1;
  const boundsH = maxY - minY || 1;
  const availW = PREVIEW_W - PREVIEW_PAD * 2;
  const availH = PREVIEW_H - PREVIEW_PAD * 2;
  const scale = Math.min(availW / boundsW, availH / boundsH);

  const tx = (x: number) => PREVIEW_PAD + (x - minX) * scale;
  const ty = (y: number) => PREVIEW_PAD + (y - minY) * scale;

  // Node center map
  const centers: Record<string, { cx: number; cy: number }> = {};
  for (const n of nodes) {
    const w = (n.style?.width as number) ?? 140;
    const h = (n.style?.height as number) ?? 44;
    centers[n.id] = {
      cx: tx(n.position.x + w / 2),
      cy: ty(n.position.y + h / 2),
    };
  }

  return (
    <svg
      width={PREVIEW_W}
      height={PREVIEW_H}
      viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
      className="w-full h-full"
    >
      {/* Edges */}
      {edges.map((e) => {
        const s = centers[e.source];
        const t = centers[e.target];
        if (!s || !t) return null;
        return (
          <line
            key={e.id}
            x1={s.cx}
            y1={s.cy}
            x2={t.cx}
            y2={t.cy}
            stroke="#ffffff40"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n) => {
        const w = (n.style?.width as number) ?? 140;
        const h = (n.style?.height as number) ?? 44;
        const x = tx(n.position.x);
        const y = ty(n.position.y);
        const sw = w * scale;
        const sh = h * scale;
        const fill = n.data.color ?? "#1F1F1F";
        const stroke = n.data.textColor ?? "#EDEDED";
        const shape = n.data.shape ?? "rectangle";

        const rx =
          shape === "pill" ? Math.min(sw, sh) / 2 :
          shape === "circle" ? Math.min(sw, sh) / 2 :
          4;

        if (shape === "diamond") {
          const cx = x + sw / 2;
          const cy = y + sh / 2;
          const pts = `${cx},${y} ${x + sw},${cy} ${cx},${y + sh} ${x},${cy}`;
          return <polygon key={n.id} points={pts} fill={fill} stroke={stroke} strokeWidth={0.8} />;
        }

        return (
          <rect
            key={n.id}
            x={x}
            y={y}
            width={sw}
            height={sh}
            rx={rx}
            fill={fill}
            stroke={stroke}
            strokeWidth={0.8}
          />
        );
      })}
    </svg>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

interface StarterTemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({ open, onClose, onImport }: StarterTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent style={{ maxWidth: "min(1100px, 92vw)", width: "100%" }} className="bg-bg-surface border-border-default p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b border-border-default">
          <DialogTitle className="text-lg font-semibold text-text-primary">Import Template</DialogTitle>
          <p className="text-sm text-text-muted mt-0.5">
            Choose a starter template to pre-populate your canvas. Any existing nodes will be replaced — use ⌘Z to undo.
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[600px]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-6">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="flex flex-col rounded-xl border border-border-default bg-bg-elevated overflow-hidden hover:border-white/30 transition-colors group"
              >
                <div className="bg-bg-base flex items-center justify-center p-2"
                  style={{ height: PREVIEW_H }}>
                  <TemplateDiagramPreview template={template} />
                </div>

                <div className="px-4 py-4 flex flex-col gap-2 flex-1 border-t border-border-default">
                  <p className="text-sm font-semibold text-text-primary leading-snug">{template.name}</p>
                  <p className="text-xs text-text-muted leading-relaxed flex-1">{template.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full h-9 text-xs border-border-default text-text-primary hover:bg-bg-base gap-2"
                    onClick={() => { onImport(template); onClose(); }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Import
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
