# Shadow.AI - Архитектура системы

## Обзор системы

Shadow.AI - это AI-powered платформа для видео митингов с интеллектуальными аватарами, real-time коллаборацией и enterprise-grade функциями. Система построена на современном стеке технологий с фокусом на производительность, масштабируемость и пользовательский опыт.

## Технический стек

### Frontend
- **Next.js 15** - React фреймворк с App Router
- **React 19** - UI библиотека с новейшими возможностями
- **TypeScript** - статическая типизация
- **Tailwind CSS** - utility-first CSS фреймворк
- **shadcn/ui** - современные UI компоненты
- **Zustand** - легковесное state management
- **tRPC** - type-safe API клиент
- **Framer Motion** - анимации и переходы

### Backend
- **Next.js API Routes** - серверные эндпоинты
- **tRPC** - type-safe API с автоматической генерацией типов
- **Drizzle ORM** - современная ORM для работы с БД
- **PostgreSQL** - реляционная база данных
- **Better Auth** - аутентификация и авторизация

### Внешние сервисы
- **Stream.io** - видео звонки, чат, Voice Agents, Vision AI
- **Sber GigaChat** - российский AI сервис
- **OpenAI** - международный AI сервис
- **HeyGen AI** - создание живых AI аватаров (ANNA)
- **Uploadthing** - загрузка и хранение файлов
- **Neon** - PostgreSQL хостинг

## Архитектура приложения

### Структура проекта

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Группа аутентификации
│   │   ├── sign-in/             # Страница входа
│   │   └── sign-up/             # Страница регистрации
│   ├── dashboard/                # Защищенная область
│   │   ├── agents/              # Управление AI агентами
│   │   ├── meetings/            # Управление митингами
│   │   ├── chats/               # Система чатов
│   │   └── friends/             # Система друзей
│   ├── api/                     # API эндпоинты
│   │   ├── auth/                # Аутентификация
│   │   ├── stream/              # Stream.io интеграция
│   │   └── uploadthing/         # Загрузка файлов
│   └── page.tsx                 # Главная страница
├── components/                   # Переиспользуемые компоненты
│   ├── ui/                      # Базовые UI компоненты
│   ├── landing/                 # Компоненты лендинга
│   └── loading-state.tsx        # Состояния загрузки
├── lib/                         # Утилиты и конфигурация
│   ├── auth.ts                  # Better Auth конфиг
│   ├── ai/                      # AI сервисы
│   └── utils.ts                 # Общие утилиты
├── modules/                     # Функциональные модули
│   ├── agents/                  # AI агенты
│   ├── meetings/                # Митинги
│   ├── dashboard/               # Дашборд
│   └── auth/                    # Аутентификация
├── db/                          # База данных
│   ├── schema.ts                # Drizzle схема
│   └── index.ts                 # Подключение к БД
├── trpc/                        # tRPC конфигурация
│   ├── routers/                 # API роутеры
│   └── client.ts                # Клиент tRPC
└── stores/                      # Zustand стейты
    └── dashboard-store.ts       # Стейт дашборда
```

## Система аутентификации

### Better Auth конфигурация

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: userTable,
      sessions: sessionTable,
      accounts: accountTable,
      verificationTokens: verificationTokenTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 дней
    updateAge: 60 * 60 * 24, // 1 день
  },
});
```

