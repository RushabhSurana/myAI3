import { useEffect, useRef } from "react";
import { UserMessage } from "./user-message";
import { AssistantMessage } from "./assistant-message";

type Message = {
  id: string;
  role: string;
  content: string;
};

export function MessageWall({ messages, status, durations, onDurationChange }: { messages: Message[]; status?: string; durations?: Record<string, number>; onDurationChange?: (key: string, duration: number) => void }) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!Array.isArray(messages)) {
        return null;
    }

    return (
        <div className="relative max-w-[750px] w-full mx-auto">
            <div className="relative flex flex-col gap-4">
                {messages.map((message, messageIndex) => {
                    const isLastMessage = messageIndex === messages.length - 1;
                    return (
                        <div key={message.id || messageIndex} className="w-full">
                            {message.role === "user" ? (
                                <UserMessage message={message} />
                            ) : (
                                <AssistantMessage
                                    message={message}
                                    status={status}
                                    isLastMessage={isLastMessage}
                                    durations={durations}
                                    onDurationChange={onDurationChange}
                                />
                            )}
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
