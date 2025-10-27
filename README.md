# Shadow AI - AI-Powered Video Meeting Platform

A modern AI-powered video meeting platform with intelligent avatars, real-time collaboration, and enterprise-grade features.

## 🚀 Features

- **AI-Powered Meetings**: Custom AI agents for intelligent meeting assistance
- **Real-time Video**: High-quality video calls with Stream.io integration
- **AI Avatars**: Interactive HeyGen/D-ID avatars for meetings
- **Voice Transcription**: Deepgram-powered real-time speech-to-text
- **Meeting Recordings**: Automatic recording and storage
- **Dark Premium UI**: Glass morphism design with Tailwind CSS
- **Multi-platform Auth**: GitHub, Google, and email authentication
- **Subscription System**: Free/Pro/Enterprise tiers with usage limits

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, tRPC, Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: Better Auth
- **Video Calls**: Stream.io
- **AI Services**: GigaChat, HeyGen, D-ID, Deepgram
- **File Storage**: AWS S3
- **Background Jobs**: Inngest

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys for external services (see .env.example)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shadow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your API keys and configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # Reusable UI components
├── lib/                    # Utility functions and configurations
├── modules/                # Feature-specific modules
│   ├── agents/            # AI agents functionality
│   ├── meetings/          # Meeting management
│   ├── subscriptions/     # Subscription system
│   └── ...
├── db/                     # Database schema and connection
├── trpc/                   # tRPC configuration
└── ...
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Drizzle Studio

## 📚 API Documentation

### Authentication
- POST `/api/auth/sign-in` - Sign in user
- POST `/api/auth/sign-up` - Register user
- POST `/api/auth/sign-out` - Sign out user

### Meetings
- GET `/api/meetings` - Get user's meetings
- POST `/api/meetings` - Create new meeting
- GET `/api/meetings/[id]` - Get meeting details
- PUT `/api/meetings/[id]` - Update meeting
- DELETE `/api/meetings/[id]` - Delete meeting

### AI Agents
- GET `/api/agents` - Get user's AI agents
- POST `/api/agents` - Create new AI agent
- GET `/api/agents/[id]` - Get agent details
- PUT `/api/agents/[id]` - Update agent
- DELETE `/api/agents/[id]` - Delete agent

### AI Chat
- POST `/api/ai/chat` - Send message to AI assistant

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support, please contact the development team.