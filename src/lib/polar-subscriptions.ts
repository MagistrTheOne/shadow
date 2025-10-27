import { polarClient } from '@/lib/polar';
import { db } from '@/db';
import { subscriptions, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    meetingsPerMonth: number;
    recordingStorageGB: number;
    participantsPerMeeting: number;
    aiAvatars: number;
  };
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Базовый план для начала работы',
    price: 0,
    currency: 'RUB',
    interval: 'month',
    features: [
      'До 3 встреч в месяц',
      '1 AI аватар',
      '2 часа записи',
      'Базовая транскрипция',
    ],
    limits: {
      meetingsPerMonth: 3,
      recordingStorageGB: 2,
      participantsPerMeeting: 5,
      aiAvatars: 1,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Для профессионалов и малого бизнеса',
    price: 2990,
    currency: 'RUB',
    interval: 'month',
    features: [
      'Неограниченные встречи',
      '5 AI аватаров',
      '100 ГБ записи',
      'Продвинутая транскрипция',
      'Приоритетная поддержка',
    ],
    limits: {
      meetingsPerMonth: -1, // unlimited
      recordingStorageGB: 100,
      participantsPerMeeting: 50,
      aiAvatars: 5,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Для крупных организаций',
    price: 9990,
    currency: 'RUB',
    interval: 'month',
    features: [
      'Все функции Professional',
      'Неограниченные AI аватары',
      '1 ТБ записи',
      'Кастомные интеграции',
      'Персональный менеджер',
    ],
    limits: {
      meetingsPerMonth: -1,
      recordingStorageGB: 1000,
      participantsPerMeeting: 200,
      aiAvatars: -1, // unlimited
    },
  },
];

export async function createSubscription(
  userId: string,
  planId: string,
  paymentMethodId?: string
): Promise<{ subscriptionId: string; checkoutUrl?: string }> {
  try {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    if (plan.price === 0) {
      // Free plan - create directly
      const [subscription] = await db.insert(subscriptions).values({
        userId,
        planId: plan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        cancelAtPeriodEnd: false,
      }).returning();

      return { subscriptionId: subscription.id };
    }

    // Paid plan - create via Polar
    const polarSubscription = await polarClient.subscriptions.create({
      customer_id: userId,
      product_id: plan.id,
      price_id: `${plan.id}_${plan.interval}`,
      payment_method_id: paymentMethodId,
    });

    // Save to database
    const [subscription] = await db.insert(subscriptions).values({
      userId,
      planId: plan.id,
      polarSubscriptionId: polarSubscription.id,
      status: polarSubscription.status,
      currentPeriodStart: new Date(polarSubscription.current_period_start),
      currentPeriodEnd: new Date(polarSubscription.current_period_end),
      cancelAtPeriodEnd: polarSubscription.cancel_at_period_end,
    }).returning();

    return { 
      subscriptionId: subscription.id,
      checkoutUrl: polarSubscription.latest_invoice?.hosted_invoice_url,
    };
  } catch (error) {
    console.error('Failed to create subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.polarSubscriptionId) {
      // Cancel in Polar
      await polarClient.subscriptions.cancel(subscription.polarSubscriptionId);
    }

    // Update local status
    await db
      .update(subscriptions)
      .set({ 
        status: 'canceled',
        canceledAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId));
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
}

export async function handleWebhookEvent(event: any): Promise<void> {
  try {
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;
      case 'subscription.deleted':
        await handleSubscriptionDeleted(event.data);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data);
        break;
      default:
        console.log('Unhandled webhook event:', event.type);
    }
  } catch (error) {
    console.error('Webhook handling error:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(data: any): Promise<void> {
  // Subscription already created in createSubscription
  console.log('Subscription created:', data.id);
}

async function handleSubscriptionUpdated(data: any): Promise<void> {
  await db
    .update(subscriptions)
    .set({
      status: data.status,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end,
    })
    .where(eq(subscriptions.polarSubscriptionId, data.id));
}

async function handleSubscriptionDeleted(data: any): Promise<void> {
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
    })
    .where(eq(subscriptions.polarSubscriptionId, data.id));
}

async function handlePaymentSucceeded(data: any): Promise<void> {
  // Record successful payment
  await db.insert(payments).values({
    subscriptionId: data.subscription,
    amount: data.amount_paid,
    currency: data.currency,
    status: 'succeeded',
    polarInvoiceId: data.id,
    paidAt: new Date(data.status_transitions.paid_at),
  });
}

async function handlePaymentFailed(data: any): Promise<void> {
  // Record failed payment
  await db.insert(payments).values({
    subscriptionId: data.subscription,
    amount: data.amount_due,
    currency: data.currency,
    status: 'failed',
    polarInvoiceId: data.id,
    failedAt: new Date(),
  });
}

export async function getUserSubscription(userId: string) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(subscriptions.createdAt)
    .limit(1);

  return subscription;
}

export async function checkSubscriptionLimits(userId: string, feature: keyof SubscriptionPlan['limits']): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return false;
  }

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
  if (!plan) {
    return false;
  }

  const limit = plan.limits[feature];
  
  // -1 means unlimited
  if (limit === -1) {
    return true;
  }

  // TODO: Implement actual usage checking
  // For now, return true for all checks
  return true;
}
