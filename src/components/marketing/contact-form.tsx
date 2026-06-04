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
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input id="email" name="email" type="email" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Input id="message" name="message" className="mt-1" />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#2563EB] hover:bg-[#1d4ed8]"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending…" : "Request demo"}
          </Button>
          {status === "success" && (
            <p className="text-sm text-emerald-600 text-center">
              Thank you — we&apos;ll be in touch shortly.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600 text-center">
              Something went wrong. Email hello@agentscale.io directly.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
