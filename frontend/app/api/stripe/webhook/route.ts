import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
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
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "subscription" || !session.subscription) return NextResponse.json({ ok: true });

    const subscription = await getStripe().subscriptions.retrieve(session.subscription as string);

    // Look up user_id — first by customer_id in subscriptions, then by email
    let userId: string | null = null;

    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", session.customer as string)
      .single();

    if (existingSub?.user_id) {
      userId = existingSub.user_id;
    } else {
      const email = (session as any).customer_details?.email as string | undefined;
      if (email) {
        const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        const match = users.find((u) => u.email === email);
        if (match) userId = match.id;
      }
    }

    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 400 });

    const periodEnd = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000).toISOString()
      : null;

    await supabase.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      status: "active",
      current_period_end: periodEnd,
    });
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const status = subscription.status === "active" ? "active" : "canceled";

    const periodEnd = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000).toISOString()
      : null;

    await supabase.from("subscriptions")
      .update({
        status,
        stripe_subscription_id: subscription.id,
        current_period_end: periodEnd,
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
