import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

// Resolve Pinecone configuration from env with a small typo fallback for host.
const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME ?? process.env.PINECONE_INDEX;
const host = process.env.PINECONE_HOST ?? process.env.PINECODE_HOST;

if (!apiKey) throw new Error("Missing PINECONE_API_KEY");
if (!indexName) throw new Error("Missing PINECONE_INDEX_NAME (or PINECONE_INDEX)");

export const pineconeClient = new Pinecone({ apiKey });

// If a host is provided (serverless), use it; otherwise let the SDK resolve it.
export const pineconeIndex = host
  ? pineconeClient.index(indexName, host)
  : pineconeClient.index(indexName);

// Default namespace used across the app.
export const pineconeNamespace = pineconeIndex.namespace("default");

// Shared OpenAI client for Pinecone RAG helpers.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Perform a Pinecone vector search for the given query in the specified namespace.
 * Returns the raw Pinecone response for downstream context handling.
 */
export async function searchPinecone(query: string, namespace = "default") {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
  });

  const vector = embedding.data[0].embedding;

  const response = await pineconeIndex.namespace(namespace).query({
    vector,
    topK: 8,
    includeMetadata: true,
  });

  return response;
}
