import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../init";
import { chat, chatMessage, agent, user, friendships } from "@/db/schema";
import { eq, and, desc, asc, or, ne } from "drizzle-orm";
import { db } from "@/db";
import { aiService } from "@/lib/ai/ai-service";
import { nanoid } from "nanoid";

export const chatsRouter = createTRPCRouter({
  // Получить все чаты пользователя
  getMany: protectedProcedure.query(async ({ ctx }) => {
    // Получаем чаты с агентами
    const agentChats = await db
      .select({
        id: chat.id,
        title: chat.title,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        chatType: chat.chatType,
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          avatar: agent.avatar,
          provider: agent.provider,
          model: agent.model,
        },
        participant: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      })
      .from(chat)
      .leftJoin(agent, eq(chat.agentId, agent.id))
      .where(and(eq(chat.userId, ctx.auth.user.id), eq(chat.chatType, "agent")))
      .orderBy(desc(chat.lastMessageAt), desc(chat.createdAt));

    // Получаем чаты с пользователями
    const userChats = await db
      .select({
        id: chat.id,
        title: chat.title,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        chatType: chat.chatType,
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          avatar: agent.avatar,
          provider: agent.provider,
          model: agent.model,
        },
        participant: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      })
      .from(chat)
      .leftJoin(user, eq(chat.participantId, user.id))
      .where(and(eq(chat.userId, ctx.auth.user.id), eq(chat.chatType, "user")))
      .orderBy(desc(chat.lastMessageAt), desc(chat.createdAt));

    // Объединяем и сортируем все чаты
    const allChats = [...agentChats, ...userChats].sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt;
      const bTime = b.lastMessageAt || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return allChats;
  }),

  // Получить один чат с сообщениями
  getOne: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Получаем чат
      const chatData = await db
        .select({
          id: chat.id,
          title: chat.title,
          lastMessageAt: chat.lastMessageAt,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          agent: {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            avatar: agent.avatar,
            provider: agent.provider,
            model: agent.model,
            instructions: agent.instructions,
            personality: agent.personality,
            capabilities: agent.capabilities,
          },
        })
        .from(chat)
        .innerJoin(agent, eq(chat.agentId, agent.id))
        .where(and(eq(chat.id, input.chatId), eq(chat.userId, ctx.auth.user.id)))
        .limit(1);

      if (!chatData.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      // Получаем сообщения
      const messages = await db
        .select()
        .from(chatMessage)
        .where(eq(chatMessage.chatId, input.chatId))
        .orderBy(asc(chatMessage.createdAt));

      return {
        ...chatData[0],
        messages,
      };
    }),

  // Создать новый чат с агентом
  create: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что агент существует
      const agentData = await db
        .select()
        .from(agent)
        .where(and(eq(agent.id, input.agentId), eq(agent.userId, ctx.auth.user.id)))
        .limit(1);

      if (!agentData.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      // Проверяем, не существует ли уже чат с этим агентом
      const existingChat = await db
        .select()
        .from(chat)
        .where(and(eq(chat.userId, ctx.auth.user.id), eq(chat.agentId, input.agentId)))
        .limit(1);

      if (existingChat.length) {
        return existingChat[0];
      }

      // Создаем новый чат
      const newChat = await db
        .insert(chat)
        .values({
          userId: ctx.auth.user.id,
          agentId: input.agentId,
          title: `Chat with ${agentData[0].name}`,
        })
        .returning();

      return newChat[0];
    }),

  // Отправить сообщение в чат
  sendMessage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        content: z.string().min(1, "Message cannot be empty"),
        messageType: z.enum(["text", "image", "file", "system"]).default("text"),
        metadata: z
          .object({
            fileUrl: z.string().optional(),
            fileName: z.string().optional(),
            fileSize: z.number().optional(),
            imageUrl: z.string().optional(),
            imageWidth: z.number().optional(),
            imageHeight: z.number().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что чат существует и принадлежит пользователю
      const chatData = await db
        .select({
          id: chat.id,
          agentId: chat.agentId,
          agent: {
            id: agent.id,
            name: agent.name,
            provider: agent.provider,
            model: agent.model,
            instructions: agent.instructions,
            personality: agent.personality,
          },
        })
        .from(chat)
        .innerJoin(agent, eq(chat.agentId, agent.id))
        .where(and(eq(chat.id, input.chatId), eq(chat.userId, ctx.auth.user.id)))
        .limit(1);

      if (!chatData.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      // Создаем сообщение пользователя
      const userMessage = await db
        .insert(chatMessage)
        .values({
          chatId: input.chatId,
          senderId: ctx.auth.user.id,
          content: input.content,
          messageType: input.messageType,
          metadata: input.metadata,
          isRead: true,
        })
        .returning();

      // Обновляем время последнего сообщения в чате
      await db
        .update(chat)
        .set({
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(chat.id, input.chatId));

      // Если это текстовое сообщение, генерируем ответ от агента
      if (input.messageType === "text") {
        try {
          // Формируем контекст для AI
          const recentMessages = await db
            .select({
              content: chatMessage.content,
              senderId: chatMessage.senderId,
              createdAt: chatMessage.createdAt,
            })
            .from(chatMessage)
            .where(eq(chatMessage.chatId, input.chatId))
            .orderBy(desc(chatMessage.createdAt))
            .limit(10);

          // Формируем сообщения для AI (последние 10 сообщений в обратном порядке)
          const aiMessages = recentMessages
            .reverse()
            .map((msg) => ({
              role: msg.senderId === ctx.auth.user.id ? "user" as const : "assistant" as const,
              content: msg.content,
            }));

          // Добавляем системное сообщение с инструкциями агента
          const systemMessage = {
            role: "system" as const,
            content: chatData[0].agent.instructions,
          };

          // Добавляем информацию о личности если есть
          let personalityPrompt = "";
          if (chatData[0].agent.personality) {
            personalityPrompt = `Ты - ${chatData[0].agent.name}. 
            Тон: ${chatData[0].agent.personality.tone || 'professional'}
            Стиль общения: ${chatData[0].agent.personality.communication_style || 'Clear and concise'}
            ${chatData[0].agent.personality.expertise && chatData[0].agent.personality.expertise.length > 0 
              ? `Экспертиза: ${chatData[0].agent.personality.expertise.join(', ')}` 
              : ''}`;
          }

          const messages = [
            {
              ...systemMessage,
              content: personalityPrompt ? `${personalityPrompt}\n\n${systemMessage.content}` : systemMessage.content,
            },
            ...aiMessages,
          ];

          // Вызываем AI сервис
          const response = await aiService.chat({
            provider: chatData[0].agent.provider as "sber" | "openai",
            model: chatData[0].agent.model,
            messages,
            temperature: 0.7,
            max_tokens: 1000,
          });

          // Создаем сообщение от агента
          const agentMessage = await db
            .insert(chatMessage)
            .values({
              chatId: input.chatId,
              senderId: ctx.auth.user.id, // В реальности это должен быть ID агента, но пока используем userId
              content: response.content,
              messageType: "text",
              isRead: false,
            })
            .returning();

          // Обновляем время последнего сообщения еще раз
          await db
            .update(chat)
            .set({
              lastMessageAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(chat.id, input.chatId));

          return {
            userMessage: userMessage[0],
            agentMessage: agentMessage[0],
          };
        } catch (error) {
          console.error("Error generating agent response:", error);
          // Возвращаем только сообщение пользователя, если AI не сработал
          return {
            userMessage: userMessage[0],
            agentMessage: null,
          };
        }
      }

      return {
        userMessage: userMessage[0],
        agentMessage: null,
      };
    }),

  // Удалить чат
  delete: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что чат принадлежит пользователю
      const chatData = await db
        .select()
        .from(chat)
        .where(and(eq(chat.id, input.chatId), eq(chat.userId, ctx.auth.user.id)))
        .limit(1);

      if (!chatData.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      // Удаляем чат (сообщения удалятся каскадно)
      await db.delete(chat).where(eq(chat.id, input.chatId));

      return { success: true };
    }),

  // Отметить сообщения как прочитанные
  markAsRead: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(chatMessage)
        .set({ isRead: true })
        .where(
          and(
            eq(chatMessage.chatId, input.chatId),
            eq(chatMessage.senderId, ctx.auth.user.id) // Только сообщения от агента
          )
        );

      return { success: true };
    }),

  // Создать чат с пользователем
  createUserChat: protectedProcedure
    .input(z.object({ participantId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { participantId } = input;

      // Проверяем, что пользователь не пытается создать чат с самим собой
      if (participantId === ctx.auth.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot create chat with yourself",
        });
      }

      // Проверяем, что участник существует
      const participant = await db
        .select()
        .from(user)
        .where(eq(user.id, participantId))
        .limit(1);

      if (!participant.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Participant not found",
        });
      }

      // Проверяем, существует ли уже чат между этими пользователями
      const existingChat = await db
        .select()
        .from(chat)
        .where(
          and(
            eq(chat.userId, ctx.auth.user.id),
            eq(chat.participantId, participantId),
            eq(chat.chatType, "user")
          )
        )
        .limit(1);

      if (existingChat.length > 0) {
        return existingChat[0];
      }

      // Создаем новый чат
      const newChat = await db
        .insert(chat)
        .values({
          id: nanoid(),
          userId: ctx.auth.user.id,
          participantId,
          chatType: "user",
          title: `Chat with ${participant[0].name}`,
          lastMessageAt: new Date(),
        })
        .returning();

      return newChat[0];
    }),

  // Поиск пользователей для создания чата
  searchUsers: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { query } = input;

      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        })
        .from(user)
        .where(
          and(
            or(
              eq(user.name, query),
              eq(user.email, query),
              eq(user.id, query)
            ),
            // Исключаем текущего пользователя
            // @ts-ignore
            ne(user.id, ctx.auth.user.id)
          )
        )
        .limit(10);

      return users;
    }),

  // Получить друзей пользователя
  getFriends: protectedProcedure.query(async ({ ctx }) => {
    const friends = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        friendshipId: friendships.id,
        friendshipStatus: friendships.status,
      })
      .from(friendships)
      .leftJoin(user, eq(friendships.receiverId, user.id))
      .where(
        and(
          eq(friendships.senderId, ctx.auth.user.id),
          eq(friendships.status, "accepted")
        )
      );

    return friends;
  }),

  // Отправить запрос в друзья
  sendFriendRequest: protectedProcedure
    .input(z.object({ receiverId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { receiverId } = input;

      // Проверяем, что пользователь не пытается добавить в друзья самого себя
      if (receiverId === ctx.auth.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot add yourself as a friend",
        });
      }

      // Проверяем, существует ли уже запрос
      const existingRequest = await db
        .select()
        .from(friendships)
        .where(
          and(
            eq(friendships.senderId, ctx.auth.user.id),
            eq(friendships.receiverId, receiverId)
          )
        )
        .limit(1);

      if (existingRequest.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Friend request already exists",
        });
      }

      // Создаем запрос в друзья
      const newRequest = await db
        .insert(friendships)
        .values({
          id: nanoid(),
          senderId: ctx.auth.user.id,
          receiverId,
          status: "pending",
        })
        .returning();

      return newRequest[0];
    }),
});
