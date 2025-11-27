# PillMetrix

**AI-Powered Research Assistant for Pharmaceutical Companies & Financial Analysis**

PillMetrix is an intelligent chatbot that specializes in pharmaceutical industry research and financial analysis. It combines document-based knowledge retrieval (RAG) with real-time web search to provide comprehensive, data-grounded answers about pharmaceutical companies, financials, clinical trials, and market insights.

![PillMetrix](./public/logo.png)

## Overview

PillMetrix is an AI-powered research assistant that delivers intelligent, data-backed insights for pharmaceutical and financial professionals:

- **Pharmaceutical Intelligence**: Company analysis, clinical trials, regulatory information (FDA, EMA)
- **Financial Analysis**: Revenue, earnings, profit margins, EBITDA, quarterly/annual performance
- **Intelligent Routing**: Automatically routes queries to documents (Pinecone) or web search (Exa)
- **Real-time Information**: Falls back to web search when documents lack current data
- **Professional Insights**: Maintains equity research analyst tone with proper citations
- **Content Moderation**: Ensures safe, appropriate interactions

The application is designed for pharmaceutical equity researchers, financial analysts, and investment professionals who need reliable, sourced information.

## 🌟 Key Features

- **Intelligent Query Routing**: Automatically detects query type and routes to optimal data source
- **Document-Based RAG**: Searches internal pharmaceutical research documents via Pinecone
- **Real-time Web Search**: Falls back to Exa API for current information when needed
- **Financial Analysis**: Recognizes and analyzes revenue, earnings, margins, and other metrics
- **Company-Specific Intelligence**: Supports Dr. Reddy's, Cipla, Sun Pharma, and others
- **Professional Tone**: Maintains equity research analyst voice throughout
- **Source Attribution**: Natural citations without mentioning internal tools
- **Clean UI**: Modern, responsive interface with message persistence

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 16 + Turbopack, TypeScript, Tailwind CSS, Radix UI |
| **Backend** | Node.js 20, Vercel AI SDK |
| **AI Model** | OpenAI GPT-4o-mini (configurable) |
| **Vector DB** | Pinecone (RAG) |
| **Web Search** | Exa API |
| **Deployment** | Replit Autoscale / Vercel |

## 📋 Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Required API Keys**:
  - `OPENAI_API_KEY` - For AI model (Required)
  - `EXA_API_KEY` - For web search (Optional)
  - `PINECONE_API_KEY` - For vector database (Optional)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/pillmetrix.git
cd pillmetrix
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Create .env.local
OPENAI_API_KEY=your_openai_key
EXA_API_KEY=your_exa_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
PINECONE_HOST=your_host_url
```

### 4. Run Development Server
```bash
npm run dev
# App runs at http://localhost:5000
```

### 5. Build & Deploy
```bash
npm run build
npm start
```

## 📁 Project Structure

```
pillmetrix/
├── app/                    # Next.js App Router
│   ├── api/chat/route.ts  # Chat API endpoint
│   ├── page.tsx           # Chat interface
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ai-elements/       # AI-specific UI
│   ├── messages/          # Message components
│   └── ui/                # Reusable UI
├── lib/
│   ├── pinecone.ts        # Vector DB integration
│   ├── moderation.ts      # Content moderation
│   └── utils.ts           # Utilities
├── public/
│   ├── logo.png          # PillMetrix logo
│   └── favicon.png       # Browser icon
├── config.ts             # App configuration
├── prompts.ts            # AI system prompts
└── next.config.ts        # Next.js config
```

## ⚙️ Configuration

### `config.ts` - Application Settings
```typescript
export const AI_NAME = "PillMetrix";  // Bot name
export const OWNER_NAME = "Rushabh Surana";  // Creator
export const MODEL = "gpt-4o-mini";  // AI model
export const PINECONE_INDEX_NAME = "my-ai";  // Vector DB index
```

### `prompts.ts` - AI Behavior
Defines how the AI responds:
- Core capabilities and identity
- Financial analysis instructions
- Pharma research guidelines
- Citation and sourcing rules
- Professional tone guidelines

### Query Routing
Automatic intelligent routing:
| Query Type | Trigger Keywords | Route |
|-----------|------------------|-------|
| Pharma | drug, clinical, FDA, medicine | Pinecone |
| Financial | revenue, earnings, EBITDA | Pinecone |
| Web Search | latest, news, trending | Exa API |
| Fallback | No document match | Exa API |

## 🔄 How It Works

```
User Query
  ↓
Detect Type (Pharma/Financial/Web)
  ↓
