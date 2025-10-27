Radon Web+AI Browser — Technical Architecture & Concept Document

1. Vision

Create a next-generation browser that merges Chromium-level performance with an integrated AI assistant capable of understanding the full browsing context. The AI sidebar acts as a copilot — assisting with research, summarization, code, and navigation. Built with a lightweight Rust + Next.js 16 stack and a neutral glass aesthetic.


---

2. Technology Stack

Layer Technology Purpose

UI / Frontend Next.js 16 + shadcn/ui + TailwindCSS Reactive UI with glass/neutral design and modular components
Desktop Shell Tauri 2.0 (Rust) Lightweight alternative to Electron. Secure bridge between frontend and system APIs
Backend Core Rust + Cargo + Axum Handles AI requests, session mgmt, context cache, file ops
AI Integration GigaChat API via Rust bridge Contextual assistant embedded in browser with full DOM awareness
Voice Input Web Speech API / Whisper API Voice search and command input
Build Tools Bun (frontend) + Cargo (backend) Fast builds and local packaging
Data Sync / Storage IndexedDB + Local KV + optional encrypted sync Session persistence and semantic history



---

3. System Architecture

High-level flow:

[User UI (Next.js)] <-> [Tauri IPC Bridge] <-> [Rust Core Backend] <-> [GigaChat API]
                                                    |
                                               [Whisper / Voice]
                                                    |
                                             [Local Cache / DB]

UI Layer (Next 16) — all windows, tabs, and panels rendered as React components.

Rust Core — manages tabs, system integration, AI context pipeline, voice IO, and caching.

AI Bridge — relays DOM or textual context to GigaChat and streams structured responses to the sidebar.

Voice Module — converts voice → text (Whisper) and optionally text → speech (TTS).


https://nextjs.org/blog/next-16
---

4. Feature Set

Feature Description

🧭 Smart Tabs Group and organize tabs by domain, intent, or project. Show previews with semantic search.
🧠 AI Sidebar GigaChat-powered copilot that reads the current page, explains, summarizes, or finds data.
🔍 Voice Search Trigger via microphone icon. Speech recognized via Whisper or Web Speech.
📚 Semantic History Search history not by title but by meaning ("find that tutorial about Rust bindings").
🔒 Private Mode / Sandboxing Per-tab isolated cookies, storage, and AI context.
⚙️ Settings Panel Manage AI permissions, privacy, voice, and model tuning.
🎨 Glass / Neutral Theme Modern frosted-glass design with blur, low contrast, and minimal chroma.
🌐 Multi-Language Support Russian / English UI toggle.

5. User Flow

1. Startup  → App boots via Tauri → loads Next UI → initializes AI core and local cache.

2. Browsing  → User opens tab(s). Rust backend monitors page title, content, metadata.

3. AI Context  → DOM text is sent via IPC to GigaChat. AI sidebar displays suggestions or summaries.

4. Voice Mode  → User triggers mic → Whisper transcribes → AI executes command (e.g., "find latest docs").

5. Smart History  → IndexedDB stores semantic vectors of each visited page for recall.

6. Settings / Privacy  → User toggles AI permissions or clears contextual memory.


---

6. UI Layout / Browser Grid

Section Component Description

Top Bar Command Palette + Search + Voice + Profile Unified control strip with command input and status
Tab Strip Dynamic groupable tabs Rendered via glassy flex container, hover previews
Main View Embedded WebView (Chromium/Tauri WebView) Core content rendering surface
AI Sidebar (Right) Chat + Context + Actions GigaChat assistant with live context integration
Bottom Bar Status / Network / Mode Indicators Minimal, semi-transparent


Grid Schema:

-------------------------------------------------------------


| Command Bar | Voice | Search | Profile                    |
 ------------------------------------------------------------
| Tabs: [Home][GitHub][Docs][AI Session]                    |
-------------------------------------------------------------
|  WebView (content)               |  AI Sidebar (chat)     |
|                                  |------------------------|
|                                  |  Actions / Settings    |
 ------------------------------------------------------------
|               Status / Logs / Privacy Icon                |
 -----------------------------------------------------------

7. Development Structure
radon-browser/
├── frontend/ (Next.js 16)
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── styles/
│   └── lib/
├── src-tauri/ (Rust)
│   ├── main.rs
│   ├── commands/
│   ├── ai_bridge.rs
│   ├── context_manager.rs
│   └── voice.rs
├── public/
├── package.json
├── Cargo.toml
└── README.dev.md
---
8. Cursor Prompt (Canvas Brief)
Purpose: Define project intent for automated code generation and prototyping.
Prompt:
 Project Name: Radon Web+AI Browser
Goal: Build a lightweight browser desktop app using Next.js 16 + Tauri (Rust) with a GigaChat-powered AI assistant embedded in a sidebar that understands browsing context and user intent.
Style: neutral / glass UI using shadcn/ui and TailwindCSS.
Include components: Command Bar, Tab Strip, WebView, AI Sidebar, Settings Panel.
Implement IPC bridge for AI requests, DOM extraction, and voice input handling.
Deliver modular, production-ready architecture focusing on privacy, speed, and AI-native UX.



9. Next Steps
[]check this project.new version(16+)  https://nextjs.org/blog/next-16 

[ ] Scaffold Tauri backend with Rust IPC | doc : https://v2.tauri.app/start/frontend/nextjs/

[ ] Implement WebView integration and tab state

[ ] Add AI Sidebar (frontend component)

[ ] Build Rust module for GigaChat integration

[ ] Add Whisper/Web Speech voice mode

[ ] Polish glass theme + animations

Style Deep Dark(bg dark neutral shadcn base style theme + glass(no gradient,shape other. ))
Chromium grade style(tabs,input search,adress bar,ai and etc)

---

Outcome: A fully documented architecture that merges Rust-native performance, modern React UI, and GigaChat-driven intelligence — setting the stage for Radon’s next evolution.