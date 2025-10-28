# Stream.io Setup Guide

## Получение API ключей

1. Зайдите на [https://getstream.io/](https://getstream.io/)
2. Создайте аккаунт или войдите в существующий
3. Создайте новое приложение
4. Скопируйте API Key и API Secret

## Настройка переменных окружения

Добавьте в файл `.env`:

```env
# Stream.io API Keys
STREAM_API_KEY=5fx5jamxpm78
STREAM_API_SECRET=nggcbyszguqwt8efems9pbx7yhh6gkqpcqzhvd3hmwhfkbae62ye6rey9e2x7xzv
NEXT_PUBLIC_STREAM_API_KEY=5fx5jamxpm78
```

## 🚀 **Продвинутые фичи Stream.io**

### 🤖 **Voice Agents с OpenAI**
- ✅ **Real-time Voice AI** - голосовые агенты в митингах
- ✅ **OpenAI Integration** - интеграция с OpenAI Realtime API
- ✅ **Low Latency** - WebRTC для минимальной задержки
- ✅ **Customizable** - полный контроль над AI поведением

### 🎨 **Background Effects**
- ✅ **Background Blur** - размытие фона
- ✅ **Virtual Backgrounds** - виртуальные фоны
- ✅ **Custom Backgrounds** - загрузка собственных фонов
- ✅ **Real-time Processing** - обработка в реальном времени

### 📝 **Audio Transcription**
- ✅ **Live Transcription** - транскрипция в реальном времени
- ✅ **Speaker Identification** - идентификация говорящих
- ✅ **Confidence Scoring** - оценка точности
- ✅ **Export Options** - экспорт в различные форматы

### 📞 **Video Calling Features**
- ✅ **HD Video Calls** до 1080p
- ✅ **Screen Sharing** - демонстрация экрана
- ✅ **Meeting Recording** - запись митингов
- ✅ **Participant Management** - управление участниками
- ✅ **Noise Cancellation** - шумоподавление

### 💬 **Chat Messaging**
- ✅ **Real-time Chat** - чат в реальном времени
- ✅ **File Sharing** - обмен файлами
- ✅ **Reactions & Emojis** - реакции и эмодзи
- ✅ **Notifications** - уведомления

### 🧠 **AI Integration**
- ✅ **Custom AI Agents** - кастомные AI агенты
- ✅ **GigaChat Integration** - российский AI
- ✅ **OpenAI Integration** - международный AI
- ✅ **Voice Interaction** - голосовое взаимодействие

## 🔧 **Техническая реализация**

### Voice Agents
```typescript
// Подключение Voice Agent к звонку
async function connectAgent(call: Call) {
  const res = await fetch(`${baseUrl}/${call.type}/${call.id}/connect`, {
    method: "POST",
  });
  
  if (res.status !== 200) {
    throw new Error("Could not connect agent");
  }
}
```

### Background Effects
- **Blur Effects** - автоматическое размытие фона
- **Virtual Backgrounds** - предустановленные фоны
- **Custom Upload** - загрузка собственных изображений
- **Real-time Processing** - обработка в реальном времени

### Audio Transcription
- **Live Captions** - субтитры в реальном времени
- **Speaker Detection** - определение говорящего
- **Confidence Levels** - уровни уверенности
- **Export Formats** - TXT, SRT, VTT

## 📋 **Готово к использованию**

1. **Настройте Stream API ключи** в `.env`
2. **Запустите dev сервер**: `npm run dev`
3. **Создайте AI агента** в разделе Agents
4. **Создайте митинг** с AI агентом
5. **Присоединитесь к митингу** и тестируйте все фичи!

## 🎯 **Что работает**

- **Видео звонки** в стиле Zoom с HD качеством
- **Voice Agents** с OpenAI Realtime API
- **Background Effects** - blur, virtual, custom
- **Audio Transcription** - live captions
- **AI агенты** отвечают голосом в реальном времени
- **Текстовый чат** с участниками митинга
- **Запись митингов** в облако
- **Управление участниками** и правами доступа

## 🔗 **Полезные ссылки**

- [Stream Voice Agents](https://getstream.io/video/voice-agents/)
- [Stream Video Calling](https://getstream.io/video/video-calling/)
- [Stream Livestreaming](https://getstream.io/video/livestreaming/)
- [Stream Documentation](https://getstream.io/docs/)