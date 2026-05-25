"use client";

import { useRef, useState, useCallback, type KeyboardEvent } from "react";
import { Bot, X, FileText, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
    ]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "72px";
    }
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "72px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  return (
    <div
      className={`absolute top-3 right-3 bottom-3 z-30 w-[300px] transition-transform duration-200 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+12px)]"
      }`}
    >
      <aside className="flex flex-col h-full bg-bg-surface/95 backdrop-blur-sm border border-white/6 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-ai/10 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="h-4 w-4 text-accent-ai-text" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary leading-tight">AI Workspace</p>
              <p className="text-xs text-text-muted mt-0.5">Collaborate with Ghost AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors mt-0.5 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="architect" className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-4 mb-3 shrink-0 grid grid-cols-2 bg-bg-elevated border border-white/5 rounded-lg p-0.5 h-auto">
            <TabsTrigger
              value="architect"
              className="rounded-md text-xs font-medium py-1.5 text-text-muted data-[state=active]:bg-accent-primary data-[state=active]:text-bg-surface data-[state=active]:shadow-none"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="rounded-md text-xs font-medium py-1.5 text-text-muted data-[state=active]:bg-accent-primary data-[state=active]:text-bg-surface data-[state=active]:shadow-none"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          {/* AI Architect Tab */}
          <TabsContent value="architect" className="flex flex-col flex-1 min-h-0 mt-0 mx-0">
            <ScrollArea className="flex-1 px-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center gap-4 pt-6 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-ai/10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-accent-ai-text" />
                  </div>
                  <div className="text-center px-2">
                    <p className="text-sm font-medium text-text-primary">Ghost AI Architect</p>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Describe a system and I'll help you design the architecture.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {STARTER_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        className="w-full text-left text-xs px-3 py-2 rounded-full bg-bg-subtle text-accent-ai-text hover:bg-bg-elevated transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 py-3">
                  {messages.map((msg) =>
                    msg.role === "user" ? (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm bg-accent-primary-dim border-2 border-accent-primary/50 text-text-primary text-xs leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div key={msg.id} className="flex justify-start">
                        <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tl-sm bg-bg-elevated border border-white/5 text-accent-ai-text text-xs leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input area */}
            <div className="px-3 pb-3 pt-2 shrink-0">
              <div className="flex gap-2 items-end rounded-xl bg-bg-elevated border border-white/5 p-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onInput={handleInput}
                  placeholder="Describe your architecture…"
                  rows={1}
                  className="flex-1 resize-none border-0 bg-transparent p-0 text-xs text-text-primary placeholder:text-text-faint focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
                  style={{ minHeight: "72px", maxHeight: "160px" }}
                />
                <Button
                  size="sm"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="shrink-0 self-end bg-accent-primary text-bg-surface hover:bg-accent-primary/90 rounded-lg px-3 py-1.5 text-xs h-auto"
                >
                  Send
                </Button>
              </div>
              <p className="text-[10px] text-text-faint mt-1.5 text-center">
                Enter to send · Shift+Enter for newline
              </p>
            </div>
          </TabsContent>

          {/* Specs Tab */}
          <TabsContent value="specs" className="flex flex-col flex-1 min-h-0 mt-0 mx-0">
            <div className="px-3 pt-1 pb-3 shrink-0">
              <Button className="w-full bg-accent-primary text-bg-surface hover:bg-accent-primary/90 text-xs h-8 rounded-lg">
                Generate Spec
              </Button>
            </div>

            <ScrollArea className="flex-1 px-3">
              <div className="rounded-xl bg-bg-elevated border border-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-ai/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-4 w-4 text-accent-ai-text" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary leading-tight">
                      Microservices Spec
                    </p>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-3">
                      A distributed microservices architecture with API gateway, service mesh, and event-driven communication between bounded contexts.
                    </p>
                    <button
                      disabled
                      className="mt-3 flex items-center gap-1.5 text-[10px] text-text-faint cursor-not-allowed opacity-50"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  );
}
