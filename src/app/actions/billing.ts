"use server";

import { redirect } from "next/navigation";
import { getStripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganization, getAuthUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type BillingActionState = {
  error?: string;
};

export async function startCheckout(plan: "starter" | "growth"): Promise<BillingActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to manage billing." };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { error: "Stripe is not configured on this deployment." };
  }

  const org = await getCurrentOrganization();
  const user = await getAuthUser();
  if (!org) return { error: "No workspace selected." };
  if (org.role !== "org_admin") {
    return { error: "Only organisation admins can manage billing." };
  }

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    return { error: `Stripe price not configured for ${plan}.` };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings?checkout=success`,
    cancel_url: `${appUrl}/dashboard/settings`,
    customer_email: user?.email,
    client_reference_id: org.id,
    metadata: { organizationId: org.id, plan },
  });

  if (!session.url) {
    return { error: "Failed to create checkout session." };
  }

  redirect(session.url);
}

export async function openCustomerPortal(): Promise<BillingActionState> {
  if (!isAuthEnabled()) {
    return { error: "Connect Supabase to manage billing." };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { error: "Stripe is not configured on this deployment." };
  }

  const org = await getCurrentOrganization();
  if (!org) return { error: "No workspace selected." };
  if (org.role !== "org_admin") {
    return { error: "Only organisation admins can open the billing portal." };
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", org.id)
    .maybeSingle();

  if (!row?.stripe_customer_id) {
    return { error: "Subscribe to a plan first to access the customer portal." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: row.stripe_customer_id,
    return_url: `${appUrl}/dashboard/settings`,
  });

  redirect(session.url);
}

export async function startStarterCheckout(): Promise<void> {
  await startCheckout("starter");
}

export async function startGrowthCheckout(): Promise<void> {
  await startCheckout("growth");
}

export async function submitCustomerPortal(): Promise<void> {
  await openCustomerPortal();
}
