# 🏗️ **Shadow.AI - Архитектура Flow После Аутентификации**

## 🔐 **Фаза 1: Аутентификация & Авторизация**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Landing Page  │───▶│  Sign In/Up     │───▶│  Auth Success   │
│   (/)           │    │  (/sign-in/up)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Middleware     │    │ Better Auth     │    │  Session Token  │
│  Protection     │    │  (GitHub/Google)│    │  + User Data    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🚪 **Фаза 2: Вход в Dashboard (Middleware Gateway)**

```
┌─────────────────┐
│  Authenticated  │
│   User Request  │
│                 │
│ Headers:        │
│ - Authorization │
│ - Cookies       │
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   Middleware    │───▶│   Validate      │
│   Check         │    │   Session       │
│                 │    │                 │
│ 1. Parse Token  │    │ • JWT Verify    │
│ 2. Check DB     │    │ • User Status   │
│ 3. Route Access │    │ • Permissions   │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Dashboard Layout│
│ (/dashboard)    │
└─────────────────┘
```

---

## 🏠 **Фаза 3: Dashboard Home (Главный Хаб)**

```
┌─────────────────┐
│  Dashboard      │◄─────────────────┐
│  Layout         │                  │
│                 │                  │
│ • Sidebar Nav   │                  │
│ • Breadcrumbs   │                  │
│ • User Button   │                  │
└─────────────────┘                  │
         │                           │
         ▼                           │
┌─────────────────┐    ┌─────────────┴─────────────┐
│ Dashboard Home  │    │     Quick Actions         │
│ (/dashboard)    │    │                           │
│                 │    │ • New Meeting             │
│ Stats Overview: │    │ • Start Video Call        │
│ • Upcoming Mtgs │    │ • Join by Code            │
│ • AI Agents     │    │ • Start Chat              │
│ • Recent Mtgs   │    │                           │
│ • Online Friends│    │                           │
└─────────────────┘    └───────────────────────────┘
```

---

## 🔄 **Фаза 4: Основные Модули (Core Features)**

```
┌─────────────────┐
│  Dashboard Hub  │
└─────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│Meetings │ │ Agents  │
│(/meetings)│ │(/agents)│
└─────────┘ └─────────┘
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│ Create  │ │ Create  │
│ Meeting │ │ Agent   │
└─────────┘ └─────────┘
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│ Join    │ │ Edit    │
│ Call    │ │ Config  │
└─────────┘ └─────────┘
```

---

## 📹 **Фаза 5: Meeting Flow (Видео Конференции)**

```
┌─────────────────┐
│  Meeting Room   │
│  (/meeting/id)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│ Stream Video    │    │   UI Controls   │
│ Client Init     │    │                 │
│                 │    │ • Call Controls │
│ • API Key       │    │ • Participants  │
│ • User Token    │    │ • Chat          │
│ • Call ID       │    │ • Recording     │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  Video Stream   │    │   AI Features   │
│  (WebRTC)       │    │                 │
│                 │    │ • ANNA Avatar   │
│ • Audio/Video   │    │ • Transcription │
│ • Screen Share  │    │ • Moderation    │
│ • Recording     │    │ • Voice Agent   │
└─────────────────┘    └─────────────────┘
```

---

## 🤖 **Фаза 6: ANNA AI Assistant Flow**

