import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, or, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../init";
import { user, friendships, notifications } from "@/db/schema";

export const friendsRouter = createTRPCRouter({
  // Send friend request
  sendRequest: protectedProcedure
    .input(z.object({ receiverId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.receiverId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot send friend request to yourself",
        });
      }

      // Check if user exists
      const receiver = await ctx.db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(eq(user.id, input.receiverId))
        .limit(1);

      if (!receiver[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if friendship already exists
      const existingFriendship = await ctx.db
        .select({ id: friendships.id, status: friendships.status })
        .from(friendships)
        .where(
          or(
            and(eq(friendships.senderId, ctx.userId), eq(friendships.receiverId, input.receiverId)),
            and(eq(friendships.senderId, input.receiverId), eq(friendships.receiverId, ctx.userId))
          )
        )
        .limit(1);

      if (existingFriendship[0]) {
        const status = existingFriendship[0].status;
        if (status === "accepted") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Already friends",
          });
        } else if (status === "pending") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Friend request already pending",
          });
        } else if (status === "blocked") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot send friend request to blocked user",
          });
        }
      }

      // Create friendship
      const newFriendship = await ctx.db
        .insert(friendships)
        .values({
          senderId: ctx.userId,
          receiverId: input.receiverId,
          status: "pending",
        })
        .returning();

      // Create notification
      await ctx.db.insert(notifications).values({
        userId: input.receiverId,
        type: "friend_request",
        fromUserId: ctx.userId,
        metadata: { friendshipId: newFriendship[0].id },
      });

      return newFriendship[0];
    }),

  // Accept friend request
  acceptRequest: protectedProcedure
    .input(z.object({ friendshipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.db
        .select()
        .from(friendships)
        .where(
          and(
            eq(friendships.id, input.friendshipId),
            eq(friendships.receiverId, ctx.userId),
            eq(friendships.status, "pending")
          )
        )
        .limit(1);

      if (!friendship[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Friend request not found",
        });
      }

      // Update friendship status
      const updatedFriendship = await ctx.db
        .update(friendships)
        .set({
          status: "accepted",
          updatedAt: new Date(),
        })
        .where(eq(friendships.id, input.friendshipId))
        .returning();

      // Create notification for sender
      await ctx.db.insert(notifications).values({
        userId: friendship[0].senderId,
        type: "friend_accepted",
        fromUserId: ctx.userId,
        metadata: { friendshipId: input.friendshipId },
      });

      return updatedFriendship[0];
    }),

  // Reject friend request
  rejectRequest: protectedProcedure
    .input(z.object({ friendshipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.db
        .select()
        .from(friendships)
        .where(
          and(
            eq(friendships.id, input.friendshipId),
            eq(friendships.receiverId, ctx.userId),
            eq(friendships.status, "pending")
          )
        )
        .limit(1);

      if (!friendship[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Friend request not found",
        });
      }

      // Update friendship status
      const updatedFriendship = await ctx.db
        .update(friendships)
        .set({
          status: "rejected",
          updatedAt: new Date(),
        })
        .where(eq(friendships.id, input.friendshipId))
        .returning();

      return updatedFriendship[0];
    }),

  // Remove friend
  removeFriend: protectedProcedure
    .input(z.object({ friendshipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.db
        .select()
        .from(friendships)
        .where(
          and(
            eq(friendships.id, input.friendshipId),
            or(
              eq(friendships.senderId, ctx.userId),
              eq(friendships.receiverId, ctx.userId)
            ),
            eq(friendships.status, "accepted")
          )
        )
        .limit(1);

      if (!friendship[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Friendship not found",
        });
      }

      // Delete friendship
      await ctx.db.delete(friendships).where(eq(friendships.id, input.friendshipId));

      // Create notification for the other user
      const otherUserId = friendship[0].senderId === ctx.userId 
        ? friendship[0].receiverId 
        : friendship[0].senderId;

      await ctx.db.insert(notifications).values({
        userId: otherUserId,
        type: "friend_removed",
        fromUserId: ctx.userId,
        metadata: { friendshipId: input.friendshipId },
      });

      return { success: true };
    }),

  // Block user
  blockUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot block yourself",
        });
      }

      // Check if user exists
      const targetUser = await ctx.db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!targetUser[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if friendship exists
      const existingFriendship = await ctx.db
        .select({ id: friendships.id, status: friendships.status })
        .from(friendships)
        .where(
          or(
            and(eq(friendships.senderId, ctx.userId), eq(friendships.receiverId, input.userId)),
            and(eq(friendships.senderId, input.userId), eq(friendships.receiverId, ctx.userId))
          )
        )
        .limit(1);

      if (existingFriendship[0]) {
        // Update existing friendship to blocked
        await ctx.db
          .update(friendships)
          .set({
            status: "blocked",
            updatedAt: new Date(),
          })
          .where(eq(friendships.id, existingFriendship[0].id));
      } else {
        // Create new blocked friendship
        await ctx.db.insert(friendships).values({
          senderId: ctx.userId,
          receiverId: input.userId,
          status: "blocked",
        });
      }

      // Create notification for blocked user
      await ctx.db.insert(notifications).values({
        userId: input.userId,
        type: "blocked_by_other",
        fromUserId: ctx.userId,
      });

      return { success: true };
    }),

  // Unblock user
  unblockUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const friendship = await ctx.db
        .select()
        .from(friendships)
        .where(
          and(
            eq(friendships.senderId, ctx.userId),
            eq(friendships.receiverId, input.userId),
            eq(friendships.status, "blocked")
          )
        )
        .limit(1);

      if (!friendship[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blocked relationship not found",
        });
      }

      // Delete the blocked relationship
      await ctx.db.delete(friendships).where(eq(friendships.id, friendship[0].id));

      // Create notification for unblocked user
      await ctx.db.insert(notifications).values({
        userId: input.userId,
        type: "unblocked_by_other",
        fromUserId: ctx.userId,
      });

      return { success: true };
    }),

  // Get friends list
  getFriends: protectedProcedure.query(async ({ ctx }) => {
    const friends = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        status: user.status,
        customStatus: user.customStatus,
        lastSeenAt: user.lastSeenAt,
        friendshipId: friendships.id,
        friendshipCreatedAt: friendships.createdAt,
      })
      .from(friendships)
      .innerJoin(
        user,
        or(
          and(eq(friendships.senderId, ctx.userId), eq(user.id, friendships.receiverId)),
          and(eq(friendships.receiverId, ctx.userId), eq(user.id, friendships.senderId))
        )
      )
      .where(
        and(
          or(
            eq(friendships.senderId, ctx.userId),
            eq(friendships.receiverId, ctx.userId)
          ),
          eq(friendships.status, "accepted")
        )
      )
      .orderBy(desc(user.lastSeenAt));

    return friends;
  }),

  // Get pending friend requests
  getPendingRequests: protectedProcedure.query(async ({ ctx }) => {
    const pendingRequests = await ctx.db
      .select({
        id: friendships.id,
        senderId: friendships.senderId,
        receiverId: friendships.receiverId,
        createdAt: friendships.createdAt,
        sender: {
          id: user.id,
          name: user.name,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          status: user.status,
        },
      })
      .from(friendships)
      .innerJoin(user, eq(friendships.senderId, user.id))
      .where(
        and(
          eq(friendships.receiverId, ctx.userId),
          eq(friendships.status, "pending")
        )
      )
      .orderBy(desc(friendships.createdAt));

    return pendingRequests;
  }),

  // Get blocked users
  getBlocked: protectedProcedure.query(async ({ ctx }) => {
    const blockedUsers = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        friendshipId: friendships.id,
        blockedAt: friendships.updatedAt,
      })
      .from(friendships)
      .innerJoin(user, eq(friendships.receiverId, user.id))
      .where(
        and(
          eq(friendships.senderId, ctx.userId),
          eq(friendships.status, "blocked")
        )
      )
      .orderBy(desc(friendships.updatedAt));

    return blockedUsers;
  }),
});
