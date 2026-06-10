"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHelp } from "@/components/help/help-provider";
import { HelpTopicContent } from "@/components/help/help-topic-content";
import { CoachAiTab } from "@/components/help/coach-ai-tab";
import { getHelpTopic, HELP_TOPICS, searchHelpTopics } from "@/lib/help/topics";
import { cn } from "@/lib/utils";

export function PlatformCoachSheet() {
  const { coachOpen, activeTopicId, closeCoach, role, setActiveTopicId } = useHelp();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("guide");

  const activeTopic = activeTopicId ? getHelpTopic(activeTopicId) : null;

  const results = useMemo(() => {
    if (query.trim()) return searchHelpTopics(query);
    return HELP_TOPICS;
  }, [query]);

  useEffect(() => {
    if (!coachOpen) {
      setQuery("");
      setTab("guide");
    }
  }, [coachOpen]);

  return (
    <Sheet open={coachOpen} onOpenChange={(open) => !open && closeCoach()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            Platform Coach
          </SheetTitle>
          <SheetDescription>
            Metric definitions, pilot targets, and AI-guided next steps.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="border-b border-border px-4 py-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="guide">Guide</TabsTrigger>
              <TabsTrigger value="ask">Ask AI</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="guide" className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="border-b border-border px-4 py-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search metrics and topics…"
                  className="pl-8"
                  aria-label="Search help topics"
                />
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] overflow-hidden">
              {activeTopic ? (
                <div className="border-b border-border px-4 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setActiveTopicId(null)}
                  >
                    ← All topics
                  </Button>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto border-b border-border px-2 py-2">
                  <ul className="space-y-0.5">
                    {results.map((topic) => (
                      <li key={topic.id}>
                        <button
                          type="button"
                          onClick={() => setActiveTopicId(topic.id)}
                          className={cn(
                            "w-full rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted",
                            activeTopicId === topic.id && "bg-muted"
                          )}
                        >
                          <span className="font-medium text-foreground">{topic.title}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-1">
                            {topic.summary}
                          </span>
                        </button>
                      </li>
                    ))}
                    {results.length === 0 && (
                      <li className="px-2 py-4 text-center text-sm text-muted-foreground">
                        No topics match your search.
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="overflow-y-auto px-4 py-4">
                {activeTopic ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">
                        {activeTopic.title}
                      </h3>
                      <p className="mt-1 text-xs capitalize text-muted-foreground">
                        {activeTopic.category}
                      </p>
                    </div>
                    <HelpTopicContent
                      topic={activeTopic}
                      role={role}
                      onOpenRelated={setActiveTopicId}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setTab("ask")}
                    >
                      Ask AI about this topic
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Select a topic above, or click the{" "}
                      <span className="inline-flex items-center text-foreground">?</span> icon on any
                      dashboard metric for a quick definition.
                    </p>
                    <p>
                      Switch to <span className="text-foreground">Ask AI</span> for conversational
                      help grounded in the same instruction library.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ask" className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden">
            <CoachAiTab />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