```
┌─────────────────┐
│  ANNA Page      │
│  (/anna)        │
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chat Mode     │    │   Video Mode    │    │  Settings Mode  │
│                 │    │                 │    │                 │
│ • GigaChat API  │    │ • HeyGen API    │    │ • Personality    │
│ • Context       │    │ • Avatar Video  │    │ • Language       │
│ • History       │    │ • Voice Agent   │    │ • Prompts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Response   │    │   Video Gen     │    │   Config Save   │
│   Processing    │    │   Processing    │    │   Processing    │
│                 │    │                 │    │                 │
│ • Token Gen     │    │ • HeyGen API    │    │ • DB Update     │
│ • OpenAI/Sber   │    │ • Video Render  │    │ • Cache Clear   │
│ • Emotion Anlz  │    │ • Status Poll   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔄 **Фаза 7: API & Data Flow**

```
┌─────────────────┐
│   User Action   │
│   (UI Event)    │
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   tRPC Client   │───▶│   API Route     │
│   (Frontend)    │    │   (/api/trpc)   │
│                 │    │                 │
│ • Query/Mutation│    │ • Validation    │
│ • Optimistic UI │    │ • Auth Check    │
│ • Error Handling│    │ • DB Operation  │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   External API  │
│   (PostgreSQL)  │    │                 │
│                 │    │ • Stream Video  │
│ • Users         │    │ • HeyGen        │
│ • Meetings      │    │ • GigaChat      │
│ • Agents        │    │ • Deepgram      │
│ • Chats         │    │ • Uploadthing   │
└─────────────────┘    └─────────────────┘
```

---

## 📊 **Фаза 8: Background Processing (Inngest)**

```
┌─────────────────┐
│   Meeting End   │
│   Event Trigger │
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   Inngest       │───▶│   Process       │
│   Function      │    │   Recording     │
│                 │    │                 │
│ • Event Queue   │    │ • Deepgram API  │
│ • Retry Logic   │    │ • Transcript    │
│ • Error Handle  │    │ • Status Update │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   Generate      │───▶│   AI Summary    │
│   Transcript    │    │   Processing    │
│                 │    │                 │
│ • Word Count    │    │ • GigaChat API  │
│ • Language      │    │ • Key Points    │
│ • Save to DB    │    │ • Action Items  │
└─────────────────┘    └─────────────────┘
```

---

## 🎯 **Фаза 9: Subscription & Limits Flow**

```
┌─────────────────┐
│   User Action   │
│   (Create Agent)│
└─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   Check Limits  │───▶│   Subscription  │
│   Service       │    │   Validation    │
│                 │    │                 │
│ • User ID       │    │ • Plan Check    │
│ • Feature Type  │    │ • Usage Count   │
│ • Current Usage │    │ • Limits Apply  │
└─────────────────┘    └─────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│  Allow   │ │  Deny   │
│  Action  │ │  Action │
│          │ │          │
│ • Proceed │ │ • Error  │
│ • DB Save │ │ • Upgrade │
│ • Success │ │ • Message │
└─────────┘ └─────────┘
```

---

## 🌐 **Общий Архитектурный Flow**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │    │   Backend   │    │  External  │
│  (Next.js)  │    │   (API)     │    │   APIs     │
│             │    │             │    │            │
│ • Dashboard │    │ • tRPC      │    │ • Stream   │
│ • Meetings  │    │ • Auth      │    │ • HeyGen   │
│ • Agents    │    │ • Database  │    │ • GigaChat │
│ • ANNA      │    │ • Inngest   │    │ • Polar    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
              ┌────────────┴────────────┐
              │     Database Layer      │
              │     (PostgreSQL)        │
              │                         │
              │ • Users & Sessions      │
              │ • Meetings & Agents     │
              │ • Chats & Transcripts   │
              │ • Usage & Subscriptions │
              └─────────────────────────┘
```

---

## 🎯 **Ключевые Архитектурные Принципы**

### 🔐 **Security First**
- **Middleware Protection** - Все dashboard маршруты защищены
- **Token-based Auth** - JWT сессии с проверкой в БД
- **API Validation** - Zod схемы для всех входных данных
- **Rate Limiting** - Защита от злоупотреблений

### 🎨 **User Experience**
- **Progressive Disclosure** - Функции раскрываются постепенно
- **Optimistic UI** - Немедленная обратная связь
- **Error Boundaries** - Graceful error handling
- **Loading States** - Плавные переходы и ожидания

### 🚀 **Performance**
- **Code Splitting** - Динамические импорты
- **Lazy Loading** - Компоненты загружаются по требованию
- **Caching** - Redis для сессий, CDN для статических файлов
- **Background Jobs** - Inngest для тяжелых операций

### 🤖 **AI Integration**
- **ANNA as Core** - AI-ассистент интегрирован во все модули
- **Multi-Provider** - GigaChat + OpenAI fallback
- **Context Aware** - AI понимает контекст встречи/агента
- **Real-time** - WebSocket для мгновенных ответов

### 📊 **Scalability**
- **Horizontal Scaling** - Stateless API design
- **Database Sharding** - Подготовка к росту данных
- **CDN Distribution** - Global edge network через Stream
- **Microservices Ready** - Модульная архитектура

---

## 🗂️ **Технический Стек**

### **Frontend**
- **Next.js 15** - App Router, SSR/SSG
- **React 19** - Concurrent features
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Lucide Icons** - Icon system

### **Backend**
- **Next.js API Routes** - Serverless functions
- **tRPC** - Type-safe API layer
- **Drizzle ORM** - Database toolkit
- **PostgreSQL** - Primary database
- **Redis** - Caching & sessions

### **External Services**
- **Stream Video** - Real-time communication
- **HeyGen** - AI avatars & video generation
- **GigaChat (Sber)** - Primary AI model
- **Deepgram** - Speech-to-text
- **Uploadthing** - File storage
- **Polar** - Subscription management

### **DevOps & Tools**
- **Inngest** - Background job processing
- **Better Auth** - Authentication
- **Jest** - Testing framework
- **ESLint/Prettier** - Code quality
- **Docker** - Containerization

---

## 🚀 **User Journey Flow**

```
1. Landing → Sign In/Up → Auth Success
   ↓
2. Middleware Check → Dashboard Layout
   ↓
3. Dashboard Home → Quick Actions → Feature Selection
   ↓
4. Module Entry (Meetings/Agents/Chats/ANNA)
   ↓
5. Create/Edit/Join Actions
   ↓
6. Real-time Experience (Video/Chat/AI)
   ↓
7. Background Processing (Recording/Transcription/Summary)
   ↓
8. Completion & Analytics
```

**🎯 Mission Accomplished:** Shadow.AI delivers enterprise-grade AI-powered meeting experiences with seamless user flows, robust security, and scalable architecture.
