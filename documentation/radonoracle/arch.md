# Radon Web+AI Browser - План разработки MVP

## Архитектурные решения

### Backend (Rust + Tauri 2.0)

- **WebView Engine**: Tauri WebView2 (Chromium на Windows) с child webviews для tabs
- **IPC Bridge**: Двусторонняя связь Next.js ↔ Rust для AI запросов, навигации, DOM extraction
- **GigaChat Integration**: Прямая интеграция через reqwest (async HTTP client)
- **Tab Management**: Rust-управляемые WebView instances с state sync

### Frontend (Next.js 16)

- **Router**: App Router с proxy.ts (вместо middleware.ts)
- **Bundler**: Turbopack (default в Next 16)
- **UI**: shadcn/ui компоненты + TailwindCSS
- **Theme**: Deep Dark + glass-morphism (без градиентов)
- **State**: React Context + IPC sync для tabs/AI

### AI Integration

- **API**: GigaChat через Rust backend
- **Context Pipeline**: DOM text extraction → IPC → Rust → GigaChat → streaming response
- **Sidebar**: React компонент с real-time AI chat

## Структура проекта

```
radon-browser/
├── radonweb/ (Next.js 16 frontend - уже существует)
│   ├── app/
│   │   ├── layout.tsx (root layout + glass theme)
│   │   ├── page.tsx (main browser UI)
│   │   ├── proxy.ts (NEW - network boundary)
│   │   └── components/
│   │       ├── browser/
│   │       │   ├── TabStrip.tsx
│   │       │   ├── AddressBar.tsx
│   │       │   ├── CommandBar.tsx
│   │       │   └── WebViewContainer.tsx
│   │       ├── ai/
│   │       │   ├── AISidebar.tsx
│   │       │   ├── ChatInterface.tsx
│   │       │   └── ContextActions.tsx
│   │       └── settings/
│   │           └── SettingsPanel.tsx
│   ├── lib/
│   │   ├── tauri-commands.ts (IPC wrappers)
│   │   └── browser-state.ts (tab state management)
│   └── styles/
│       └── glass-theme.css
│
└── src-tauri/ (NEW - Rust backend)
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── src/
    │   ├── main.rs (entry point)
    │   ├── commands/
    │   │   ├── mod.rs
    │   │   ├── browser.rs (tab mgmt, navigation)
    │   │   ├── ai.rs (GigaChat integration)
    │   │   └── dom.rs (content extraction)
    │   ├── state/
    │   │   └── app_state.rs (global app state)
    │   └── utils/
    │       └── gigachat_client.rs (HTTP client)
    └── build.rs
```

## Этапы реализации

### Phase 1: Tauri Scaffold + Next.js Integration

**Цель**: Базовая структура Tauri + работающий Next.js 16 frontend

**Действия**:

1. Инициализация Tauri проекта в корне `D:\Cursor2`
2. Конфигурация `tauri.conf.json` для работы с Next.js
3. Создание `src-tauri/` структуры
4. Базовый `main.rs` с window setup
5. Обновление `radonweb/package.json` для Tauri команд
6. Тестирование запуска `npm run tauri dev`

**Файлы**:

- `src-tauri/Cargo.toml` (зависимости: tauri, tokio, reqwest, serde)
- `src-tauri/tauri.conf.json`
- `src-tauri/src/main.rs`
- `radonweb/package.json` (добавить tauri CLI)

---

### Phase 2: Multi-Tab Architecture (Child WebViews)

**Цель**: Полнофункциональная система вкладок

**Rust Backend**:

- `commands/browser.rs`: 
  - `create_tab(url: String) -> TabId`
  - `close_tab(tab_id: TabId)`
  - `navigate_tab(tab_id: TabId, url: String)`
  - `get_tab_metadata(tab_id: TabId) -> TabMetadata`
- State management для активных WebView instances
- Child WebView creation через Tauri API

**Next.js Frontend**:

- `components/browser/TabStrip.tsx`: визуальные вкладки + hover preview
- `components/browser/WebViewContainer.tsx`: контейнер для активного WebView
- `lib/browser-state.ts`: React Context для синхронизации tabs
- `lib/tauri-commands.ts`: TypeScript wrappers для IPC calls

**UI**: Glass-morphism tabs, Chromium-style design

---

### Phase 3: GigaChat AI Integration

**Цель**: Полноценный AI ассистент без заглушек

**Rust Backend**:

- `utils/gigachat_client.rs`:
  - Struct `GigaChatClient` с auth токеном
  - `async fn send_message(prompt: String, context: String) -> Result<String>`
  - Streaming response support
- `commands/ai.rs`:
  - `ai_chat(message: String, page_context: String) -> Stream<String>`
  - `extract_page_context(tab_id: TabId) -> String`
- `commands/dom.rs`:
  - DOM text extraction через Tauri WebView eval

**Next.js Frontend**:

- `components/ai/AISidebar.tsx`: chat UI (shadcn Dialog/Sheet)
- `components/ai/ChatInterface.tsx`: message list + input
- `components/ai/ContextActions.tsx`: "Summarize", "Explain", "Find" buttons
- Real-time streaming через IPC events

**GigaChat API Configuration**:

