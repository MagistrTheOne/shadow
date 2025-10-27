import { db } from "@/db";
import { subscriptions, payments } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { createSubscription, cancelSubscription, getSubscription } from "@/lib/polar";

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

      return subscription;
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

      if (existingSubscription) {
        throw new Error("User already has an active subscription");
      }

      let polarSubscriptionId: string | null = null;

      // Create Polar subscription for paid plans
      if (input.plan !== "free") {
        try {
          const polarSubscription = await createSubscription(ctx.auth.user.id, input.plan);
          polarSubscriptionId = polarSubscription.id;
        } catch (error) {
          console.error("Failed to create Polar subscription:", error);
          throw new Error("Failed to create subscription");
        }
      }

      // Create local subscription record
      const [createdSubscription] = await db
        .insert(subscriptions)
        .values({
          userId: ctx.auth.user.id,
          polarSubscriptionId,
          plan: input.plan,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        })
        .returning();

      return createdSubscription;
    }),

  cancel: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
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

      // Cancel Polar subscription if exists
      if (subscription.polarSubscriptionId) {
        try {
          await cancelSubscription(subscription.polarSubscriptionId);
        } catch (error) {
          console.error("Failed to cancel Polar subscription:", error);
          // Continue with local cancellation even if Polar fails
        }
      }

      // Update local subscription
      const [updatedSubscription] = await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, input.subscriptionId))
        .returning();

      return updatedSubscription;
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

      // TODO: Update payment method in Polar
      // For now, just return success
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
