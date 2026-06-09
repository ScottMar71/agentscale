"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { COOKIE_CONSENT_KEY, type CookieConsentValue } from "@/lib/cookies/consent";

const DASHBOARD_PREFIX = "/dashboard";

function setConsent(value: CookieConsentValue) {
  localStorage.setItem(COOKIE_CONSENT_KEY, value);
}

export function CookieConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname.startsWith(DASHBOARD_PREFIX)) return;
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      queueMicrotask(() => setVisible(true));
    }
  }, [pathname]);

  if (!visible) return null;

  function accept(value: CookieConsentValue) {
    setConsent(value);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur-sm sm:p-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p id="cookie-consent-title" className="text-sm font-medium text-foreground">
            We use cookies
          </p>
          <p id="cookie-consent-description" className="mt-1 text-sm text-muted-foreground">
            AgentScale uses essential cookies for sign-in and optional analytics cookies to
            improve the product. See our{" "}
            <Link href="/cookies" className="underline underline-offset-2 hover:text-foreground">
              Cookie Policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => accept("essential")}>
            Essential only
          </Button>
          <Button size="sm" onClick={() => accept("accepted")}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
