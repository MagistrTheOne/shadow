# ANNA AI Avatar Integration

## Обзор

ANNA - это системный AI аватар и маскот платформы Shadow.AI. Она интегрирована через HeyGen API и появляется в дашборде и профилях пользователей как интерактивный AI ассистент.

## Технические детали

### HeyGen API интеграция

**Avatar ID:** `1652863dc2354b499db342a63feca19a`  
**API Key:** `sk_V2_hgu_kopfRDfTPGY_BkryZF2yQAxMZZsd6XmAjg8BbMsZvLrU`

### Компоненты

#### 1. AnnaAvatar (основной компонент)
```typescript
<AnnaAvatar 
  variant="dashboard" | "profile" | "meeting" | "notification"
  size="sm" | "md" | "lg" | "xl"
  showControls={boolean}
  autoPlay={boolean}
  message={string}
  className={string}
/>
```

#### 2. Специализированные компоненты
- `AnnaDashboard` - для главной страницы дашборда
- `AnnaProfile` - для профилей пользователей
- `AnnaMeeting` - для митингов
- `AnnaNotification` - для уведомлений

### API Endpoints

#### POST `/api/heygen/video`
Создание видео с ANNA

**Параметры:**
```json
{
  "text": "Текст для озвучки",
  "type": "welcome" | "meeting_start" | "meeting_end" | "meeting_reminder" | "notification",
  "userName": "Имя пользователя (для welcome)"
}
```

**Ответ:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "video_id": "string",
    "video_url": "string",
    "duration": 10,
    "status": "pending" | "processing" | "completed" | "failed"
  }
}
```

#### GET `/api/heygen/video?videoId={id}`
Получение статуса видео

**Ответ:**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "video_id": "string",
    "video_url": "string",
    "status": "pending" | "processing" | "completed" | "failed",
    "progress": 50,
    "duration": 10
  }
}
```

### HeyGen Service

```typescript
// Создание видео с ANNA
const response = await heygenService.createAnnaVideo("Привет! Я ANNA");

// Приветственное видео
const welcome = await heygenService.createAnnaWelcomeVideo("Иван");

// Видео для митинга
const meeting = await heygenService.createAnnaMeetingVideo("Важная встреча", "start");

// Уведомление
const notification = await heygenService.createAnnaNotificationVideo("Новое сообщение");
```

## Использование

### В дашборде
```tsx
import { AnnaDashboard } from "@/components/anna-avatar";

// В секции приветствия
<AnnaDashboard />
```

### В профилях
```tsx
import { AnnaProfile } from "@/components/anna-avatar";

// В профиле пользователя
<AnnaProfile />
```

### В митингах
```tsx
import { AnnaMeeting } from "@/components/anna-avatar";

// С кастомным сообщением
<AnnaMeeting message="Митинг начинается!" />
```

### В уведомлениях
```tsx
import { AnnaNotification } from "@/components/anna-avatar";

// С сообщением уведомления
<AnnaNotification message="У вас новое сообщение" />
```

## Стилизация

### Варианты (variants)
- `dashboard` - сине-фиолетовый градиент
- `profile` - зелено-бирюзовый градиент  
- `meeting` - красно-розовый градиент
- `notification` - желто-оранжевый градиент

### Размеры (sizes)
- `sm` - 64x64px
- `md` - 96x96px (по умолчанию)
- `lg` - 128x128px
- `xl` - 192x192px

### Контролы
- Play/Pause кнопка
- Mute/Unmute кнопка
- Автоматическое воспроизведение
- Hover эффекты

## Особенности

### Автоматическая генерация
- Приветственное видео генерируется автоматически
- Поддержка кастомных сообщений
- Кэширование созданных видео

### Интерактивность
- Клик для воспроизведения/паузы
- Hover для показа контролов
- Адаптивный дизайн

### Производительность
- Ленивая загрузка видео
- Оптимизированные размеры
- Плавные анимации

## Конфигурация

### Environment переменные
```bash
# HeyGen API
HEYGEN_API_KEY=""
HEYGEN_ANNA_AVATAR_ID=""
HEYGEN_ANNA_VOICE_ID=""

# Публичные ключи для клиента
NEXT_PUBLIC_HEYGEN_API_KEY=""
NEXT_PUBLIC_HEYGEN_ANNA_AVATAR_ID=" "
NEXT_PUBLIC_HEYGEN_ANNA_VOICE_ID=" "
```

## Интеграция с AI агентами

### ANNA как AI ассистент
ANNA интегрирована с системой AI агентов и может:

1. **Представлять агентов**: ANNA может представлять любого AI агента в видеовызовах
2. **Голосовое взаимодействие**: Пользователи могут говорить с ANNA, которая передает сообщения AI агенту
3. **Персонализация**: ANNA адаптируется под характер и стиль конкретного агента
4. **Мультиязычность**: Поддержка разных языков в зависимости от настроек агента

### Техническая реализация
```typescript
// В компоненте AI агента
<AnnaProfile 
  agentId={agent.id}
  agentName={agent.name}
  agentPersonality={agent.personality}
  isActive={agent.isActive}
/>
```

### Где увидеть ANNA:
- **Дашборд** (`/dashboard`) - в секции приветствия
- **Профили** (`/dashboard/profile/[id]`) - у каждого пользователя
- **AI агенты** (`/dashboard/agents`) - как представитель агентов
- **Митинги** - можно добавить в будущем
- **Уведомления** - можно добавить в будущем

## Будущие улучшения

### Планируемые фичи
- [x] Голосовое взаимодействие с ANNA
- [x] Персонализированные сообщения
- [x] Интеграция с AI агентами
- [ ] Анимации и жесты
- [ ] Многоязычная поддержка
- [ ] Кастомные аватары

### Технические улучшения
- [ ] WebRTC для real-time видео
- [ ] Кэширование на CDN
- [ ] Адаптивное качество видео
- [ ] Офлайн режим
- [ ] Аналитика использования

## Troubleshooting

### Частые проблемы

1. **Видео не загружается**
   - Проверить API ключи
   - Проверить сетевое соединение
   - Проверить статус HeyGen API

2. **Ошибки генерации**
   - Проверить лимиты API
   - Проверить формат текста
   - Проверить длину сообщения

3. **Проблемы с воспроизведением**
   - Проверить поддержку видео формата
   - Проверить автоплей политики браузера
   - Проверить мобильную совместимость

### Логирование
```typescript
// Включить детальное логирование
console.log('ANNA Video Generation:', {
  text,
  type,
  response: videoResponse
});
```

## Заключение

ANNA интегрирована как ключевая фича платформы Shadow.AI, обеспечивая персонализированный и интерактивный пользовательский опыт. Интеграция через HeyGen API позволяет создавать высококачественные AI аватары с естественной речью и мимикой.
