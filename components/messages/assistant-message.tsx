import { Response } from "@/components/ai-elements/response";
import { ReasoningPart } from "./reasoning-part";
import { ToolCall, ToolResult } from "./tool-call";

type Message = {
  id: string;
  role: string;
  content: string;
};

export function AssistantMessage({ message, status, isLastMessage, durations, onDurationChange }: { message: Message; status?: string; isLastMessage?: boolean; durations?: Record<string, number>; onDurationChange?: (key: string, duration: number) => void }) {
    const text = message?.content || "";

    return (
        <div className="w-full animate-fade-in">
            <div className="text-sm flex flex-col gap-4">
                <div className="max-w-xl w-fit px-4 py-3 rounded-2xl bg-white text-[#111] border border-[#e5e5e5] shadow-sm">
                    <Response key={message.id}>{text}</Response>
                </div>
            </div>
        </div>
    )
}
