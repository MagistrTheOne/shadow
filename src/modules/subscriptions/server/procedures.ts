import { db } from "@/db";
import { subscriptions, payments } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { createPolarSubscription, cancelPolarSubscription } from "@/lib/polar";
import { createSubscription, cancelSubscription, getSubscription } from "@/lib/polar-subscriptions";
import { checkMeetingLimit, checkStorageLimit } from "@/lib/subscription-limits";

export const subscriptionsRouter = createTRPCRouter({
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, ctx.auth.user.id),
            eq(subscriptions.status, "active")
          )
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);

      // If no active subscription found, return free plan as default
      if (!subscription) {
        return {
          id: "free-default",
          userId: ctx.auth.user.id,
          plan: "free" as const,
          status: "active" as const,
          currentPeriodStart: new Date(),
          currentPeriodEnd: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      return subscription;
    }),

  getUsage: protectedProcedure
    .query(async ({ ctx }) => {
      const [meetingsMetrics] = await Promise.all([
        checkMeetingLimit(ctx.auth.user.id),
      ]);
      
      const [storageMetrics] = await Promise.all([
        checkStorageLimit(ctx.auth.user.id),
      ]);

      return {
        meetings: {
          current: meetingsMetrics.current,
          limit: meetingsMetrics.limit,
        },
        storage: {
          currentGB: storageMetrics.currentGB,
          limitGB: storageMetrics.limitGB,
        },
      };
    }),

  getPlans: protectedProcedure
    .query(async () => {
      // Return available subscription plans
      return [
        {
          id: "free",
          name: "Free",
          price: 0,
          currency: "USD",
          features: [
            "Up to 5 meetings per month",
            "Basic AI summaries",
            "Standard support"
          ],
          limits: {
            meetingsPerMonth: 5,
            storageGB: 1,
            transcriptWords: 10000,
          }
        },
        {
          id: "pro",
          name: "Pro",
          price: 29,
          currency: "USD",
          features: [
            "Unlimited meetings",
            "Advanced AI summaries",
            "Priority support",
            "Custom agents",
            "API access"
          ],
          limits: {
            meetingsPerMonth: -1, // unlimited
            storageGB: 100,
            transcriptWords: -1, // unlimited
          }
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: 99,
          currency: "USD",
          features: [
            "Everything in Pro",
            "White-label solution",
            "Dedicated support",
            "Custom integrations",
            "SLA guarantee"
          ],
          limits: {
            meetingsPerMonth: -1,
            storageGB: -1, // unlimited
            transcriptWords: -1,
          }
        }
      ];
    }),

  create: protectedProcedure
    .input(z.object({
      plan: z.enum(["free", "pro", "enterprise"]),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user already has an active subscription
      const [existingSubscription] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, ctx.auth.user.id),
            eq(subscriptions.status, "active")
          )
        )
        .limit(1);

      const now = new Date();

      if (existingSubscription) {
        // Update existing subscription to new plan
        const [updatedSubscription] = await db
          .update(subscriptions)
          .set({
            plan: input.plan,
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: input.plan === "free" ? null : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days for paid plans
            updatedAt: now,
          })
          .where(eq(subscriptions.userId, ctx.auth.user.id))
          .returning();

        return updatedSubscription;
      } else {
        // Create new subscription record
        // Polar integration is available but optional
        const [createdSubscription] = await db
          .insert(subscriptions)
          .values({
            userId: ctx.auth.user.id,
            polarSubscriptionId: null,
            plan: input.plan,
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: input.plan === "free" ? null : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          })
          .returning();

        return createdSubscription;
      }
    }),

  cancel: protectedProcedure
    .mutation(async ({ ctx }) => {
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, ctx.auth.user.id),
            eq(subscriptions.status, "active")
          )
        )
        .limit(1);

      if (subscription?.polarSubscriptionId) {
        try {
          await cancelPolarSubscription(subscription.polarSubscriptionId);
        } catch (error) {
          console.error('Failed to cancel Polar subscription:', error);
        }
      }

      await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, ctx.auth.user.id));

      return { success: true };
    }),

  updatePaymentMethod: protectedProcedure
    .input(z.object({ 
      subscriptionId: z.string(),
      paymentMethodId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get subscription and verify ownership
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.id, input.subscriptionId),
            eq(subscriptions.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      if (subscription.polarSubscriptionId) {
        try {
          // Polar payment method update would go here
          // await updatePolarPaymentMethod(subscription.polarSubscriptionId, input.paymentMethodId);
        } catch (error) {
          console.error('Failed to update payment method in Polar:', error);
        }
      }

      return { success: true };
    }),

  getPaymentHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const data = await db
        .select()
        .from(payments)
        .where(eq(payments.userId, ctx.auth.user.id))
        .orderBy(desc(payments.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return data;
    }),
});
