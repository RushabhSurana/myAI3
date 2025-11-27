import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/prompts";
import { searchPinecone } from "@/lib/pinecone";

export const maxDuration = 30;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const companyRegex = /(dr\s?reddy|drreddy|sun\s?pharma|sunpharma|cipla)/i;

export async function POST(req: Request) {
  try {
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

    const isCompanyQuery = companyRegex.test(userQuery);
    let reply = "";

    if (isCompanyQuery) {
      try {
        const namespace = userQuery.includes("cipla")
          ? "cipla"
          : /sun\s?pharma|sunpharma/i.test(userQuery)
          ? "sunpharma"
          : "drreddy";

        const search = await searchPinecone(userQuery, namespace);
        const matches = search?.matches ?? [];
        const context = matches
          .map(m => (m.metadata as any)?.text ?? "")
          .filter(Boolean)
          .join("\n\n");

        if (!context.trim()) {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userQuery },
            ],
          });
          reply = completion.choices[0]?.message?.content || "";
        } else {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "assistant", content: "Retrieved context:\n" + context },
              { role: "user", content: userQuery },
            ],
          });
          reply = completion.choices[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("RAG path failed, falling back to base model:", e);
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userQuery },
          ],
        });
        reply = completion.choices[0]?.message?.content || "";
      }
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userQuery },
        ],
      });
      reply = completion.choices[0]?.message?.content || "";
    }

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
