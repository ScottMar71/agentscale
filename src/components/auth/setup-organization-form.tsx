"use client";

import { useActionState, useState } from "react";
import {
  createOrganization,
  type CreateOrganizationState,
} from "@/app/actions/organization";
import { slugifyOrganizationName } from "@/lib/utils/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: CreateOrganizationState = {};

export function SetupOrganizationForm() {
  const [state, action, pending] = useActionState(createOrganization, initial);
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState("");

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Organization name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Acme Corp"
          onChange={(e) => {
            if (!slugTouched) {
              setSlug(slugifyOrganizationName(e.target.value));
            }
          }}
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name[0]}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Workspace URL</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground shrink-0">agentscale.app/</span>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
            }}
            placeholder="acme-corp"
          />
        </div>
        {state.fieldErrors?.slug && (
          <p className="text-xs text-destructive">{state.fieldErrors.slug[0]}</p>
        )}
      </div>
      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating workspace…" : "Create workspace"}
      </Button>
    </form>
  );
}
