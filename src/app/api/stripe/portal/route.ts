import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { isAuthEnabled } from "@/lib/auth/config";
import { getCurrentOrganizationId } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  organizationId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  if (!isAuthEnabled()) {
    return NextResponse.json({ error: "Auth required" }, { status: 401 });
  }

  try {
    const body = schema.parse(await request.json().catch(() => ({})));
    const organizationId =
      body.organizationId ?? (await getCurrentOrganizationId());

    if (!organizationId) {
      return NextResponse.json({ error: "No workspace selected" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", organizationId)
      .maybeSingle();

    if (!org?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account yet. Subscribe to a plan first." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${appUrl}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Portal session failed" }, { status: 500 });
  }
}
