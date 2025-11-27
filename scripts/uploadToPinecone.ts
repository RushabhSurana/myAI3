import fs from "fs";
import path from "path";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import dotenv from "dotenv";
import { PDFParse } from "pdf-parse";

dotenv.config();

// ----------------------------------------------------
// Utility: Chunk long text into smaller pieces
// ----------------------------------------------------
function chunkText(text: string, chunkSize = 800): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// ----------------------------------------------------
// Initialize OpenAI + Pinecone
// ----------------------------------------------------
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? process.env.PINECONE_INDEX;
// Accept common typo PINECODE_HOST for convenience.
const PINECONE_HOST = process.env.PINECONE_HOST ?? process.env.PINECODE_HOST;

if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
if (!PINECONE_API_KEY) throw new Error("Missing PINECONE_API_KEY");
if (!PINECONE_INDEX_NAME) throw new Error("Missing PINECONE_INDEX_NAME (or PINECONE_INDEX)");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = PINECONE_HOST
  ? pinecone.index(PINECONE_INDEX_NAME, PINECONE_HOST).namespace("default")
  : pinecone.index(PINECONE_INDEX_NAME).namespace("default");

// ----------------------------------------------------
// Main Function: Upload PDF → Pinecone
// ----------------------------------------------------
async function uploadToPinecone(pdfPath: string) {
  try {
    console.log(`Reading PDF from ${pdfPath}...`);

    if (!fs.existsSync(pdfPath)) {
      throw new Error("PDF file not found.");
    }

    const fileBuffer = fs.readFileSync(pdfPath);
    const pdf = new PDFParse({ data: fileBuffer });
    const parsed = await pdf.getText();

    const rawText = parsed.text;
    console.log("PDF extract length:", rawText.length);

    const chunks = chunkText(rawText);
    console.log(`Created ${chunks.length} chunks`);

    console.log("Uploading to Pinecone...");

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // ---- Create embedding for each chunk ----
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: chunk,
      });

      const vector = embeddingResponse.data[0].embedding;

      // ---- Upsert into Pinecone ----
      await index.upsert([
        {
          id: `chunk-${i}`,
          values: vector,
          metadata: {
            text: chunk,
            page: i + 1,
            source: path.basename(pdfPath),
          },
        },
      ]);

      console.log(`Uploaded chunk ${i + 1}/${chunks.length}`);
    }

    console.log("Upload complete!");
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

// CLI argument handling
const pdfPath = process.argv[2];
if (!pdfPath) {
  console.log("Usage: npx ts-node --esm scripts/uploadToPinecone.ts <pdf-file>");
  process.exit(1);
}

uploadToPinecone(pdfPath);
