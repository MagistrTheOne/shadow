# Shadow AI - Архитектурная документация

## 📊 **Общий Обзор Проекта**

**Название**: Shadow AI
**Тип**: SaaS-платформа для AI-powered видеоконференций
**Архитектура**: Next.js 15 + React 19 + TypeScript + PostgreSQL
**Статус**: Production-ready с enterprise фичам

---

## 🏗️ **Технологический Стек**

### **Frontend & UI**
| Категория | Технологии |
|-----------|------------|
| **Framework** | Next.js 15, React 19 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4, Radix UI, Shadcn UI |
| **State Management** | React Query (TanStack), Redux Toolkit |
| **Forms** | React Hook Form, Zod validation |
| **Icons** | Lucide React |

### **Backend & API**
| Категория | Технологии |
|-----------|------------|
| **Runtime** | Next.js API Routes, Node.js 18+ |
| **API Layer** | tRPC (type-safe API) |
| **Database** | PostgreSQL (Neon), Drizzle ORM |
| **Authentication** | Better Auth |
| **Background Jobs** | Inngest |
| **Caching** | Next.js ISR, React Query |

### **External Services & Integrations**
| Сервис | Назначение | Integration |
|--------|------------|-------------|
| **Stream.io** | Video calls & real-time chat | SDK integration |
| **GigaChat** | AI chat, summaries, agents | REST API |
| **HeyGen/D-ID** | AI avatars & video generation | SDK integration |
| **Deepgram** | Speech-to-text transcription | WebSocket API |
| **AWS S3** | File storage (recordings, assets) | SDK integration |
| **Polar.sh** | Subscription billing & payments | API + webhooks |
| **Inngest** | Background job processing | Event-driven |

### **Development & Quality**
| Категория | Технологии |
|-----------|------------|
| **Testing** | Jest, React Testing Library |
| **Linting** | ESLint, Prettier |
| **Build** | Turbopack, Webpack |
| **Database** | Drizzle Kit (migrations) |
| **Deployment** | Vercel |

---

## 📁 **Архитектурная Структура**

### **Модульная Архитектура**
| Модуль | Назначение | Ключевые Компоненты |
|--------|------------|---------------------|
| **agents** | Управление AI-агентами | Agent CRUD, Custom instructions, Types |
| **meetings** | Видеоконференции | Video calls, AI avatars, Chat, Participants |
| **auth** | Аутентификация | Sign-in/up, Sessions, OAuth, Security |
| **dashboard** | Главная панель | Navigation, User management, Layout |
| **subscriptions** | Подписки | Pricing tiers, Billing, Limits, Payments |
| **recordings** | Записи встреч | Storage, Playback, Management, AWS S3 |
| **transcripts** | Транскрипция | Speech-to-text, Summaries, AI insights |
| **home** | Лендинг | Marketing pages, Features, Pricing |

### **Папочная Структура**
```
src/
├── app/                    # Next.js App Router (pages & layouts)
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes & external integrations
│   └── company/           # Marketing pages (blog, careers, etc.)
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn UI components (40+ components)
│   ├── landing/          # Landing page sections
│   └── ...               # Feature-specific components
├── modules/               # Feature modules (modular architecture)
│   ├── agents/           # AI agents functionality
│   ├── meetings/         # Video conferencing
│   ├── subscriptions/    # Billing & subscriptions
│   └── ...               # Other features
├── lib/                  # Utilities & configurations
│   ├── auth.ts           # Authentication client
│   ├── stream.ts         # Video streaming config
│   ├── gigachat.ts       # AI service integration
│   └── ...               # Other utilities
├── db/                   # Database schema & connection
├── trpc/                 # tRPC configuration
├── hooks/                # Custom React hooks
└── inngest/              # Background job functions
```

---

## 🎯 **Функциональные Возможности**

### **1. AI-Powered Meetings**
| Фича | Описание | Техническая Реализация |
|------|----------|----------------------|
| **AI Avatars** | Интерактивные аватары HeyGen/D-ID | Web Speech API + AI brain + TTS |
| **Intelligent Agents** | Кастомные AI-агенты для встреч | GigaChat integration + Custom instructions |
| **Real-time Voice** | Голосовое взаимодействие с AI | Deepgram STT + Speech synthesis |
| **Context Awareness** | Понимание контекста встречи | Natural language processing + Memory |

