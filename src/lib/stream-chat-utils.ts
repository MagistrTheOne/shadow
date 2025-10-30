/**
 * Stream Chat utility functions
 * Согласно документации: https://getstream.io/chat/docs/sdk/react/
 */

import { StreamChat } from 'stream-chat';

/**
 * Get or create Stream Chat client instance
 * Stream Chat SDK использует singleton pattern через getInstance
 */
export function getStreamChatClient(apiKey: string): StreamChat {
  return StreamChat.getInstance(apiKey);
}

/**
 * Create a channel configuration according to Stream Chat best practices
 */
export interface ChannelConfig {
  name?: string;
  members?: string[];
  image?: string;
  extraData?: Record<string, any>;
}

/**
 * Create a messaging channel for a meeting/call
 * Согласно документации, канал создаётся через client.channel()
 */
export function createMeetingChannel(
  client: StreamChat,
  channelId: string,
  config: ChannelConfig = {}
) {
  return client.channel('messaging', channelId, {
    members: config.members || [],
    ...config.extraData,
  });
}

/**
 * Initialize channel and watch it (required by Stream Chat SDK)
 * После создания канала обязательно нужно вызвать watch() для подписки на обновления
 */
export async function initializeChannel(channel: ReturnType<typeof createMeetingChannel>) {
  // Проверяем, существует ли канал
  // Если канал новый, watch() создаст его и подключится, иначе подключится к существующему
  const state = await channel.watch();
  return state;
}

