// =============================================
// FIN-X Pharma Configuration File
// =============================================
import OpenAI from "openai";



export const AI_NAME = "FIN-X Pharma";

// Use a deterministic, reliable model (gpt-4-level)


export const MODEL = "gpt-4o-mini";


// Default maximum duration for a chat completion
export const maxDuration = 30;

// Tool routing behavior — keep this strict for ER tasks
export const ROUTING_CONFIG = {
  forceToolCall: false,   // allow model to choose tools when needed
  preferTools: true,      // encourage tool usage for KPIs, FDA, guidance, RAG
  enforceStructuredOutput: true,
};

// Standardized metadata for uploads (will be used later)
export const DEFAULT_COMPANY = "Dr. Reddy’s Laboratories";
export const DEFAULT_SECTOR = "Pharmaceuticals";

// Add a timestamp helper (optional)
export const DATE_AND_TIME = () => new Date().toISOString();

// Owner name (optional, used in some boilerplates)
export const OWNER_NAME = "FIN-X Team";

export const CLEAR_CHAT_TEXT = "New chat";

export const WELCOME_MESSAGE = `I can provide insights on pharmaceutical companies like Dr. Reddy's, Cipla, Sun Pharma, and others, as well as analyze financial metrics, product pipelines, clinical trials, regulatory matters, and market positioning. If you have specific queries, feel free to ask!`;

export const PINECONE_TOP_K = 40;
export const PINECONE_INDEX_NAME = "my-ai";

