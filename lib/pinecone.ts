import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME ?? process.env.PINECONE_INDEX;
const host = process.env.PINECONE_HOST ?? process.env.PINECODE_HOST;

export const isPineconeConfigured = !!(apiKey && indexName);

let pineconeClient: Pinecone | null = null;
let pineconeIndex: ReturnType<Pinecone["index"]> | null = null;

if (isPineconeConfigured) {
  pineconeClient = new Pinecone({ apiKey: apiKey! });
  pineconeIndex = host
    ? pineconeClient.index(indexName!, host)
    : pineconeClient.index(indexName!);
}

export { pineconeClient, pineconeIndex };

export async function searchPinecone(query: string, namespace = "default") {
  if (!isPineconeConfigured || !pineconeIndex) {
    console.warn("Pinecone not configured, skipping vector search");
    return { matches: [] };
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

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
