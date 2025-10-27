# Nocturide IDE — План реализации MVP

## Архитектура решения

**Stack**: Next.js 16 (App Router) + React 19.2 + TypeScript + Tailwind CSS 4 + shadcn/ui + Monaco Editor + Better Auth + PostgreSQL + Prisma + xterm.js

**Ключевые изменения Next.js 16** (по данным https://nextjs.org/blog):

- Turbopack как дефолтный бундлер (стабильный)
- Асинхронные params в route handlers (breaking change)
- Cache Components с `use cache` directive
- React 19.2 с View Transitions
- Улучшенная производительность роутинга

## Фаза 1: MVP — Core IDE (Landing + Auth + Editor + FileSystem)

### 1.1 Настройка инфраструктуры

**База данных (PostgreSQL + Prisma)**

- Установка: `prisma`, `@prisma/client`, `better-auth`
- Схема Prisma:
  - `User` (id, email, name, avatar, createdAt)
  - `Session` (связь с Better Auth)
  - `Project` (id, name, userId, createdAt, updatedAt, isPublic)
  - `File` (id, projectId, path, content, language, updatedAt)

**Better Auth конфигурация**

- Email magic link + GitHub OAuth
- Session middleware для защиты `/workspace/*`
- Файлы: `lib/auth.ts`, `app/api/auth/[...all]/route.ts`

**Next.js 16 конфигурация**

- Включить Turbopack: `next.config.ts` → `turbo: { enabled: true }`
- Настроить async params в API routes
- Добавить middleware для auth проверки

### 1.2 Landing Page (`app/page.tsx`)

**Дизайн**: Dark neutral (zinc-900/950) + glassmorphism + responsive grid

**Компоненты**:

- Hero секция с gradient background
- Prompt input (textarea) в стиле Bolt.new — крупный, с автофокусом
- Кнопка "Build" (primary action) → создаёт проект, редиректит на `/workspace/[id]`
- Footer с лого "MagistrTheOne © 2025"

**Логика**:

- API route `POST /api/projects/create` → создаёт Project, возвращает `{ projectId }`
- Redirect на `/workspace/[projectId]`

**Файлы**:

- `app/page.tsx` (landing UI)
- `components/landing/prompt-input.tsx` (textarea + кнопка)
- `components/landing/hero-section.tsx` (секция с описанием)

### 1.3 Authentication (`app/auth/*`)

**Роуты**:

- `/auth/signin` — форма email magic link / GitHub OAuth
- `/auth/callback` — обработка OAuth callback
- `/auth/verify` — верификация magic link

**Компоненты**:

- `components/auth/signin-form.tsx` — форма с shadcn/ui Input + Button
- Использовать `Dialog` для модального окна (как альтернатива отдельной странице)

**Middleware**:

- `middleware.ts` → защита `/workspace/*`, проверка сессии через Better Auth

**Файлы**:

- `lib/auth.ts` (Better Auth конфиг)
- `app/api/auth/[...all]/route.ts` (Better Auth handler)
- `middleware.ts` (проверка аутентификации)

### 1.4 IDE Workspace (`app/workspace/[projectId]/page.tsx`)

**Layout структура** (используя `react-resizable-panels`):

```
┌─────────────────────────────────────────┐
│           Navigation Bar                │ ← 60px высота
├──────────┬──────────────────┬───────────┤
│          │                  │           │
│  Left    │   Monaco Editor  │  Right    │
│ Sidebar  │     (центр)      │ Sidebar   │
│  (240px) │                  │  (320px)  │
│          │                  │  (AI)     │
├──────────┴──────────────────┴───────────┤
│           Terminal (xterm.js)           │ ← 200px высота
└─────────────────────────────────────────┘
```

**Компоненты**:

**Navigation Bar** (`components/ide/navigation-bar.tsx`):

- Лого + название проекта
- Кнопки: Save, Run, Settings
- User dropdown (аватар, logout)
- Использовать `Menubar` из shadcn/ui

**Left Sidebar** (`components/ide/left-sidebar.tsx`):

- File Tree (рекурсивный компонент)
- Tabs: Files, Projects, History
- Accordion для секций
- Context menu на правый клик (Rename, Delete, New File)

**Monaco Editor** (`components/ide/monaco-editor.tsx`):

- `@monaco-editor/react` wrapper
- Темы: настроить dark neutral тему (zinc-900 background)
- Auto-save через debounce (1s) → `PUT /api/files/[id]`
- Multi-tab support (открытые файлы)

**Right Sidebar** (`components/ide/ai-sidebar.tsx`):

- Placeholder для фазы 2 (AI чат)
- Пока показываем: "AI Assistant (coming soon)"
- Skeleton UI с glassmorphism card

**Terminal** (`components/ide/terminal.tsx`):

- Placeholder для фазы 3
- Пока показываем: статичный вывод логов в `ScrollArea`

**Файлы**:

- `app/workspace/[projectId]/page.tsx` (главный layout IDE)
- `components/ide/navigation-bar.tsx`
- `components/ide/left-sidebar.tsx`
- `components/ide/file-tree.tsx`
- `components/ide/monaco-editor.tsx`
- `components/ide/ai-sidebar.tsx`
- `components/ide/terminal.tsx`

### 1.5 API Routes для FileSystem

**Endpoints**:

`GET /api/projects/[projectId]` — получить проект + список файлов

`POST /api/projects/create` — создать новый проект

`DELETE /api/projects/[projectId]` — удалить проект

`GET /api/files?projectId=X` — список файлов проекта

`GET /api/files/[id]` — содержимое файла

`POST /api/files` — создать файл

`PUT /api/files/[id]` — обновить содержимое

`DELETE /api/files/[id]` — удалить файл

**Важно**: Next.js 16 требует async params — все `params` теперь Promise!

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  // ...
}
```

**Файлы**:

- `app/api/projects/route.ts`
- `app/api/projects/[projectId]/route.ts`
- `app/api/files/route.ts`
- `app/api/files/[id]/route.ts`

### 1.6 Стилизация (Dark Neutral + Glassmorphism)

**Tailwind CSS конфиг**:

- Кастомная тема: neutral (zinc) как primary
- CSS переменные для glassmorphism:
  ```css
  .glass {
    background: rgba(24, 24, 27, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(63, 63, 70, 0.4);
  }
  ```


**Компоненты**:

- Обернуть все карточки/сайдбары в glass эффект
- Subtle shadows (zinc-900/20)
- Hover states с transition-all

**Responsive**:

- Mobile: скрыть сайдбары, показать drawer menu
- Tablet: collapsible sidebars
- Desktop: полный layout

**Файлы**:

- `app/globals.css` (добавить glass класс)
- Обновить shadcn/ui компоненты (Card, Dialog, etc) с glass эффектом

---

## Фаза 2: AI Integration (GigaChat)

### 2.1 GigaChat API интеграция

**Backend**:

- `lib/gigachat.ts` — SDK wrapper для GigaChat API
- Streaming responses через Server-Sent Events
- `POST /api/ai/chat` — проксирует запросы к GigaChat

**AI Sidebar** (обновление `components/ide/ai-sidebar.tsx`):

- Chat UI: messages list + input
- Message bubbles (user/assistant)
- Markdown rendering для ответов AI
- Streaming indicator (typing animation)

### 2.2 Monaco Editor интеграция

**Command Palette** (Monaco API):

- Регистрация команд:
  - "Explain this code" → отправляет selection в AI
  - "Refactor selection" → AI предлагает улучшения
  - "Generate JSDoc" → добавляет документацию
  - "Fix errors" → AI анализирует проблемы

**Context Actions**:

- Right-click на selection → контекстное меню с AI командами
- Результаты вставляются как diff или применяются автоматически

**Файлы**:

- `lib/gigachat.ts`
- `app/api/ai/chat/route.ts`
- `components/ide/ai-sidebar.tsx` (полная реализация)
- `components/ide/ai-message.tsx`
- `lib/monaco-ai-commands.ts` (регистрация команд)

---

## Фаза 3: Terminal + Code Execution

### 3.1 Интерактивный терминал

**Frontend**:

- `xterm.js` + `xterm-addon-fit` + `xterm-addon-web-links`
- WebSocket подключение к `/api/terminal/ws`

**Backend**:

- WebSocket handler: `app/api/terminal/ws/route.ts`
- `child_process.spawn` для bash/node/python
- Отправка stdin/stdout через WebSocket
- Sandboxing: ограничить доступ к файловой системе (только project directory)

**Безопасность**:

- Разрешённые команды: `npm`, `node`, `python`, `ls`, `cat`, `cd`
- Блокировать: `rm -rf`, `sudo`, системные команды
- Timeout для долгих процессов (30s)

**Файлы**:

- `components/ide/terminal.tsx` (xterm.js компонент)
- `app/api/terminal/ws/route.ts` (WebSocket handler)
- `lib/terminal-executor.ts` (spawn logic)

### 3.2 Code Execution (Run кнопка)

**Flow**:

1. User нажимает "Run" в Navigation Bar
2. Определяем entry point (package.json script или main файл)
3. Запускаем через terminal executor
4. Output в terminal panel

**Файлы**:

- `lib/code-runner.ts` (логика запуска по типу проекта)
- Обновить `components/ide/navigation-bar.tsx` (кнопка Run)

---

## Технические детали

### TypeScript строгая типизация

- Все API responses типизированы
- Prisma types экспортируются и переиспользуются
- Zod схемы для валидации API requests

### Обработка ошибок

- Error boundaries на уровне workspace
- Toast notifications (Sonner) для ошибок API
- Fallback UI для сбоев Monaco Editor

### Performance

- React.memo для Monaco Editor wrapper
- Debounce для auto-save (1000ms)
- Lazy load для AI sidebar (dynamic import)
- Virtualized file tree для больших проектов

### Accessibility

- Keyboard shortcuts (Cmd+S для save, Cmd+P для command palette)
- ARIA labels для всех интерактивных элементов
- Focus management в модалках/диалогах

---

## Структура файлов (финальная)

```
nocturide/
├── app/
│   ├── page.tsx (Landing)
│   ├── layout.tsx
│   ├── globals.css
│   ├── auth/
│   │   ├── signin/page.tsx
│   │   └── callback/route.ts
│   ├── workspace/
│   │   └── [projectId]/page.tsx (IDE)
│   └── api/
│       ├── auth/[...all]/route.ts
│       ├── projects/
│       ├── files/
│       ├── ai/chat/route.ts
│       └── terminal/ws/route.ts
├── components/
│   ├── landing/ (PromptInput, HeroSection)
│   ├── auth/ (SignInForm)
│   ├── ide/ (NavigationBar, LeftSidebar, RightSidebar, MonacoEditor, Terminal, FileTree)
│   └── ui/ (shadcn components)
├── lib/
│   ├── auth.ts (Better Auth)
│   ├── prisma.ts (Prisma client)
│   ├── gigachat.ts (AI SDK)
│   ├── terminal-executor.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
└── middleware.ts
```