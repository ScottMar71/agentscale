import Link from "next/link";
import {
  Award,
  BarChart3,
  Bot,
  Check,
  GraduationCap,
  Shield,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/marketing/contact-form";
import { Logo } from "@/components/brand/logo";
import { APP_NAME, APP_TAGLINE, PLANS } from "@/lib/constants";

const features = [
  {
    icon: Bot,
    title: "Agent Registry",
    description:
      "Single directory for every AI agent — identity, version, tools, risk, and deployment status.",
  },
  {
    icon: GraduationCap,
    title: "Training Academy",
    description:
      "LMS-style curricula, modules, and knowledge paths tailored for AI agent certification.",
  },
  {
    icon: Award,
    title: "Certification Engine",
    description:
      "Digital certificates with expiry, audit evidence, and human approval workflows.",
  },
  {
    icon: Shield,
    title: "Governance Centre",
    description:
      "Compliance dashboards, audit logs, and risk visibility for regulated industries.",
  },
  {
    icon: BarChart3,
    title: "Performance Management",
    description:
      "Health scores, KPIs, cost per task, and continuous improvement tracking.",
  },
];

const faqs = [
  {
    q: "Is AgentScale an LMS for AI?",
    a: "We position as AI Workforce Management — the system of record for digital workers, combining training, certification, governance, and performance.",
  },
  {
    q: "Which agent types are supported?",
    a: "All types: sales, support, legal, finance, engineering, HR, marketing, and custom enterprise agents.",
  },
  {
    q: "How does scenario testing work?",
    a: "Admins define realistic scenarios; OpenAI evaluates agent responses against policy, accuracy, tone, and compliance criteria.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${APP_NAME} home`}
          >
            <Logo wordmarkClassName="text-foreground" />
          </Link>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex"
          >
            <a className="transition-colors hover:text-foreground" href="#features">Platform</a>
            <a className="transition-colors hover:text-foreground" href="#pricing">Pricing</a>
            <a className="transition-colors hover:text-foreground" href="#faq">FAQ</a>
            <a className="transition-colors hover:text-foreground" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "lg" })}>
              Sign in
            </Link>
            <Link href="#contact" className={buttonVariants({ size: "lg" })}>
              Book a demo
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted to-background px-6 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent" />
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary shadow-xs">
            <span className="size-1.5 rounded-full bg-brand-accent" aria-hidden />
            AI Workforce Management
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {APP_TAGLINE}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Onboard, certify, and govern every AI agent you put into production —
            with the audit trail your risk team actually trusts. This is where
            spreadsheets stop and your system of record begins.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="#contact" className={buttonVariants({ size: "lg" })}>
              Book a demo
            </a>
            <Link href="/signup" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/40 px-6 py-12" aria-label="Design partners">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Design partner programme
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Onboarding regulated teams with 10+ production agents. Partner logos and case studies
            publishing Q1 2026.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 opacity-60">
            {["Financial services", "Healthcare", "Enterprise SaaS", "Insurance", "Legal AI"].map(
              (segment) => (
                <span
                  key={segment}
                  className="rounded-md border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground"
                >
                  {segment}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-20" id="problem">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-semibold text-foreground">
            Your AI workforce is scaling faster than your governance
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              "No single registry of which agents are live, or who owns them",
              "Prompts and training scattered across docs, wikis, and DMs",
              "Compliance can't produce audit evidence when the regulator asks",
            ].map((item) => (
              <Card key={item}>
                <CardContent className="pt-6 text-muted-foreground">{item}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand px-6 py-20 text-brand-foreground" id="features">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-semibold">
            Everything HR does for people — built for AI workers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-brand-foreground/70">
            Onboarding, training, certification, and oversight in one system of record.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-0 bg-white/5 text-brand-foreground ring-1 ring-white/10 transition-colors duration-200 hover:bg-white/10"
              >
                <CardHeader>
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-brand-accent">
                    <f.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <CardTitle className="text-lg text-brand-foreground">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-brand-foreground/70">{f.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-muted p-8 text-center sm:p-12">
          <h2 className="font-heading text-3xl font-semibold text-foreground">Measurable ROI</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Modelled on a 200-agent deployment across regulated teams.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { stat: "£2.4M", label: "Average annual savings" },
              { stat: "81%", label: "Certification coverage" },
              { stat: "3 days", label: "To certify a new agent" },
            ].map((m) => (
              <div key={m.label}>
                <p className="font-heading text-4xl font-semibold text-primary">{m.stat}</p>
                <p className="mt-2 text-sm text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20" id="pricing">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-semibold text-foreground">
            Pricing that scales with your workforce
          </h2>
          <div className="mt-12 grid items-start gap-6 md:grid-cols-3">
            {(["starter", "growth", "enterprise"] as const).map((key) => {
              const plan = PLANS[key];
              const featured = key === "growth";
              return (
                <Card
                  key={key}
                  className={cn(
                    "relative transition-shadow duration-200 hover:shadow-md",
                    featured && "ring-2 ring-primary"
                  )}
                >
                  {featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground shadow-sm">
                      Most popular
                    </span>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <p className="font-heading text-2xl font-semibold text-foreground">
                      {plan.priceLabel}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {plan.agents === -1
                        ? "Unlimited agents"
                        : `Up to ${plan.agents} agents`}
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {["Agent Registry", "Training Academy", "Scenario Testing"].map(
                        (f) => (
                          <li key={f} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-success" aria-hidden />
                            {f}
                          </li>
                        )
                      )}
                      {key !== "starter" && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" aria-hidden />
                          Governance Centre
                        </li>
                      )}
                      {key === "enterprise" && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" aria-hidden />
                          Custom compliance workflows
                        </li>
                      )}
                    </ul>
                    <Link
                      href={key === "enterprise" ? "#contact" : "/dashboard"}
                      className={cn(
                        buttonVariants({ variant: featured ? "default" : "outline", size: "lg" }),
                        "mt-4 w-full"
                      )}
                    >
                      {key === "enterprise" ? "Talk to sales" : "Start free trial"}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border px-6 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-heading text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
            &ldquo;AgentScale gave us audit-ready certification for every production
            agent in under a quarter.&rdquo;
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Chief Digital Officer · FTSE 250 Financial Services
          </p>
        </div>
      </section>

      <section className="px-6 py-20" id="faq">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-heading text-3xl font-semibold text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-heading font-medium text-foreground">{faq.q}</h3>
                <p className="mt-2 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted px-6 py-20" id="contact">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center font-heading text-2xl font-semibold text-foreground">
            See AgentScale on your agents
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Book a 30-minute demo and we&apos;ll map it to your AI workforce.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo wordmarkClassName="text-foreground" />
          <nav aria-label="Legal" className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/cookies" className="transition-colors hover:text-foreground">
              Cookies
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