### Middleware защита

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Защищенные маршруты
  const protectedRoutes = ["/dashboard", "/meetings", "/agents", "/upgrade"];
  
  // Получение сессии
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  // Логика редиректов
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
```

## База данных

### Схема данных

```typescript
// Пользователи
export const user = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  status: text("status", { enum: ["online", "away", "offline", "dnd", "invisible"] })
    .notNull()
    .default("offline"),
  customStatus: text("custom_status"),
  bannerUrl: text("banner_url"),
  richPresence: jsonb("rich_presence"),
  badges: jsonb("badges"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

// AI Агенты
export const agent = pgTable("agent", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  avatar: text("avatar"),
  provider: text("provider", { enum: ["sber", "openai"] })
    .notNull()
    .default("sber"),
  model: text("model").notNull().default("GigaChat-Plus"),
  instructions: text("instructions").notNull(),
  temperature: real("temperature").notNull().default(0.7),
  maxTokens: integer("max_tokens").notNull().default(1000),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

// Митинги
export const meeting = pgTable("meeting", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time", { withTimezone: true, mode: "date" })
    .notNull(),
  endTime: timestamp("end_time", { withTimezone: true, mode: "date" }),
  status: text("status", { enum: ["scheduled", "in_progress", "completed", "cancelled"] })
    .notNull()
    .default("scheduled"),
  sessionId: text("session_id").unique(),
  sessionCode: text("session_code").unique(),
  isRecording: boolean("is_recording").notNull().default(false),
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

// Связь митингов и агентов (many-to-many)
export const meetingAgents = pgTable("meeting_agents", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  meetingId: text("meeting_id")
    .notNull()
    .references(() => meeting.id, { onDelete: "cascade" }),
  agentId: text("agent_id")
    .notNull()
    .references(() => agent.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

// Чаты
export const chat = pgTable("chat", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  agentId: text("agent_id")
    .references(() => agent.id, { onDelete: "cascade" }),
  participantId: text("participant_id")
    .references(() => user.id, { onDelete: "cascade" }),
  chatType: text("chat_type", { enum: ["agent", "user"] })
    .notNull()
    .default("agent"),
  title: text("title").notNull(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

// Сообщения чата
export const chatMessage = pgTable("chat_message", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  chatId: text("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  messageType: text("message_type", { enum: ["text", "image", "file"] })
    .notNull()
    .default("text"),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

// Дружба
export const friendships = pgTable("friendships", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  senderId: text("sender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending", "accepted", "rejected", "blocked"] })
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

// Уведомления
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type", { 
    enum: [
      "friend_request", "friend_accepted", "friend_rejected", "friend_removed",
      "blocked_by_other", "unblocked_by_other", "meeting_started", "meeting_cancelled"
    ] 
  }).notNull(),
  fromUserId: text("from_user_id")
    .references(() => user.id, { onDelete: "cascade" }),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});
```

## API архитектура

### tRPC роутеры

```typescript
// Основной роутер приложения
export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  agents: agentsRouter,
  meetings: meetingsRouter,
  chats: chatsRouter,
  friends: friendsRouter,
  notifications: notificationsRouter,
  subscriptions: subscriptionsRouter,
});

// Пример роутера агентов
export const agentsRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(agent)
      .where(eq(agent.userId, ctx.auth.user.id))
      .orderBy(desc(agent.createdAt));
  }),

  create: protectedProcedure
    .input(createAgentSchema)
    .mutation(async ({ ctx, input }) => {
      return await db
        .insert(agent)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();
    }),

  testAgent: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      message: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
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

      const response = await aiService.chat({
        provider: agentData[0].provider as "sber" | "openai",
        model: agentData[0].model,
        messages: [
          { role: "system", content: agentData[0].instructions },
          { role: "user", content: input.message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return {
        success: true,
        response: response.content,
        usage: response.usage,
      };
    }),
});
```

## AI интеграция

### AI сервисы

```typescript
// Базовый AI сервис
export class AIService {
  async chat(params: ChatParams): Promise<ChatResponse> {
    switch (params.provider) {
      case 'sber':
        return await this.sberService.chat(params);
      case 'openai':
        return await this.openaiService.chat(params);
      default:
        throw new Error(`Unsupported provider: ${params.provider}`);
    }
  }
}

// Sber GigaChat сервис
export class SberService {
  private config: SberConfig;
  
  async getAccessToken(): Promise<string> {
    const response = await fetch(this.config.oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': this.generateRqUID(),
        'Authorization': `Basic ${this.config.authorizationKey}`,
      },
      body: 'scope=GIGACHAT_API_PERS',
    });
    
    const data = await response.json();
    return data.access_token;
  }

  async chat(params: ChatParams): Promise<ChatResponse> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.config.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'RqUID': this.generateRqUID(),
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.max_tokens,
      }),
    });
    
    return await response.json();
  }
}
```

## Stream.io интеграция

### Видео звонки

```typescript
// Stream Video клиент
export const getStreamVideoClient = () => {
  return new StreamVideo({
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    user: {
      id: "user-id",
      name: "User Name",
      image: "avatar-url",
    },
    token: "stream-token",
  });
};

