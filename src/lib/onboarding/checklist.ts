import { ONBOARDING_CHECKLIST } from "@/lib/constants";

export type ChecklistItem = {
  key: string;
  label: string;
  completed: boolean;
};

export function buildDefaultChecklist(
  existing?: ChecklistItem[] | null
): ChecklistItem[] {
  const byKey = new Map((existing ?? []).map((item) => [item.key, item]));

  return ONBOARDING_CHECKLIST.map((item) => {
    const prev = byKey.get(item.key);
    return {
      key: item.key,
      label: item.label,
      completed: prev?.completed ?? false,
    };
  });
}

export function computeProgressPercent(checklist: ChecklistItem[]): number {
  if (checklist.length === 0) return 0;
  const done = checklist.filter((i) => i.completed).length;
  return Math.round((done / checklist.length) * 100);
}
