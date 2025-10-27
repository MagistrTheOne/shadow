import { db } from "@/db";
import { agents } from "@/db/schema";
import { agentsInsertSchema } from "@/modules/schemas";
import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/trpc/init";
import { eq } from "drizzle-orm";
import { z } from "zod";

// getMany
// TODO: Change `getOne` to use protectedProcedure

export const agentsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [existingAgent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, input.id)); // ✅ fixed Input.id → input.id
      return existingAgent;
    }),

  // TODO: Change `getMany` to use protectedProcedure
  getMany: baseProcedure.query(async () => {
    const data = await db
      .select()
      .from(agents);

    return data;
  }),

  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdAgent] = await db
        .insert(agents)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();

      return createdAgent;
    }),
});