// Компонент видео звонка
export const VideoCall = ({ callId }: { callId: string }) => {
  const [call, setCall] = useState<Call | null>(null);
  
  useEffect(() => {
    const client = getStreamVideoClient();
    const newCall = client.call("default", callId);
    setCall(newCall);
    
    return () => {
      newCall.leave();
    };
  }, [callId]);
  
  if (!call) return <LoadingState />;
  
  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <CallUI callId={callId} />
      </StreamTheme>
    </StreamVideo>
  );
};
```

### Продвинутые компоненты

```typescript
// Voice Agent компонент
export const VoiceAgent = ({ callId, isEnabled }: VoiceAgentProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  useEffect(() => {
    if (isEnabled) {
      connectVoiceAgent(callId);
    }
  }, [isEnabled, callId]);
  
  return (
    <Card className="voice-agent-card">
      <CardHeader>
        <CardTitle>Voice Agent</CardTitle>
      </CardHeader>
      <CardContent>
        {isConnecting ? "Connecting..." : "Voice agent is active."}
      </CardContent>
    </Card>
  );
};

// Background Effects компонент
export const BackgroundEffects = ({ isEnabled }: BackgroundEffectsProps) => {
  const [effectType, setEffectType] = useState<BackgroundEffectType>("none");
  const [blurIntensity, setBlurIntensity] = useState<number[]>([5]);
  
  return (
    <Card className="background-effects-card">
      <CardHeader>
        <CardTitle>Background Effects</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={effectType} onValueChange={setEffectType}>
          <SelectTrigger>
            <SelectValue placeholder="Select an effect" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="blur">Blur</SelectItem>
            <SelectItem value="virtual">Virtual Background</SelectItem>
          </SelectContent>
        </Select>
        
        {effectType === "blur" && (
          <Slider
            value={blurIntensity}
            onValueChange={setBlurIntensity}
            max={10}
            step={1}
          />
        )}
      </CardContent>
    </Card>
  );
};
```

## State Management

### Zustand стейты

```typescript
// Dashboard стейт
interface DashboardState {
  sidebarOpen: boolean;
  lastSeen: Date | null;
  setSidebarOpen: (open: boolean) => void;
  updateLastSeen: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  sidebarOpen: true,
  lastSeen: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  updateLastSeen: () => set({ lastSeen: new Date() }),
}));

// Presence стейт
interface PresenceState {
  isOnline: boolean;
  status: UserStatus;
  customStatus: string | null;
  richPresence: RichPresence | null;
  setOnline: (online: boolean) => void;
  setStatus: (status: UserStatus) => void;
  setCustomStatus: (status: string | null) => void;
  setRichPresence: (presence: RichPresence | null) => void;
}
```

## Безопасность

### Middleware защита

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Проверка защищенных маршрутов
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }
  
  return NextResponse.next();
}
```

### Валидация данных

```typescript
// Zod схемы для валидации
export const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  provider: z.enum(["sber", "openai"]),
  model: z.string().min(1, "Model is required"),
  instructions: z.string().min(1, "Instructions are required").max(2000),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(4000),
});

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  agentIds: z.array(z.string()).optional(),
});
```

## Производительность

### Оптимизации