### **2. Video Conferencing Core**
| Фича | Описание | Техническая Реализация |
|------|----------|----------------------|
| **HD Video Calls** | Высококачественное видео до 1080p | Stream.io SDK + WebRTC |
| **Screen Sharing** | Демонстрация экрана | WebRTC screen capture API |
| **Meeting Recording** | Автоматическая запись в облако | AWS S3 + Stream recording API |
| **Participant Management** | Управление участниками | Real-time state sync + Permissions |
| **Noise Cancellation** | Активное шумоподавление | Stream audio processing |

### **3. Communication & Collaboration**
| Фича | Описание | Техническая Реализация |
|------|----------|----------------------|
| **Real-time Chat** | Чат во время встречи | Stream Chat SDK + WebSocket |
| **AI Chat Suggestions** | AI-powered подсказки | Context-aware NLP models |
| **Message Translation** | Автоматический перевод | Multi-language AI models |
| **System Messages** | Автоматические уведомления | Event-driven messaging system |
| **File Sharing** | Обмен файлами | AWS S3 + Real-time sync |

### **4. AI Intelligence Features**
| Фича | Описание | Техническая Реализация |
|------|----------|----------------------|
| **Smart Transcripts** | AI-powered транскрипция | Deepgram + GigaChat post-processing |
| **Meeting Summaries** | Автоматические summaries | NLP + Extractive summarization |
| **Action Items** | Извлечение задач | Named entity recognition + Parsing |
| **Sentiment Analysis** | Анализ настроений | ML sentiment models |
| **Key Points Extraction** | Выделение ключевых моментов | Text analysis + Ranking algorithms |

### **5. Enterprise Features**
| Фича | Описание | Техническая Реализация |
|------|----------|----------------------|
| **User Management** | Управление пользователями | Role-based access control (RBAC) |
| **Subscription Tiers** | Free/Pro/Enterprise планы | Polar.sh billing integration |
| **Usage Limits & Quotas** | Квоты по использованию | Metrics tracking + Rate limiting |
| **Audit Logs** | Журналы действий | Event logging + Compliance |
| **Team Management** | Управление командами | Multi-tenant architecture |
| **API Access** | Программный доступ | REST API + API keys |

---

## 💾 **Модель Данных (PostgreSQL)**

### **Core Entities**
| Entity | Описание | Ключевые Поля | Связи |
|--------|----------|---------------|-------|
| **user** | Пользователи системы | id, email, name, image, emailVerified, createdAt | Primary entity |
| **session** | Активные сессии | id, token, userId, expiresAt, ipAddress, userAgent | → user |
| **account** | OAuth аккаунты | id, providerId, accountId, userId, accessToken | → user |
| **verification** | Email verification | id, identifier, value, expiresAt | Standalone |

### **Business Logic Entities**
| Entity | Описание | Ключевые Поля | Связи |
|--------|----------|---------------|-------|
| **agents** | AI-агенты | id, name, userId, instructions | → user |
| **meetings** | Видеовстречи | id, title, userId, agentId, status, scheduledAt, streamCallId | → user, → agents |
| **meeting_participants** | Участники встреч | id, meetingId, userId, role, joinedAt, leftAt | → meetings, → user |
| **recordings** | Записи встреч | id, meetingId, fileUrl, duration, format, status | → meetings |
| **transcripts** | Транскрипции | id, meetingId, content, language, status | → meetings |
| **transcript_summaries** | Суммаризации | id, transcriptId, summary, keyPoints, actionItems | → transcripts |

### **Monetization & Analytics**
| Entity | Описание | Ключевые Поля | Связи |
|--------|----------|---------------|-------|
| **subscriptions** | Подписки пользователей | id, userId, plan, status, polarSubscriptionId | → user |
| **payments** | История платежей | id, userId, subscriptionId, amount, status, polarPaymentId | → user, → subscriptions |
| **usage_metrics** | Метрики использования | id, userId, meetingId, duration, storageUsed, date | → user, → meetings |
| **chat_messages** | Сообщения чата | id, meetingId, userId, content, messageType, timestamp | → meetings, → user |

