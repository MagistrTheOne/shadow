import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

// WebSocket server для real-time функций
let wss: WebSocketServer | null = null;

export async function GET(request: NextRequest) {
  if (!wss) {
    // Создаем WebSocket server только один раз
    wss = new WebSocketServer({ 
      port: 8080,
      path: '/ws'
    });

    wss.on('connection', (ws, req: IncomingMessage) => {
      console.log('New WebSocket connection');
      
      // Отправляем приветственное сообщение
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to real-time updates'
      }));

      // Обработка сообщений от клиента
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          handleWebSocketMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Обработка отключения
      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });

      // Обработка ошибок
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  return new Response('WebSocket server running', { status: 200 });
}

function handleWebSocketMessage(ws: any, message: any) {
  switch (message.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;
    
    case 'subscribe':
      // Подписка на обновления
      ws.send(JSON.stringify({
        type: 'subscribed',
        channel: message.channel
      }));
      break;
    
    case 'unsubscribe':
      // Отписка от обновлений
      ws.send(JSON.stringify({
        type: 'unsubscribed',
        channel: message.channel
      }));
      break;
    
    default:
      console.log('Unknown message type:', message.type);
  }
}

// Функция для отправки уведомлений всем подключенным клиентам
export function broadcastToAll(message: any) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

// Функция для отправки уведомления конкретному пользователю
export function sendToUser(userId: string, message: any) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN && (client as any).userId === userId) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
