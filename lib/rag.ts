import OpenAI from "openai";
import { pineconeNamespace } from "@/lib/pinecone";

// Shared OpenAI client for embedding + completion.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Create an embedding for the query, run a Pinecone vector search,
 * and return the matched chunk text content.
 */
export async function getMatchesFromPinecone(query: string): Promise<string[]> {
  if (!query.trim()) return [];

  // Generate embedding using the same model as ingestion (3072-dim).
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
  });

  const vector = embedding.data[0].embedding;

  const response = await pineconeNamespace.query({
    topK: 5,
    vector,
    includeMetadata: true,
  });

  // Extract chunk text from metadata; fall back to an empty array if none found.
  const chunks =
    response.matches
      ?.map(match => {
        const metadata = match.metadata as { text?: string };
        return metadata?.text ?? "";
      })
      .filter(Boolean) ?? [];

  return chunks;
}

/**
 * Build a context string the model can reference.
 */
export function buildContextFromMatches(matches: string[]): string {
  return matches
    .map((chunk, idx) => `Chunk ${idx + 1}:\n${chunk}`)
    .join("\n\n");
}