### **Database Design Principles**
- **UUID Primary Keys**: Все сущности используют nanoid для генерации ID
- **Foreign Key Constraints**: Каскадное удаление для поддержания целостности
- **Indexes**: Оптимизированные индексы для частых запросов
- **Timestamps**: Автоматические createdAt/updatedAt поля
- **Enums**: Строгие типы для status полей
- **JSONB Fields**: Гибкое хранение метаданных (keyPoints, actionItems)

---

## 🔌 **API Architecture**

### **Internal API (tRPC)**
| Module | Procedures | Methods |
|--------|------------|---------|
| **agents** | create, update, delete, get, list | Query + Mutation |
| **meetings** | create, update, delete, join, leave, getParticipants | Query + Mutation |
| **auth** | signIn, signUp, signOut, getSession | Query + Mutation |
| **recordings** | upload, download, delete, getStatus | Query + Mutation |
| **transcripts** | process, getSummary, export | Query + Mutation |
| **subscriptions** | getPlan, upgrade, cancel, getUsage | Query + Mutation |

### **External API Endpoints**
| Endpoint | Method | Purpose | Integration |
|----------|--------|---------|-------------|
| `/api/auth/*` | GET/POST | Authentication | Better Auth |
| `/api/stream/token` | POST | Video call tokens | Stream.io |
| `/api/ai/chat` | POST | AI conversations | GigaChat |
| `/api/webhooks/polar` | POST | Payment webhooks | Polar.sh |
| `/api/webhooks/sber` | POST | Payment webhooks | SberPay |

### **Real-time Communication**
| Feature | Protocol | Implementation |
|---------|----------|----------------|
| **Video Calls** | WebRTC | Stream.io SDK |
| **Chat Messages** | WebSocket | Stream Chat |
| **AI Voice** | WebRTC + WebSocket | Deepgram + HeyGen |
| **Live Transcription** | WebSocket | Deepgram API |

---

## 🎨 **UI/UX Architecture**

### **Design System**
| Component Type | Library | Count | Features |
|---------------|---------|-------|----------|
| **Base Components** | Shadcn UI | 40+ | Button, Input, Card, Dialog, etc. |
| **Primitives** | Radix UI | 20+ | Accessible, unstyled components |
| **Icons** | Lucide React | 1000+ | Consistent iconography |
| **Charts** | Recharts | 15+ | Data visualization |

### **Key UI Components**
| Компонент | Назначение | Особенности |
|-----------|------------|-------------|
| **VideoCall** | Основной компонент видео | Stream SDK, controls, layout |
| **AIAvatarController** | Управление AI-аватарами | Speech recognition, TTS, states |
| **MeetingChat** | Чат интерфейс | Real-time messaging, AI suggestions |
| **AgentForm** | Форма создания агентов | Validation, instructions editor |
| **PricingCard** | Карточки тарифов | Subscription management, features |
| **DashboardSidebar** | Навигация | Responsive, role-based menus |
| **LoadingState** | Loading UI | Skeleton loaders, progress bars |

### **Theming & Styling**
- **Dark Theme**: Glass morphism design
- **Color Palette**: Consistent brand colors
- **Typography**: System fonts + custom scales
- **Spacing**: Tailwind spacing scale
- **Responsive**: Mobile-first approach

---

## 🚀 **Deployment & Production**

### **Infrastructure Stack**
| Component | Provider | Purpose |
|-----------|----------|---------|
| **Frontend/API** | Vercel | Hosting, CDN, serverless functions |
| **Database** | Neon | PostgreSQL, connection pooling |
| **File Storage** | AWS S3 | Recordings, assets, backups |
| **Video Processing** | Stream.io | Real-time video infrastructure |
| **AI Services** | Multiple | GigaChat, HeyGen, Deepgram |
| **Background Jobs** | Inngest | Event processing, queues |

### **Production Configuration**
| Aspect | Implementation |
|--------|----------------|
| **Environment** | Multi-env (dev/staging/prod) |
| **Secrets** | Vercel env vars, AWS Secrets |
| **Monitoring** | Vercel Analytics, custom logging |
| **Caching** | Next.js ISR, Redis (future) |
| **Backups** | Database snapshots, S3 versioning |
| **Security** | HTTPS, CORS, rate limiting |

