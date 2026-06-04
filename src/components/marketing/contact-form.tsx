"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" required placeholder="Jordan Avery" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" autoComplete="organization" placeholder="Acme Corp" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">What would you like to see?</Label>
            <Input id="message" name="message" placeholder="Certifying our support agents…" />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending…" : "Book a demo"}
          </Button>
          {status === "success" && (
            <p
              role="status"
              className="text-center text-sm font-medium text-success"
            >
              Thanks — we&apos;ll be in touch within one business day.
            </p>
          )}
          {status === "error" && (
            <p
              role="alert"
              className="text-center text-sm font-medium text-destructive"
            >
              Something went wrong. Email{" "}
              <a className="underline" href="mailto:hello@agentscale.io">
                hello@agentscale.io
              </a>{" "}
              directly.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
