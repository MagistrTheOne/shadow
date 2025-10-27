import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log("Polar webhook received:", { type, data });

    switch (type) {
      case "subscription.created":
        await handleSubscriptionCreated(data);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(data);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(data);
        break;

      case "subscription.uncancelled":
        await handleSubscriptionUncancelled(data);
        break;

      case "payment.succeeded":
        await handlePaymentSucceeded(data);
        break;

      case "payment.failed":
        await handlePaymentFailed(data);
        break;

      default:
        console.log("Unhandled webhook type:", type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Polar webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(data: any) {
  const { id, user_id, product_id, status, current_period_start, current_period_end } = data;

  // Map Polar product IDs to our plan names
  const planMapping: Record<string, string> = {
    "pro_monthly": "pro",
    "enterprise_monthly": "enterprise",
  };

  const plan = planMapping[product_id] || "free";

  // Create or update subscription
  await db
    .insert(subscriptions)
    .values({
      userId: user_id,
      polarSubscriptionId: id,
      plan,
      status: status === "active" ? "active" : "cancelled",
      currentPeriodStart: new Date(current_period_start * 1000),
      currentPeriodEnd: new Date(current_period_end * 1000),
    })
    .onConflictDoUpdate({
      target: subscriptions.polarSubscriptionId,
      set: {
        status: status === "active" ? "active" : "cancelled",
        currentPeriodStart: new Date(current_period_start * 1000),
        currentPeriodEnd: new Date(current_period_end * 1000),
        updatedAt: new Date(),
      },
    });

  console.log("Subscription created/updated:", { user_id, plan, status });
}

async function handleSubscriptionUpdated(data: any) {
  const { id, status, current_period_start, current_period_end } = data;

  await db
    .update(subscriptions)
    .set({
      status: status === "active" ? "active" : "cancelled",
      currentPeriodStart: current_period_start ? new Date(current_period_start * 1000) : undefined,
      currentPeriodEnd: current_period_end ? new Date(current_period_end * 1000) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.polarSubscriptionId, id));

  console.log("Subscription updated:", { id, status });
}

async function handleSubscriptionCancelled(data: any) {
  const { id } = data;

  await db
    .update(subscriptions)
    .set({
      status: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.polarSubscriptionId, id));

  console.log("Subscription cancelled:", { id });
}

async function handleSubscriptionUncancelled(data: any) {
  const { id, current_period_start, current_period_end } = data;

  await db
    .update(subscriptions)
    .set({
      status: "active",
      currentPeriodStart: current_period_start ? new Date(current_period_start * 1000) : undefined,
      currentPeriodEnd: current_period_end ? new Date(current_period_end * 1000) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.polarSubscriptionId, id));

  console.log("Subscription uncancelled:", { id });
}

async function handlePaymentSucceeded(data: any) {
  const { id, subscription_id, amount, currency, invoice_url } = data;

  // Find subscription by Polar ID
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.polarSubscriptionId, subscription_id))
    .limit(1);

  if (subscription) {
    // Create payment record
    await db.insert(payments).values({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: (amount / 100).toString(), // Convert from cents
      currency,
      status: "completed",
      polarPaymentId: id,
    });

    console.log("Payment succeeded:", { id, subscription_id, amount, currency });
  }
}

async function handlePaymentFailed(data: any) {
  const { id, subscription_id, amount, currency } = data;

  // Find subscription by Polar ID
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.polarSubscriptionId, subscription_id))
    .limit(1);

  if (subscription) {
    // Create failed payment record
    await db.insert(payments).values({
      userId: subscription.userId,
      subscriptionId: subscription.id,
      amount: (amount / 100).toString(),
      currency,
      status: "failed",
      polarPaymentId: id,
    });

    console.log("Payment failed:", { id, subscription_id, amount, currency });
  }
}