import Link from "next/link";
import {
  Award,
  BarChart3,
  Bot,
  Check,
  GraduationCap,
  Shield,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/marketing/contact-form";
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
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1426] text-xs font-bold text-white">
              AS
            </div>
            <span className="font-semibold text-[#0B1426]">{APP_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants(), "bg-[#2563EB] hover:bg-[#1d4ed8] text-white")}
            >
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-[#2563EB]">
            AI Workforce Management
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[#0B1426] md:text-5xl lg:text-6xl">
            {APP_TAGLINE}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Onboard, certify, govern and optimise AI agents across your organisation.
            The platform enterprises use when spreadsheets stop scaling.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#contact"
              className={cn(buttonVariants({ size: "lg" }), "bg-[#2563EB] hover:bg-[#1d4ed8] text-white")}
            >
              Book demo
            </a>
            <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20" id="problem">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-semibold text-[#0B1426]">
            Enterprise AI is scaling faster than governance
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              "No single registry of deployed agents",
              "Training and prompts live in disconnected documents",
              "Compliance teams cannot produce audit evidence on demand",
            ].map((item) => (
              <Card key={item} className="border-slate-200">
                <CardContent className="pt-6 text-slate-600">{item}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B1426] px-6 py-20 text-white" id="features">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-semibold">Platform capabilities</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-300">
            Everything HR and LMS platforms do for humans — built for AI workers.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <f.icon className="h-8 w-8 text-[#2563EB]" />
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">{f.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
          <h2 className="text-3xl font-semibold text-[#0B1426]">Measurable ROI</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-4xl font-semibold text-[#2563EB]">£2.4M</p>
              <p className="mt-2 text-sm text-slate-600">Avg. annual savings (200 agents)</p>
            </div>
            <div>
              <p className="text-4xl font-semibold text-[#2563EB]">81%</p>
              <p className="mt-2 text-sm text-slate-600">Certification coverage</p>
            </div>
            <div>
              <p className="text-4xl font-semibold text-[#2563EB]">3 days</p>
              <p className="mt-2 text-sm text-slate-600">Time to certify new agents</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20" id="pricing">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-semibold text-[#0B1426]">Pricing</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {(["starter", "growth", "enterprise"] as const).map((key) => {
              const plan = PLANS[key];
              return (
                <Card
                  key={key}
                  className={key === "growth" ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : ""}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <p className="text-2xl font-semibold text-[#0B1426]">
                      {plan.priceLabel}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-600">
                      {plan.agents === -1
                        ? "Unlimited agents"
                        : `Up to ${plan.agents} agents`}
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {["Agent Registry", "Training Academy", "Scenario Testing"].map(
                        (f) => (
                          <li key={f} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-emerald-600" />
                            {f}
                          </li>
                        )
                      )}
                      {key !== "starter" && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-600" />
                          Governance Centre
                        </li>
                      )}
                      {key === "enterprise" && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-600" />
                          Custom compliance workflows
                        </li>
                      )}
                    </ul>
                    <Link
                      href="/dashboard"
                      className={cn(
                        buttonVariants({ variant: key === "growth" ? "default" : "outline" }),
                        "w-full mt-4"
                      )}
                    >
                      Get started
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 border-y border-slate-100">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-slate-500 italic">
            &ldquo;AgentScale gave us audit-ready certification for every production agent
            in under a quarter.&rdquo; — Chief Digital Officer, FTSE 250 Financial Services
          </p>
        </div>
      </section>

      <section className="px-6 py-20" id="faq">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-semibold text-[#0B1426]">FAQ</h2>
          <div className="mt-10 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-medium text-[#0B1426]">{faq.q}</h3>
                <p className="mt-2 text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20" id="contact">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-2xl font-semibold text-[#0B1426]">
            Book a demo
          </h2>
          <p className="mt-2 text-center text-slate-600">
            See how AgentScale becomes your system of record for AI workers.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
}
