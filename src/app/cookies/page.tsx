import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Cookie Policy",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/"
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${APP_NAME} home`}
          >
            <Logo wordmarkClassName="text-foreground" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold text-foreground">Cookie Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="prose prose-neutral mt-10 max-w-none space-y-8 text-muted-foreground [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:text-sm [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-sm">
          <section>
            <h2>What are cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They
              help the site work correctly and, with your consent, help us understand how the
              product is used.
            </p>
          </section>

          <section>
            <h2>How AgentScale uses cookies</h2>
            <p>We use the following categories of cookies:</p>
            <ul>
              <li>
                <strong className="text-foreground">Essential</strong> — required for
                authentication, session management, and organisation context. These cannot be
                disabled while using the platform.
              </li>
              <li>
                <strong className="text-foreground">Analytics</strong> — help us measure
                performance and usage (for example, Vercel Analytics and Speed Insights). These
                are only used when you choose &ldquo;Accept all&rdquo; on our cookie banner.
              </li>
            </ul>
          </section>

          <section>
            <h2>Essential cookies we set</h2>
            <ul>
              <li>
                <strong className="text-foreground">Supabase auth cookies</strong> — keep you
                signed in securely.
              </li>
              <li>
                <strong className="text-foreground">agentscale_org_id</strong> — remembers your
                selected organisation in the dashboard.
              </li>
              <li>
                <strong className="text-foreground">agentscale_cookie_consent</strong> — stores
                your cookie preference on this device.
              </li>
            </ul>
          </section>

          <section>
            <h2>Managing your preferences</h2>
            <p>
              When you first visit our marketing site, you can accept all cookies or limit use to
              essential cookies only. You can also clear cookies at any time through your browser
              settings. Clearing essential cookies will sign you out of the platform.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about this policy? Reach us through the{" "}
              <Link href="/#contact" className="text-foreground underline underline-offset-2">
                contact form
              </Link>{" "}
              on our website.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-8">
        <p className="mx-auto max-w-3xl text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
