import { db } from "@/db";
import { agents } from "@/db/schema";
import { agentsInsertSchema } from "@/modules/schemas";
import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/trpc/init";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export const agentsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(
          and(
            eq(agents.id, input.id),
            eq(agents.userId, ctx.auth.user.id)
          )
        );
      return existingAgent;
    }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const data = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.auth.user.id));

    return data;
  }),

  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      // Check subscription limits
      const { checkAgentLimit } = await import("@/lib/subscription-limits");
      const limitCheck = await checkAgentLimit(ctx.auth.user.id);

      if (!limitCheck.canCreate) {
        throw new Error(`Agent limit reached. You can create ${limitCheck.limit} agents. Current: ${limitCheck.current}`);
      }

      const [createdAgent] = await db
        .insert(agents)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

      return createdAgent;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, "Name is required").optional(),
      instructions: z.string().min(1, "Instructions are required").optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      const [updatedAgent] = await db
        .update(agents)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(agents.id, id),
            eq(agents.userId, ctx.auth.user.id)
          )
        )
        .returning();

      return updatedAgent;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(agents)
        .where(
          and(
            eq(agents.id, input.id),
            eq(agents.userId, ctx.auth.user.id)
          )
        );

      return { success: true };
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Получаем оригинального агента
      const [originalAgent] = await db
        .select()
        .from(agents)
        .where(
          and(
            eq(agents.id, input.id),
            eq(agents.userId, ctx.auth.user.id)
          )
        )
        .limit(1);

      if (!originalAgent) {
        throw new Error("Agent not found");
      }

      // Создаем дубликат с новым ID и названием
      const [duplicatedAgent] = await db
        .insert(agents)
        .values({
          name: `${originalAgent.name} (Copy)`,
          instructions: originalAgent.instructions,
          userId: ctx.auth.user.id,
        })
        .returning();

      return duplicatedAgent;
    }),
});
