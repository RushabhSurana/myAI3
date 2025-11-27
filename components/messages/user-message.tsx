import { Response } from "@/components/ai-elements/response";

type Message = {
  id: string;
  role: string;
  content: string;
};

export function UserMessage({ message }: { message: Message }) {
    const text = message?.content || "";

    return (
        <div className="whitespace-pre-wrap w-full flex justify-end animate-fade-in">
            <div className="max-w-xl w-fit px-4 py-3 rounded-2xl bg-gradient-to-br from-[#1fc8db] to-[#2cb5e8] text-white shadow-md">
                <div className="text-sm leading-relaxed">
                    <Response key={message.id}>{text}</Response>
                </div>
            </div>
        </div>
    )
}
