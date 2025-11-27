import { NextResponse } from "next/server";
import OpenAI from "openai";
import Exa from "exa-js";
import { SYSTEM_PROMPT } from "@/prompts";
import { searchPinecone, isPineconeConfigured } from "@/lib/pinecone";

export const maxDuration = 30;

const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
const isExaConfigured = !!process.env.EXA_API_KEY;

const pharmaRegex = /(dr\s?reddy|drreddy|sun\s?pharma|sunpharma|cipla|pharma|pharmaceutical|drug|medicine|tablet|capsule|dosage|clinical|trial|fda|ema|revenue|financial|earnings|profit|income|balance sheet|cash flow|ebitda|margin|sales|growth|segment|product|pipeline|market|share|competitor|analysis|quarterly|annual|fy|fiscal|q[1-4]|financial statements?)/i;
const webSearchRegex = /(search|find|look up|latest|news|current|today|recent|what is happening|trending|update)/i;

export async function POST(req: Request) {
  try {
    if (!isOpenAIConfigured) {
      return NextResponse.json({
        role: "assistant",
        content: "OpenAI API key is not configured. Please add your OPENAI_API_KEY in the Secrets panel.",
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { messages } = await req.json();

    const normalizedMessages = (messages || []).map((m: any) => {
      let content = "";
      if (typeof m.content === "string") content = m.content;
      else if (Array.isArray(m.content)) {
        const t = m.content.find((p: any) => p.type === "text");
        content = t?.text ?? "";
      } else if (Array.isArray(m.parts)) {
        const t = m.parts.find((p: any) => p.type === "text");
        content = t?.text ?? "";
      }
      return { ...m, content: (content || "").trim() };
    });

    const latestUser = [...normalizedMessages].reverse().find((m: any) => m.role === "user");
    const userQuery = latestUser?.content || "";

    if (!userQuery) {
      return NextResponse.json({
        role: "assistant",
        content: "Please enter a message.",
      });
    }

    const isPharmaQuery = pharmaRegex.test(userQuery);
    const isWebSearchQuery = webSearchRegex.test(userQuery);
    let reply = "";
    let context = "";
    let usedWebSearch = false;

    // Determine the Pinecone namespace based on company mentioned
    let namespace = "default";
    if (userQuery.toLowerCase().includes("cipla")) {
      namespace = "cipla";
    } else if (/sun\s?pharma|sunpharma/i.test(userQuery)) {
      namespace = "sunpharma";
    } else if (/dr\s?reddy|drreddy/i.test(userQuery)) {
      namespace = "drreddy";
    }

    // Try Pinecone RAG first for pharma/financial queries
    if (isPharmaQuery && isPineconeConfigured) {
      try {
        const search = await searchPinecone(userQuery, namespace);
        const matches = search?.matches ?? [];
        context = matches
          .map(m => (m.metadata as any)?.text ?? "")
          .filter(Boolean)
          .join("\n\n");
      } catch (e) {
        console.error("RAG search failed:", e);
      }
    }

    // Fallback to web search if RAG didn't find relevant context or for web search queries
    if ((!context.trim() || isWebSearchQuery) && isExaConfigured) {
      try {
        const exa = new Exa(process.env.EXA_API_KEY);
        const { results } = await exa.search(userQuery, {
          contents: { text: true },
          numResults: 3,
        });
        if (results.length > 0) {
          context = results
            .map(r => `Source: ${r.title}\nURL: ${r.url}\n${r.text?.slice(0, 500) || ""}`)
            .join("\n\n---\n\n");
          usedWebSearch = true;
        }
      } catch (e) {
        console.error("Web search failed:", e);
      }
    }

    const systemMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (context.trim()) {
      systemMessages.push({
        role: "system",
        content: `Here is relevant context to help answer the user's question:\n\n${context}`,
      });
    }

    // Include recent conversation history (last 2-3 messages) for context
    const recentMessages = normalizedMessages.slice(-4).map((m: any) => ({
      role: m.role,
      content: m.content || "",
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        ...systemMessages,
        ...recentMessages,
      ],
    });

    reply = completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return NextResponse.json({
      role: "assistant",
      content: reply,
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return NextResponse.json({
      role: "assistant",
      content: "Something went wrong. Please try again.",
    });
  }
}