Try Pinecone RAG First
  ↓
If No Results → Exa Web Search
  ↓
Combine Context + System Prompt
  ↓
OpenAI Generates Response
  ↓
Natural Citation (No Tool Mentions)
  ↓
Response to User
```

## 🔐 API Keys & Secrets

Store securely in your deployment platform (Replit Secrets, Vercel Env Vars):

| Key | Provider | Purpose | Required |
|-----|----------|---------|----------|
| `OPENAI_API_KEY` | [OpenAI](https://platform.openai.com/api-keys) | AI Model & Moderation | ✅ Yes |
| `EXA_API_KEY` | [Exa](https://dashboard.exa.ai/) | Web Search | Optional |
| `PINECONE_API_KEY` | [Pinecone](https://app.pinecone.io/) | Vector DB | Optional |
| `PINECONE_INDEX_NAME` | Pinecone | Index Name | If using |
| `PINECONE_HOST` | Pinecone | Host URL | If using |

**Get API Keys:**
1. OpenAI: Create account → API Keys → Generate key
2. Exa: Sign up → Dashboard → API key
3. Pinecone: Create account → Create index → Get credentials

## Customization Guide

### Changing the AI's Name and Identity

1. Open `config.ts`
2. Modify `AI_NAME` and `OWNER_NAME`
3. Update `WELCOME_MESSAGE` if desired
4. Commit and push changes to trigger a new Vercel deployment

### Adjusting AI Behavior

1. Open `prompts.ts`
2. Edit the relevant prompt section:
   - `TONE_STYLE_PROMPT` - Change communication style
   - `GUARDRAILS_PROMPT` - Modify safety rules
   - `TOOL_CALLING_PROMPT` - Adjust when tools are used
   - `CITATIONS_PROMPT` - Change citation format
3. Commit and push changes to trigger a new Vercel deployment

### Customizing Moderation Messages

1. Open `config.ts`
2. Find the `MODERATION_DENIAL_MESSAGE_*` constants
3. Update the messages to match your brand voice
4. These messages appear when content is flagged

### Changing the AI Model

1. Open `config.ts`
2. Modify the `MODEL` export (line 4)
3. Available models depend on your AI SDK provider
4. Update API keys in `.env.local` if switching providers

### Adding or Removing Tools

Tools are located in `app/api/chat/tools/`. To add a new tool:

1. Create a new file in `app/api/chat/tools/`
2. Import and add it to `app/api/chat/route.ts` in the `tools` object
3. Add UI display logic in `components/messages/tool-call.tsx`
4. See `AGENTS.md` for more technical details

## Architecture Overview

The application follows a simple request-response flow:

1. **User sends message** → `app/page.tsx` (UI)
2. **Message sent to API** → `app/api/chat/route.ts`
3. **Content moderation check** → `lib/moderation.ts`
4. **AI processes with tools** → Model uses web search and/or vector search as needed
5. **Response streamed back** → UI displays response in real-time

The AI can autonomously decide to:

- Answer directly
- Search the web for current information
- Search your vector database for stored knowledge
- Combine multiple sources

All responses include citations when sources are used.

## Troubleshooting

### AI not responding

- Verify `OPENAI_API_KEY` is set correctly in Vercel environment variables
- Check browser console for error messages
- Ensure the API key has sufficient credits/quota
- Check Vercel deployment logs for errors

### Web search not working

- Verify `EXA_API_KEY` is set in Vercel environment variables
- Check Exa API dashboard for usage limits
- Tool will gracefully fail if API key is missing

### Vector search not working

- Verify `PINECONE_API_KEY` is set in Vercel environment variables
- Check that `PINECONE_INDEX_NAME` in `config.ts` matches your Pinecone index
- Ensure your Pinecone index exists and has data

### Deployment issues

- Check Vercel deployment logs for build errors
- Verify all environment variables are set in Vercel project settings
- Ensure your Vercel project is connected to the correct Git repository

## Next Steps

1. **Customize branding**: Update `config.ts` with your name and AI assistant name

2. **Adjust prompts**: Modify `prompts.ts` to match your use case and tone

3. **Set up knowledge base**: Configure Pinecone and upload your documents

4. **Test moderation**: Verify moderation messages match your needs

5. **Deploy**: Build and deploy to your hosting platform (Vercel, AWS, etc.)

## Support

For technical questions about tool integration, see `AGENTS.md`.

For deployment issues, check the Vercel deployment logs and browser console for error messages.

---

**Remember**: Most customization happens in `config.ts` and `prompts.ts`. Start there!
