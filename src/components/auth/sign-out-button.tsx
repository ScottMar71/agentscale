"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  variant?: "default" | "outline" | "ghost";
  className?: string;
};

export function SignOutButton({ variant = "outline", className }: SignOutButtonProps) {
  return (
    <form action={signOut}>
      <Button type="submit" variant={variant} className={className}>
        Sign out
      </Button>
    </form>
  );
}

/** Sidebar nav item styled to match other dashboard links. */
export function SignOutNavItem({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <form action={signOut} className="w-full">
      <button
        type="submit"
        onClick={onNavigate}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-foreground/70 outline-none transition-colors duration-200",
          "hover:bg-white/5 hover:text-brand-foreground focus-visible:ring-2 focus-visible:ring-brand-accent"
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden />
        Sign out
      </button>
    </form>
  );
}
