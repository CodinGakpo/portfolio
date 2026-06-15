# 🚀 Adidev Anand | Interactive Developer Portfolio

An immersive, highly interactive portfolio built with modern web technologies. This portfolio replaces the traditional static website experience with a dynamic, hacker-style interface featuring a fully functional Linux-inspired terminal and an integrated AI twin.

## 🌐 Live Demo
[https://adidev.dev] *(Update with actual deployment URL)*

## 🧠 Overview

This project is a modern showcase of my skills as a **Full Stack Developer & AWS Cloud Architect**. It pairs high-fidelity visual design (glassmorphism, smooth scroll animations) with complex interactive elements that cater directly to developers and technical recruiters.

The standout feature is a globally accessible, draggable terminal interface. Users can navigate the site via standard shell commands (`ls`, `cd`, `cat`) or chat directly with an AI assistant trained on my professional background.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Custom CSS (Vanilla)
- **Animations:** GSAP (GreenSock)
- **State Management:** Zustand
- **AI Integration:** Google Generative AI (Gemini 3.0 Flash)

## 🎯 Key Features

### ✨ 1. Fully Functional Terminal Interface
- **Global Access:** Toggle via the floating action button (FAB) or the standard `Ctrl + \`` keyboard shortcut across Linux/Windows.
- **Window Management:** Draggable window, minimizing, and maximizing functionality mimicking a real desktop OS.
- **Command Routing:** Fully implemented shell commands:
  - `whoami` — Displays professional summary.
  - `ls` — Explore projects and skills directories.
  - `cd <section>` — Closes the terminal and smooth-scrolls to the requested section.
  - `cat <file>` — Read project details or open the resume PDF.
  - `open <link>` — Direct links to GitHub, LinkedIn, etc.
  - `history` — Logs session commands.

### 🤖 2. Embedded AI Twin (Gemini 3.0 Flash)
- **`ask <question>` command:** Chat directly with an AI representation of me.
- **Server-Side Security:** The system prompt and API key are completely hidden on the server (`/api/chat`).
- **Streaming Responses:** Real-time chunked responses fed directly into the terminal UI for an authentic shell-script feel.

### 🎬 3. Scroll-Driven Storytelling & UI
- **GSAP-powered Animations:** High-performance scroll-synced transitions and entrance animations.
- **Dynamic Marquees & Spotlights:** High-fidelity expertise cards with cursor-reactive glow effects.
- **Glassmorphism:** Premium frosted-glass aesthetics across the navigation, cards, and terminal.

### 🧩 4. Data-Driven Architecture
- **Single Source of Truth:** All portfolio content (projects, bio, skills, achievements) lives inside `app/data/data.ts`.
- **Zero Hardcoding:** UI components and terminal commands dynamically read from the data source, making updates frictionless.

## 🧱 Project Structure

```bash
app/
 ├── api/
 │   └── chat/route.ts      # Gemini AI backend route
 ├── components/
 │   ├── common/            # Navbar, TerminalController
 │   ├── hero/              # Hero section components
 │   ├── terminal/          # Terminal UI, command registry, and logic
 │   └── ...                # Other section components (About, Projects, etc.)
 ├── data/
 │   └── data.ts            # Centralized content repository
 ├── stores/                # Zustand state (terminalStore.ts)
 ├── layout.tsx             # Root layout & global logic
 ├── page.tsx               # Main entry point
 └── globals.css            # Global styling and terminal CSS

public/                     # Static assets (resume, images)
```

## 🚀 Running Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables (Create a `.env.local` file):
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser. Press `Ctrl + \`` to open the terminal.