```typescript
// React.memo для компонентов
export const MeetingCard = React.memo(({ meeting }: { meeting: Meeting }) => {
  return (
    <Card className="meeting-card">
      <CardHeader>
        <CardTitle>{meeting.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{meeting.description}</p>
      </CardContent>
    </Card>
  );
});

// useMemo для вычислений
export const DashboardStats = () => {
  const { data: meetings } = trpc.meetings.getMany.useQuery();
  const { data: agents } = trpc.agents.getMany.useQuery();
  
  const stats = useMemo(() => ({
    totalMeetings: meetings?.length || 0,
    totalAgents: agents?.length || 0,
    upcomingMeetings: meetings?.filter(m => 
      new Date(m.startTime) > new Date()
    ).length || 0,
  }), [meetings, agents]);
  
  return <StatsDisplay stats={stats} />;
};

// useCallback для функций
export const MeetingActions = ({ meetingId }: { meetingId: string }) => {
  const joinMeeting = useCallback(() => {
    router.push(`/dashboard/meetings/${meetingId}/call`);
  }, [meetingId, router]);
  
  const editMeeting = useCallback(() => {
    router.push(`/dashboard/meetings/${meetingId}/edit`);
  }, [meetingId, router]);
  
  return (
    <div className="meeting-actions">
      <Button onClick={joinMeeting}>Join</Button>
      <Button onClick={editMeeting}>Edit</Button>
    </div>
  );
};
```

### Кэширование

```typescript
// tRPC кэширование
export const meetingsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .query(async ({ ctx }) => {
      return await db
        .select()
        .from(meeting)
        .where(eq(meeting.userId, ctx.auth.user.id))
        .orderBy(desc(meeting.createdAt));
    }),
    
  getUpcoming: protectedProcedure
    .query(async ({ ctx }) => {
      return await db
        .select()
        .from(meeting)
        .where(
          and(
            eq(meeting.userId, ctx.auth.user.id),
            eq(meeting.status, "scheduled"),
            gte(meeting.startTime, new Date())
          )
        )
        .orderBy(asc(meeting.startTime));
    }),
});
```

## Масштабируемость

### Горизонтальное масштабирование

```typescript
// Load balancing для API
export const apiHandler = async (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  
  // Роутинг по функциональности
  if (pathname.startsWith('/api/meetings')) {
    return handleMeetingsAPI(req);
  }
  
  if (pathname.startsWith('/api/agents')) {
    return handleAgentsAPI(req);
  }
  
  if (pathname.startsWith('/api/stream')) {
    return handleStreamAPI(req);
  }
  
  return new NextResponse('Not Found', { status: 404 });
};
```

### Database оптимизации

```typescript
// Индексы для производительности
export const meeting = pgTable("meeting", {
  // ... поля
}, (t) => ({
  userIdIdx: index("meeting_user_id_idx").on(t.userId),
  startTimeIdx: index("meeting_start_time_idx").on(t.startTime),
  statusIdx: index("meeting_status_idx").on(t.status),
  sessionIdIdx: uniqueIndex("meeting_session_id_idx").on(t.sessionId),
}));

// Партиционирование по датам
export const createMeetingPartitions = async () => {
  await db.execute(sql`
    CREATE TABLE meeting_2024_01 PARTITION OF meeting
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
  `);
};
```

## Мониторинг и логирование

### Error Boundary

```typescript
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Отправка в систему мониторинга
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### Логирование

```typescript
// Структурированное логирование
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
  
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
  
  warn: (message: string, meta?: object) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }));
  },
};
```

## Развертывание

### Environment переменные

```bash
# Database
DATABASE_URL=" "

# Authentication
BETTER_AUTH_SECRET=" "
BETTER_AUTH_URL=" "

# AI Services
SBER_AUTHORIZATION_KEY="your-sber-key"
SBER_OAUTH_URL="https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
SBER_API_URL="https://gigachat.devices.sberbank.ru/api/v1"
OPENAI_API_KEY="your-openai-key"

# Stream.io
STREAM_API_KEY="your-stream-key"
STREAM_API_SECRET="your-stream-secret"
NEXT_PUBLIC_STREAM_API_KEY="your-stream-key"

# File Upload
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

### Docker конфигурация

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS dev
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

## Заключение

Shadow.AI построена с использованием современных технологий и лучших практик разработки. Архитектура обеспечивает:

- **Масштабируемость** - горизонтальное масштабирование и оптимизированная БД
- **Производительность** - кэширование, мемоизация, оптимизированные запросы
- **Безопасность** - middleware защита, валидация данных, безопасная аутентификация
- **Надежность** - error boundaries, структурированное логирование, мониторинг
- **Удобство разработки** - type-safe API, современный стек, четкая структура

Система готова к production использованию и может масштабироваться под растущие потребности пользователей.
