import { createTRPCRouter, protectedProcedure } from "../init";
import { z } from "zod";

export const streamRouter = createTRPCRouter({
  // Возвращает подписанный Stream user token для текущего пользователя
  getUserToken: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.auth.user.id;
      if (!process.env.NEXT_PUBLIC_STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
        throw new Error("Stream credentials are not configured");
      }
      // Ленивая загрузка SDK, чтобы не утяжелять edge
      const { StreamChat } = await import("stream-chat");
      const serverClient = StreamChat.getInstance(
        process.env.NEXT_PUBLIC_STREAM_API_KEY,
        process.env.STREAM_API_SECRET
      );
      const token = serverClient.createToken(userId);
      return { token } as const;
    }),
});


