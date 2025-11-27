import dotenv from "dotenv";
dotenv.config();

import fs from "fs/promises";
import { Dirent } from "fs";
import path from "path";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";

// Root folder that contains per-namespace subfolders with PDFs.
// Example: data/drreddy/*.pdf -> namespace "drreddy"
const DATA_ROOT = path.resolve("data");
const MAX_RETRIES = 3;
const BATCH_SIZE = 100;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

if (!pineconeApiKey) throw new Error("Missing PINECONE_API_KEY");
if (!pineconeIndexName) throw new Error("Missing PINECONE_INDEX_NAME");

const pinecone = new Pinecone({ apiKey: pineconeApiKey });
const index = pinecone.index(pineconeIndexName);

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    start += size - overlap;
  }
  return chunks;
}

async function embedText(input: string) {
  const { data } = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input,
  });
  return data[0].embedding;
}

async function upsertWithRetry(namespace: string, vectors: any[]) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await index.namespace(namespace).upsert(vectors);
      return;
    } catch (err) {
      const isLast = attempt === MAX_RETRIES;
      console.error(
        `Pinecone upsert failed (attempt ${attempt}/${MAX_RETRIES}) for namespace "${namespace}":`,
        (err as Error).message
      );
      if (isLast) throw err;
    }
  }
}

async function ingestPdf(namespace: string, pdfPath: string) {
  const pdfName = path.basename(pdfPath);
  console.log(`Ingesting: ${namespace}/${pdfName}`);

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await fs.readFile(pdfPath);
  } catch (err) {
    console.error(`  Failed to read ${pdfName}:`, (err as Error).message);
    return { chunksUploaded: 0 };
  }

  let text: string;
  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const parsed = await parser.getText();
    text = parsed.text;
  } catch (err) {
    console.error(`  Failed to parse ${pdfName}:`, (err as Error).message);
    return { chunksUploaded: 0 };
  }

  const chunks = chunkText(text, 1000, 200);
  console.log(`  Extracted ${chunks.length} chunks`);

  let uploaded = 0;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const vectors = [];

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      const globalIdx = i + j;
      const chunkId = `${pdfName}_${globalIdx}`;

      try {
        const values = await embedText(chunk);
        vectors.push({
          id: chunkId,
          values,
          metadata: {
            pdf_name: pdfName,
            company: namespace,
            chunk_id: globalIdx,
            text: chunk,
          },
        });
      } catch (err) {
        console.error(
          `  Embedding failed for chunk ${chunkId}:`,
          (err as Error).message
        );
      }
    }

    if (!vectors.length) continue;

    try {
      await upsertWithRetry(namespace, vectors);
      uploaded += vectors.length;
    } catch (err) {
      console.error(
        `  Failed to upload batch starting at chunk ${i}:`,
        (err as Error).message
      );
    }
  }

  console.log(
    `  Uploaded ${uploaded} vectors to namespace "${namespace}"`
  );

  return { chunksUploaded: uploaded };
}

async function main() {
  let totalPdfs = 0;
  let totalChunks = 0;
  const namespaces: Set<string> = new Set();

  let entries: Dirent[];
  try {
    entries = await fs.readdir(DATA_ROOT, { withFileTypes: true });
  } catch (err) {
    console.error("Failed to read data/pdfs directory:", (err as Error).message);
    process.exit(1);
  }

  for (const dirent of entries) {
    if (!dirent.isDirectory()) continue;
    const namespace = dirent.name;
    const folderPath = path.join(DATA_ROOT, namespace);

    let files: Dirent[];
    try {
      files = await fs.readdir(folderPath, { withFileTypes: true });
    } catch (err) {
      console.error(
        `Failed to read folder ${folderPath}:`,
        (err as Error).message
      );
      continue;
    }

    const pdfFiles = files
      .filter(f => f.isFile() && f.name.toLowerCase().endsWith(".pdf"))
      .map(f => path.join(folderPath, f.name));

    if (!pdfFiles.length) {
      console.log(`Skipping empty folder: ${namespace}`);
      continue;
    }

    namespaces.add(namespace);

    for (const pdfFile of pdfFiles) {
      const { chunksUploaded } = await ingestPdf(namespace, pdfFile);
      if (chunksUploaded > 0) {
        totalPdfs += 1;
        totalChunks += chunksUploaded;
      }
    }
  }

  console.log("DONE.");
  console.log(`Total PDFs processed: ${totalPdfs}`);
  console.log(`Total chunks uploaded: ${totalChunks}`);
  console.log(`Namespaces: [${Array.from(namespaces).join(", ")}]`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
