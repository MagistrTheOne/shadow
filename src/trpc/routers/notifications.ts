import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, count } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../init";
import { notifications, user } from "@/db/schema";
import { db } from "@/db";

export const notificationsRouter = createTRPCRouter({
  // Get unread notifications
  getUnread: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const notificationsList = await db
        .select({
          id: notifications.id,
          type: notifications.type,
          fromUserId: notifications.fromUserId,
          metadata: notifications.metadata,
          isRead: notifications.isRead,
          createdAt: notifications.createdAt,
          fromUser: {
            id: user.id,
            name: user.name,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
          },
        })
        .from(notifications)
        .leftJoin(user, eq(notifications.fromUserId, user.id))
        .where(eq(notifications.userId, ctx.auth.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const totalCount = await db
        .select({ count: count() })
        .from(notifications)
        .where(eq(notifications.userId, ctx.auth.user.id));

      return {
        notifications: notificationsList,
        totalCount: totalCount[0]?.count || 0,
      };
    }),

  // Mark single notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!notification[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      const updatedNotification = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.notificationId))
        .returning();

      return updatedNotification[0];
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, ctx.auth.user.id),
          eq(notifications.isRead, false)
        )
      );

    return { success: true };
    }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.auth.user.id),
          eq(notifications.isRead, false)
        )
      );

    return { count: result[0]?.count || 0 };
  }),

  // Delete notification
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const notification = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.id, input.notificationId),
            eq(notifications.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!notification[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        });
      }

      await db.delete(notifications).where(eq(notifications.id, input.notificationId));

      return { success: true };
    }),

  // Delete all notifications
  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    await db
      .delete(notifications)
      .where(eq(notifications.userId, ctx.auth.user.id));

    return { success: true };
  }),
});
