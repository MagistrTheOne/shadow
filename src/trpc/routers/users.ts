import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../init";
import { user, friendships } from "@/db/schema";

export const usersRouter = createTRPCRouter({
  // Get user profile by ID
  getProfile: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          status: user.status,
          customStatus: user.customStatus,
          bannerUrl: user.bannerUrl,
          badges: user.badges,
          lastSeenAt: user.lastSeenAt,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!profile[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return profile[0];
    }),

  // Update own profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        username: z.string().min(3).max(20).optional(),
        displayName: z.string().max(50).optional(),
        bio: z.string().max(500).optional(),
        customStatus: z.string().max(100).optional(),
        avatarUrl: z.string().url().optional(),
        bannerUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if username is unique (if provided)
      if (input.username) {
        const existingUser = await ctx.db
          .select({ id: user.id })
          .from(user)
          .where(and(eq(user.username, input.username), eq(user.id, ctx.userId)))
          .limit(1);

        if (existingUser[0] && existingUser[0].id !== ctx.userId) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already taken",
          });
        }
      }

      const updatedUser = await ctx.db
        .update(user)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.userId))
        .returning({
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          customStatus: user.customStatus,
          bannerUrl: user.bannerUrl,
        });

      return updatedUser[0];
    }),

  // Update user status and rich presence
  updateStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(["online", "dnd", "away", "offline", "invisible"]),
        richPresence: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db
        .update(user)
        .set({
          status: input.status,
          richPresence: input.richPresence || null,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.userId))
        .returning({
          id: user.id,
          status: user.status,
          richPresence: user.richPresence,
          lastSeenAt: user.lastSeenAt,
        });

      return updatedUser[0];
    }),

  // Search users by query (username, email, displayName, or ID)
  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const searchTerm = `%${input.query}%`;

      const users = await ctx.db
        .select({
          id: user.id,
          name: user.name,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          status: user.status,
          customStatus: user.customStatus,
          badges: user.badges,
          lastSeenAt: user.lastSeenAt,
        })
        .from(user)
        .where(
          and(
            // Exclude current user
            eq(user.id, ctx.userId),
            // Search by username, email, displayName, or exact ID match
            or(
              ilike(user.username, searchTerm),
              ilike(user.email, searchTerm),
              ilike(user.displayName, searchTerm),
              eq(user.id, input.query) // Direct ID search
            )
          )
        )
        .orderBy(desc(user.lastSeenAt))
        .limit(input.limit);

      return users;
    }),

  // Get current user's profile
  getCurrentProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        status: user.status,
        customStatus: user.customStatus,
        bannerUrl: user.bannerUrl,
        badges: user.badges,
        lastSeenAt: user.lastSeenAt,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, ctx.userId))
      .limit(1);

    return profile[0];
  }),

  // Check if username is available
  checkUsername: protectedProcedure
    .input(z.object({ username: z.string().min(3).max(20) }))
    .query(async ({ ctx, input }) => {
      const existingUser = await ctx.db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.username, input.username))
        .limit(1);

      return {
        available: !existingUser[0] || existingUser[0].id === ctx.userId,
      };
    }),
});