- **Client ID**: `0199824b-4c1e-7ef1-b423-bb3156ddecee`
- **Client Secret**: `46991ceb-e831-4b1a-b63a-25d18a37d5c7`
- **Authorization Key** (Base64 encoded): `MDE5OTgyNGItNGMxZS03ZWYxLWI0MjMtYmIzMTU2ZGRlY2VlOjQ2OTkxY2ViLWU4MzEtNGIxYS1iNjNhLTI1ZDE4YTM3ZDVjNw==`
- **Scope**: `GIGACHAT_API_PERS` (для физических лиц)
- **OAuth URL**: `https://ngw.devices.sberbank.ru:9443/api/v2/oauth`
- **API Base URL**: `https://gigachat.devices.sberbank.ru/api/v1`
- **Token TTL**: 30 минут (auto-refresh в Rust client)
- **Model**: `GigaChat` (default balanced mode)

**Implementation Details**:

- Rust HTTP client с `reqwest` + TLS cert bypass для Sber
- Access Token кэширование с автоматическим обновлением
- OAuth flow: `POST /oauth` → Bearer token → `POST /chat/completions`
- Streaming поддержка через Server-Sent Events (SSE)
- Context injection: извлечение DOM text (до 3000 символов) как system message

---

### Phase 4: Browser UI Components

**Цель**: Chromium-grade интерфейс с Deep Dark glass theme

**Components** (все через shadcn/ui):

- `CommandBar.tsx`: Command palette (cmdk) + voice trigger
- `AddressBar.tsx`: URL input + search (Input component)
- Navigation controls (Button components)
- `SettingsPanel.tsx`: AI permissions, privacy (Sheet/Dialog)
- Status bar: network indicators (Badge components)

**Styling**:

- `styles/glass-theme.css`:
  - CSS variables для Deep Dark neutral palette
  - Glass-morphism: `backdrop-filter: blur()`, semi-transparent backgrounds
  - NO gradients, NO complex shapes
  - Responsive breakpoints для mobile

**Theme**:

- Base: shadcn neutral dark theme
- Overlay: glass effect с `backdrop-blur-md`
- Text: high contrast для читаемости

---

### Phase 5: Navigation & State Sync

**Цель**: Seamless UX с синхронизацией состояния

**Features**:

- Address bar → IPC → Rust → WebView navigation
- Back/Forward history через Tauri WebView API
- Tab title/favicon updates → IPC events → React state
- Keyboard shortcuts (Ctrl+T, Ctrl+W, etc.)
- Prefetch на hover (optional)

**Implementation**:

- Event listeners в Rust для WebView events
- IPC event emitters для state updates
- React effects для UI updates

---

### Phase 6: Voice Input Integration

**Цель**: Voice search и commands

**Approach**:

- **Web Speech API** (primary): `navigator.mediaDevices.getUserMedia` + speech recognition
- **Whisper API** (fallback): через Rust если нужна более точная транскрипция

**UI**:

- Microphone button в CommandBar
- Visual indicator при записи
- Transcribed text → AddressBar или AI chat

**Integration**:

- Voice → text → либо navigation, либо AI command

---

### Phase 7: Polish & Optimization

**Цель**: Production-ready performance

**Tasks**:

- Lazy loading для AI sidebar
- WebView memory management (close inactive tabs)
- CSS animations для transitions (CSS-based, НЕ JS)
- Error boundaries в React
- Rust error handling и logging
- Build optimization (Tauri bundle size)

**Testing**:

- Cross-platform testing (Windows primary)
- Performance profiling
- Memory leak detection

---

## Next.js 16 Specific Changes

### proxy.ts вместо middleware.ts

```typescript
// radonweb/app/proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  // Network boundary logic
  // Redirect, rewrite, но НЕ response body generation
  return NextResponse.next();
}
```

### Cache Components (опционально для статики)

```typescript
// Для статических assets
export const dynamic = 'force-static';
```

### Turbopack

- Автоматически используется в dev mode
- Если нужны webpack plugins → `next dev --webpack`

---

## Технические детали

### Зависимости Rust (Cargo.toml)

```toml
[dependencies]
tauri = { version = "2.0", features = ["shell-open", "window-all", "webview-all"] }
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.12", features = ["json", "stream"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

### Зависимости Next.js (package.json)

```json
{
  "scripts": {
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0"
  }
}
```

### IPC Commands Pattern

```rust
// Rust
#[tauri::command]
async fn create_tab(url: String, state: State<AppState>) -> Result<TabId, String> {
  // Implementation
}
```
```typescript
// TypeScript
import { invoke } from '@tauri-apps/api/core';

export async function createTab(url: string): Promise<string> {
  return await invoke('create_tab', { url });
}
```

---

## Критические требования

1. ✅ Без заглушек - только production-ready код
2. ✅ GigaChat API - полная интеграция с предоставленными креденшалами
3. ✅ Next.js 16 - учёт proxy.ts, Turbopack, Cache Components
4. ✅ Tauri 2.0 - child WebViews для multi-tab
5. ✅ shadcn/ui only - NO кастомных компонентов
6. ✅ Deep Dark glass theme - NO градиенты
7. ✅ Responsive + mobile support
8. ✅ Performance - легковесность, быстрый старт
9. ✅ БД позже - пока IndexedDB для временного хранения

---

## Definition of Done

- [ ] Tauri app запускается и рендерит Next.js UI
- [ ] Можно открыть несколько вкладок с разными URL
- [ ] GigaChat отвечает в AI sidebar с контекстом страницы
- [ ] Glass theme применён ко всем компонентам
- [ ] Voice input работает (Web Speech API)
- [ ] Адаптивная вёрстка на разных разрешениях
- [ ] Build создаёт standalone `.exe` (Windows)
- cd radonweb (использовать для установок зависимостей)