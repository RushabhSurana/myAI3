# MyAI3 - AI Chatbot Assistant

## Overview
This is a customizable AI chatbot assistant built with Next.js 16, featuring web search capabilities, vector database integration, and content moderation. The application enables AI-powered conversations with support for tool calling (web search, vector database search) and comprehensive content moderation.

## Recent Changes
- **2024-11-27**: Imported project to Replit environment
  - Configured Next.js to bind to 0.0.0.0:5000 for Replit proxy compatibility
  - Set up Next.js dev server workflow on port 5000
  - Configured deployment settings for autoscale deployment
  - Installed all npm dependencies (836 packages)

## Project Architecture

### Tech Stack
- **Framework**: Next.js 16.0.0 with Turbopack
- **Runtime**: Node.js 20.19.3, npm 10.8.2
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **AI SDK**: Vercel AI SDK with multiple provider support
- **UI Components**: Radix UI, custom components

### Key Dependencies
- **AI Providers**: OpenAI, Groq, Fireworks, DeepSeek, xAI
- **Vector Database**: Pinecone
- **Web Search**: Exa API
- **UI**: React 19.2.0, Radix UI components
- **Other**: React Hook Form, Zod validation, Recharts

### Project Structure
```
myAI3/
├── app/                  # Next.js App Router
│   ├── api/chat/        # Chat API endpoint
│   │   ├── route.ts     # Main chat handler
│   │   └── tools/       # AI tools (web search, vector search)
│   ├── page.tsx         # Main chat interface
│   ├── parts/           # UI components
│   └── terms/           # Terms of Use page
├── components/          # React components
│   ├── ai-elements/    # AI-specific UI
│   ├── messages/       # Message display
│   └── ui/             # Reusable UI components
├── lib/                # Utility libraries
│   ├── moderation.ts   # Content moderation
│   ├── pinecone.ts     # Vector DB integration
│   └── sources.ts      # Citation handling
├── types/              # TypeScript definitions
├── config.ts           # Main configuration
├── prompts.ts          # AI behavior/prompts
└── package.json        # Dependencies
```

### Environment Configuration
This application requires the following environment variables:
- `OPENAI_API_KEY` - Required for AI model and moderation
- `EXA_API_KEY` - Optional, for web search functionality
- `PINECONE_API_KEY` - Optional, for vector database search
- `PINECONE_INDEX_NAME` - Optional, Pinecone index name
- `PINECONE_HOST` - Optional, Pinecone host URL
- `FIREWORKS_API_KEY` - Optional, alternative AI provider

**Note**: Set these in the Replit Secrets panel for security.

## Development Workflow

### Running Locally
The Next.js dev server is configured to run on port 5000 bound to 0.0.0.0:
```bash
npm run dev
```

The workflow is already set up and will start automatically.

### Building for Production
```bash
npm run build
```

### Deployment
This project is configured for Replit Autoscale deployment:
- Build command: `npm run build`
- Run command: `npm run start`
- Port: 5000 (automatically configured)

## Key Customization Files

### config.ts
Primary configuration file containing:
- AI name and owner name
- Welcome messages
- Moderation messages
- Model configuration
- Pinecone settings

### prompts.ts
AI behavior configuration:
- Identity prompts
- Tool calling instructions
- Tone and style guidelines
- Guardrails and safety rules
- Citation formatting

## Features
1. **AI Chat**: Powered by OpenAI GPT (configurable)
2. **Web Search**: Real-time web search via Exa API
3. **Vector Search**: Knowledge base search via Pinecone
4. **Content Moderation**: Automatic content safety checks
5. **Citations**: Source tracking and citation display
6. **Streaming Responses**: Real-time AI response streaming

## User Preferences
None configured yet.

## Development Notes
- Next.js uses Turbopack for faster builds
- All hosts allowed for Replit proxy compatibility
- Server actions experimental feature enabled
- TypeScript strict mode enabled
- React 19 with JSX runtime
