import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase-service";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "subscription" || !session.subscription) return NextResponse.json({ ok: true });

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const userId = subscription.metadata?.user_id ?? session.metadata?.user_id;

    await supabase.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      status: "active",
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    });
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const status = subscription.status === "active" ? "active" : "canceled";
    await supabase.from("subscriptions")
      .update({
        status,
        stripe_subscription_id: subscription.id,
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      })
      .eq("stripe_customer_id", subscription.customer as string);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await supabase.from("subscriptions")
      .update({ status: "canceled", stripe_subscription_id: null })
      .eq("stripe_customer_id", subscription.customer as string);
  }

  return NextResponse.json({ ok: true });
}