### **Performance Optimizations**
- **Code Splitting**: Dynamic imports, route-based splitting
- **Image Optimization**: Next.js Image component, WebP format
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: ISR, revalidate, React Query caching
- **CDN**: Vercel edge network, global distribution

---

## 💰 **Business Model & Monetization**

### **Subscription Tiers**
| Plan | Price | Monthly Limits | Features |
|------|-------|----------------|----------|
| **Free** | $0 | 5 meetings, 1GB storage, 10K words | Basic video calls, AI chat |
| **Pro** | $29 | Unlimited meetings, 100GB storage | Full AI features, recordings |
| **Enterprise** | Custom | Unlimited everything | White-label, API access |

### **Revenue Streams**
| Stream | Implementation | Volume |
|--------|----------------|--------|
| **Subscriptions** | Polar.sh integration | Recurring monthly |
| **Add-ons** | Additional storage, features | One-time purchases |
| **Enterprise** | Custom contracts | Annual licensing |
| **API Usage** | Pay-per-use for API calls | Metered billing |

### **Usage Tracking**
| Metric | Tracking Method | Billing Impact |
|--------|-----------------|----------------|
| **Meeting Duration** | Stream.io webhooks | Pro tier limits |
| **Storage Used** | S3 usage metrics | Storage quotas |
| **Transcript Words** | Deepgram API | Word count limits |
| **AI API Calls** | Service-specific metering | Rate limiting |

---

## 🔒 **Security & Compliance**

### **Authentication & Authorization**
| Feature | Implementation |
|---------|----------------|
| **Multi-provider Auth** | GitHub, Google, Email/Password |
| **Session Management** | Secure HTTP-only cookies |
| **Role-based Access** | User roles (host, guest, admin) |
| **API Security** | JWT tokens, API keys |

### **Data Protection**
| Aspect | Implementation |
|--------|----------------|
| **Encryption** | End-to-end for video/audio |
| **Data Privacy** | GDPR compliance |
| **Audit Logging** | Full activity tracking |
| **Secure Storage** | Encrypted S3 buckets |

---

## 📈 **Scalability & Performance**

### **Current Architecture Benefits**
- **Serverless**: Auto-scaling via Vercel
- **CDN**: Global content delivery
- **Database**: Connection pooling, read replicas
- **Caching**: Multiple levels (browser, CDN, server)

### **Future Scaling Considerations**
- **Microservices**: Service decomposition
- **Global Replication**: Multi-region deployment
- **Advanced Caching**: Redis clusters
- **Load Balancing**: Advanced routing rules

---

## 🧪 **Quality Assurance**

### **Testing Strategy**
| Type | Tools | Coverage |
|------|-------|----------|
| **Unit Tests** | Jest + RTL | Components, utilities |
| **Integration Tests** | Jest + MSW | API interactions |
| **E2E Tests** | Playwright (future) | User flows |
| **Performance Tests** | Lighthouse, WebPageTest | Core Web Vitals |

### **Code Quality**
| Tool | Purpose | Configuration |
|------|---------|---------------|
| **ESLint** | Code linting | Next.js + TypeScript rules |
| **Prettier** | Code formatting | Consistent formatting |
| **TypeScript** | Type checking | Strict mode enabled |
| **Husky** | Git hooks | Pre-commit quality checks |

---

## 🔄 **Development Workflow**

### **Branching Strategy**
```
main (production)
├── develop (staging)
│   ├── feature/ai-avatars
│   ├── feature/recording-enhancements
│   └── bugfix/chat-performance
```

### **CI/CD Pipeline**
| Stage | Tools | Purpose |
|-------|-------|---------|
| **Lint** | ESLint | Code quality checks |
| **Test** | Jest | Unit & integration tests |
| **Build** | Next.js | Production build |
| **Deploy** | Vercel | Automatic deployments |

---

## 📚 **API Documentation**

### **Public API (Future)**
- RESTful endpoints for integrations
- Webhook system for events
- SDK for major platforms
- OpenAPI specification

### **Internal API**
- tRPC procedures documentation
- Type definitions export
- Integration guides
- Rate limiting policies

 

*Документ поддерживается командой разработки Shadow AI. Последнее обновление: October 2025*
