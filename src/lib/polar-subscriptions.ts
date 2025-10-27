import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'free',
    price: 0,
    interval: 'month',
    features: ['5 meetings per month', 'Basic AI avatars', 'Standard support']
  },
  {
    id: 'pro',
    name: 'pro',
    price: 29,
    interval: 'month',
    features: ['50 meetings per month', 'Advanced AI avatars', 'Priority support', 'Custom branding']
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    price: 99,
    interval: 'month',
    features: ['Unlimited meetings', 'Custom AI avatars', '24/7 support', 'White-label solution']
  }
];

export async function createSubscription(
  userId: string,
  planId: string,
  paymentMethodId?: string
): Promise<{ subscriptionId: string }> {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  if (plan.price === 0) {
    // Free plan - create directly
    const [subscription] = await db.insert(subscriptions).values({
      userId,
      plan: plan.name as "free" | "pro" | "enterprise",
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }).returning();

    return { subscriptionId: subscription.id };
  }

  // Paid plan - simplified implementation
  return { subscriptionId: 'polar-subscription-id' };
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await db
    .update(subscriptions)
    .set({ status: 'cancelled' })
    .where(eq(subscriptions.id, subscriptionId));
}

export async function getSubscription(userId: string) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return subscription;
}