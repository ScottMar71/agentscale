import Stripe from "stripe";
import { PLANS } from "@/lib/constants";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER ?? "",
  growth: process.env.STRIPE_PRICE_GROWTH ?? "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE ?? "",
} as const;

export function planFromPriceId(priceId: string): keyof typeof PLANS | null {
  if (priceId === STRIPE_PRICE_IDS.starter) return "starter";
  if (priceId === STRIPE_PRICE_IDS.growth) return "growth";
  if (priceId === STRIPE_PRICE_IDS.enterprise) return "enterprise";
  return null;
}
