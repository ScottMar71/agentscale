"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { OrgRole } from "@/types";

interface HelpContextValue {
  role: OrgRole | null;
  coachOpen: boolean;
  activeTopicId: string | null;
  openCoach: (topicId?: string) => void;
  closeCoach: () => void;
  setActiveTopicId: (topicId: string | null) => void;
}

const HelpContext = createContext<HelpContextValue | null>(null);

export function HelpProvider({
  children,
  role = null,
}: {
  children: ReactNode;
  role?: OrgRole | null;
}) {
  const [coachOpen, setCoachOpen] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const openCoach = useCallback((topicId?: string) => {
    setActiveTopicId(topicId ?? null);
    setCoachOpen(true);
  }, []);

  const closeCoach = useCallback(() => {
    setCoachOpen(false);
    setActiveTopicId(null);
  }, []);

  const value = useMemo(
    () => ({
      role,
      coachOpen,
      activeTopicId,
      openCoach,
      closeCoach,
      setActiveTopicId,
    }),
    [role, coachOpen, activeTopicId, openCoach, closeCoach]
  );

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error("useHelp must be used within HelpProvider");
  }
  return context;
}
